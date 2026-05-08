/**
 * Backup/restore tests for config/profile.yml.
 *
 * The wizard writes profile.yml on /api/onboard/finalize. Before overwriting
 * an existing profile, the server must:
 *   1. Snapshot the existing file to profile.yml.bak.{timestamp}
 *   2. Keep the most recent 10 backups; GC older ones
 *   3. Never lose user data, even on partial-write failure
 *
 * These tests exercise the real /api/onboard/finalize flow against a tmp
 * config dir so disk + GC behavior is real.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile, stat, utimes } from 'node:fs/promises';
import path from 'node:path';
import { bootServer, fetchPort } from './_helpers/boot-server.mjs';

// Wizard payload uses a nested structure — basics / target_roles /
// compensation / narrative — matching what validateOnboardPayload expects.
function buildPayload(overrides = {}) {
  const basics = {
    full_name: 'Backup Tester',
    email: 'backup@example.com',
    phone: '+1 555 0100',
    location: 'Remote',
    linkedin: '',
    headline: 'QA',
    ...(overrides.basics || {}),
  };
  return {
    basics,
    target_roles: overrides.target_roles || ['Engineer'],
    compensation: { target_range: '', minimum: '', currency: 'USD', location_flexibility: '' },
    deal_breakers: [],
    narrative: {
      superpowers: ['Bug-finder'],
      best_achievement: 'Found three regressions before launch',
      proof_points: [],
    },
  };
}

async function postFinalize(srv, payload) {
  return fetchPort(srv.port, '/api/onboard/finalize', {
    method: 'POST',
    headers: {
      'Origin': srv.baseUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

test('backup/restore — profile.yml', async (t) => {
  await t.test('first finalize writes profile.yml, no backup yet', async () => {
    const srv = await bootServer();
    t.after(srv.cleanup);
    const r = await postFinalize(srv, buildPayload());
    assert.equal(r.statusCode, 200);
    const json = JSON.parse(r.body.toString());
    assert.equal(json.ok, true);

    const yml = await readFile(path.join(srv.cfgDir, 'profile.yml'), 'utf8');
    assert.match(yml, /full_name: "Backup Tester"/);

    // No .bak files should exist on a fresh install
    const entries = await readdir(srv.cfgDir);
    const baks = entries.filter(f => f.startsWith('profile.yml.bak.'));
    assert.equal(baks.length, 0, `no backups on first write, got ${baks}`);
  });

  await t.test('second finalize creates a .bak.{timestamp} of the previous file', async () => {
    const srv = await bootServer();
    t.after(srv.cleanup);

    await postFinalize(srv, buildPayload({ basics: { full_name: 'First Save', email: 'first@example.com' } }));
    // Read the contents we just saved
    const firstYml = await readFile(path.join(srv.cfgDir, 'profile.yml'), 'utf8');
    assert.match(firstYml, /First Save/);

    await postFinalize(srv, buildPayload({ basics: { full_name: 'Second Save', email: 'second@example.com' } }));
    const secondYml = await readFile(path.join(srv.cfgDir, 'profile.yml'), 'utf8');
    assert.match(secondYml, /Second Save/);

    // Exactly one backup, with the FIRST contents
    const entries = await readdir(srv.cfgDir);
    const baks = entries.filter(f => f.startsWith('profile.yml.bak.'));
    assert.equal(baks.length, 1, `one backup after second save, got ${baks.length}`);
    const bakContent = await readFile(path.join(srv.cfgDir, baks[0]), 'utf8');
    assert.match(bakContent, /First Save/, 'backup contains the previous (First Save) version');
  });

  await t.test('rotation: keeps the 10 newest backups, deletes the rest', async () => {
    const srv = await bootServer();
    t.after(srv.cleanup);

    // Pre-seed 12 fake backups with different mtimes (older first)
    const cfgDir = srv.cfgDir;
    await writeFile(path.join(cfgDir, 'profile.yml'), 'baseline: true\n', 'utf8');
    const now = Date.now();
    const fakeBaks = [];
    for (let i = 0; i < 12; i++) {
      const stamp = `2025-01-01T00-${String(i).padStart(2,'0')}-00.000Z`;
      const f = path.join(cfgDir, `profile.yml.bak.${stamp}`);
      await writeFile(f, `# bak ${i}\n`, 'utf8');
      // Set mtime so oldest = i=0, newest = i=11
      const mtime = new Date(now - (12 - i) * 60_000);
      await utimes(f, mtime, mtime);
      fakeBaks.push(f);
    }

    // Now finalize — server should create one more backup AND GC oldest
    await postFinalize(srv, buildPayload());

    const entries = await readdir(cfgDir);
    const baks = entries.filter(f => f.startsWith('profile.yml.bak.'));
    assert.ok(baks.length <= 10, `at most 10 backups retained, got ${baks.length}`);
    // The two oldest fake-baks should be gone
    const remaining = new Set(baks);
    assert.ok(!remaining.has('profile.yml.bak.2025-01-01T00-00-00.000Z'),
      'oldest fake-bak was GC\'d');
    assert.ok(!remaining.has('profile.yml.bak.2025-01-01T00-01-00.000Z'),
      'second-oldest fake-bak was GC\'d');
  });

  await t.test('backup is created BEFORE the new file is written (atomic-ish)', async () => {
    const srv = await bootServer();
    t.after(srv.cleanup);

    await postFinalize(srv, buildPayload({ basics: { full_name: 'Original', email: 'orig@example.com' } }));
    const originalYml = await readFile(path.join(srv.cfgDir, 'profile.yml'), 'utf8');

    await postFinalize(srv, buildPayload({ basics: { full_name: 'Replacement', email: 'rep@example.com' } }));

    // The .bak file should contain the ORIGINAL contents, exactly
    const entries = await readdir(srv.cfgDir);
    const bak = entries.find(f => f.startsWith('profile.yml.bak.'));
    assert.ok(bak, 'backup exists');
    const bakContent = await readFile(path.join(srv.cfgDir, bak), 'utf8');
    assert.equal(bakContent, originalYml, 'backup is byte-identical to the previous file');
  });

  await t.test('readable backup mode (mode 0o644 or stricter)', async () => {
    const srv = await bootServer();
    t.after(srv.cleanup);
    await postFinalize(srv, buildPayload());
    await postFinalize(srv, buildPayload({ basics: { full_name: 'New', email: 'new@example.com' } }));
    const entries = await readdir(srv.cfgDir);
    const bak = entries.find(f => f.startsWith('profile.yml.bak.'));
    const st = await stat(path.join(srv.cfgDir, bak));
    // Backup must exist + be a regular file
    assert.ok(st.isFile(), 'backup is a regular file');
    // Size > 0 (proper copy, not empty)
    assert.ok(st.size > 0, `backup non-empty, got ${st.size}b`);
  });
});
