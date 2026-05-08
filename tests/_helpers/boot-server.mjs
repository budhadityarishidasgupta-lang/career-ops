/**
 * Shared test helper: boots a real server.mjs on a random port with isolated
 * tmp directories so the test never touches the user's real config / data /
 * reports. Importable from any *.test.mjs file under tests/.
 *
 * Returns: { port, baseUrl, child, cleanup() }
 *
 * Usage:
 *   import { bootServer } from './_helpers/boot-server.mjs';
 *   const srv = await bootServer();
 *   t.after(srv.cleanup);
 *   const r = await fetch(srv.baseUrl + '/api/health');
 */

import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const SERVER_MJS = path.join(ROOT, 'dashboard-web', 'server.mjs');

// Random port in the high range to dodge the dev server (4747) and any
// previously-leaked port from a crashed test run.
export function pickPort() {
  return 5100 + Math.floor(Math.random() * 600);
}

// Internal helper: write a {filename: contents} map into a directory.
// Creates parent directories on demand so callers can use nested paths.
async function seedDir(dir, files) {
  if (!files) return;
  for (const [filename, contents] of Object.entries(files)) {
    const target = path.join(dir, filename);
    await mkdir(path.dirname(target), { recursive: true });
    const body = typeof contents === 'string' ? contents : JSON.stringify(contents);
    await writeFile(target, body, 'utf8');
  }
}

export function fetchPort(port, pathname, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port,
      path: pathname,
      method: opts.method || 'GET',
      headers: opts.headers || {},
      timeout: opts.timeout || 5000,
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve({ statusCode: res.statusCode, headers: res.headers, body: buf });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('request timed out')));
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

/**
 * Boot the dashboard server in an isolated sandbox.
 *
 * @param {object} env  Extra environment variables (override defaults).
 * @param {object} options
 * @param {object} [options.seedData]    Map of {filename: contents} written into dataDir BEFORE boot
 * @param {object} [options.seedConfig]  Map of {filename: contents} written into cfgDir BEFORE boot
 * @param {object} [options.seedReports] Map of {filename: contents} written into reportsDir BEFORE boot
 * @returns {Promise<{port:number, baseUrl:string, child:any, cleanup:Function}>}
 */
export async function bootServer(env = {}, options = {}) {
  const port = pickPort();
  const cfgDir     = await mkdtemp(path.join(tmpdir(), 'hireloom-test-cfg-'));
  const dataDir    = await mkdtemp(path.join(tmpdir(), 'hireloom-test-data-'));
  const reportsDir = await mkdtemp(path.join(tmpdir(), 'hireloom-test-rep-'));

  // Seed files BEFORE the server boots so the boot-time loadTokens() /
  // loadCache() / etc. pick them up. Writing files post-boot is a recipe
  // for flaky tests because the server caches state in-memory.
  await seedDir(dataDir,    options.seedData);
  await seedDir(cfgDir,     options.seedConfig);
  await seedDir(reportsDir, options.seedReports);

  const child = spawn(process.execPath, [SERVER_MJS], {
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      CONFIG_DIR: cfgDir,
      DATA_DIR: dataDir,
      REPORTS_DIR: reportsDir,
      // Generous limits so tests don't hit rate-limit noise unless they want to
      RATE_GET_PER_MIN: env.RATE_GET_PER_MIN || '600',
      RATE_POST_PER_MIN: env.RATE_POST_PER_MIN || '120',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Capture stderr for diagnostics — surface it on boot failure but stay
  // silent on success so passing tests don't pollute the log.
  let stderr = '';
  child.stdout.on('data', () => {});
  child.stderr.on('data', c => { stderr += c.toString(); });

  // Poll /api/health until ready or timeout.
  const start = Date.now();
  const TIMEOUT_MS = 8000;
  while (Date.now() - start < TIMEOUT_MS) {
    try {
      const r = await fetchPort(port, '/api/health', { timeout: 1500 });
      if (r.statusCode === 200) {
        return {
          port,
          baseUrl: `http://127.0.0.1:${port}`,
          child,
          cfgDir,
          dataDir,
          reportsDir,
          cleanup: async () => {
            try { child.kill('SIGKILL'); } catch {}
            await Promise.allSettled([
              rm(cfgDir, { recursive: true, force: true }),
              rm(dataDir, { recursive: true, force: true }),
              rm(reportsDir, { recursive: true, force: true }),
            ]);
          },
        };
      }
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 100));
  }

  // Boot failed — kill child, cleanup tmp dirs, throw with stderr context
  try { child.kill('SIGKILL'); } catch {}
  await Promise.allSettled([
    rm(cfgDir, { recursive: true, force: true }),
    rm(dataDir, { recursive: true, force: true }),
    rm(reportsDir, { recursive: true, force: true }),
  ]);
  throw new Error(`server failed to boot within ${TIMEOUT_MS}ms\nstderr:\n${stderr}`);
}
