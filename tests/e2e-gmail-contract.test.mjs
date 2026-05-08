/**
 * Gmail OAuth contract tests.
 *
 * Boots the server with various Gmail-config states (using bootServer's
 * pre-seed feature so the server reads files at boot, not flakily after).
 * Verifies /api/gmail/status + /api/gmail/disconnect + /auth/gmail respond
 * correctly across states:
 *   - Unconfigured: status reports missingEnv
 *   - Configured but no tokens: hasTokens=false
 *   - Tokens valid: hasTokens=true, tokenExpired=false
 *   - Tokens expired: tokenExpired=true
 *   - access_token without refresh_token: treated as no-tokens
 *   - Cross-origin disconnect: 403
 *
 * No actual Google API calls are made — these are HTTP-contract tests.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootServer, fetchPort } from './_helpers/boot-server.mjs';

test('Gmail OAuth contract', async (t) => {
  await t.test('unconfigured state — status reports missingEnv', async () => {
    const srv = await bootServer({
      GMAIL_CLIENT_ID: '',
      GMAIL_CLIENT_SECRET: '',
    });
    t.after(srv.cleanup);
    const r = await fetchPort(srv.port, '/api/gmail/status');
    assert.equal(r.statusCode, 200);
    const json = JSON.parse(r.body.toString());
    assert.equal(json.configured, false);
    assert.equal(json.hasClientId, false);
    assert.equal(json.hasClientSecret, false);
    assert.deepEqual(json.missingEnv.sort(),
      ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET']);
  });

  await t.test('configured but no tokens — hasTokens=false', async () => {
    const srv = await bootServer({
      GMAIL_CLIENT_ID: 'fake-client-id.apps.googleusercontent.com',
      GMAIL_CLIENT_SECRET: 'GOCSPX-fakeSecretForTest',
    });
    t.after(srv.cleanup);
    const r = await fetchPort(srv.port, '/api/gmail/status');
    assert.equal(r.statusCode, 200);
    const json = JSON.parse(r.body.toString());
    assert.equal(json.configured, true);
    assert.equal(json.hasTokens, false);
    assert.equal(json.tokenExpired, null);
    assert.deepEqual(json.missingEnv, []);
  });

  await t.test('valid future tokens — hasTokens=true, tokenExpired=false', async () => {
    const futureExpiry = Date.now() + 3600_000;  // 1 hour from now
    const srv = await bootServer({
      GMAIL_CLIENT_ID: 'fake-client-id.apps.googleusercontent.com',
      GMAIL_CLIENT_SECRET: 'GOCSPX-fakeSecretForTest',
    }, {
      seedData: {
        'gmail-tokens.json': {
          access_token: 'fake-access',
          refresh_token: 'fake-refresh',
          expiry: futureExpiry,
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          token_type: 'Bearer',
        },
      },
    });
    t.after(srv.cleanup);

    const r = await fetchPort(srv.port, '/api/gmail/status');
    const json = JSON.parse(r.body.toString());
    assert.equal(json.hasTokens, true);
    assert.equal(json.tokenExpired, false);
    assert.ok(json.tokenExpiresIn > 3500 && json.tokenExpiresIn <= 3600,
      `expires within ~1h, got ${json.tokenExpiresIn}s`);
  });

  await t.test('expired tokens — tokenExpired=true', async () => {
    const pastExpiry = Date.now() - 1_000;
    const srv = await bootServer({
      GMAIL_CLIENT_ID: 'fake-client-id.apps.googleusercontent.com',
      GMAIL_CLIENT_SECRET: 'GOCSPX-fakeSecretForTest',
    }, {
      seedData: {
        'gmail-tokens.json': {
          access_token: 'expired-access',
          refresh_token: 'still-valid-refresh',
          expiry: pastExpiry,
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          token_type: 'Bearer',
        },
      },
    });
    t.after(srv.cleanup);

    const r = await fetchPort(srv.port, '/api/gmail/status');
    const json = JSON.parse(r.body.toString());
    assert.equal(json.hasTokens, true);
    assert.equal(json.tokenExpired, true);
    assert.equal(json.tokenExpiresIn, 0);
  });

  await t.test('access_token without refresh_token — treated as no-tokens', async () => {
    const srv = await bootServer({
      GMAIL_CLIENT_ID: 'fake-client-id.apps.googleusercontent.com',
      GMAIL_CLIENT_SECRET: 'GOCSPX-fakeSecretForTest',
    }, {
      seedData: {
        'gmail-tokens.json': {
          access_token: 'fake-access',
          // no refresh_token — single-use, can't survive expiry
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
        },
      },
    });
    t.after(srv.cleanup);

    const r = await fetchPort(srv.port, '/api/gmail/status');
    const json = JSON.parse(r.body.toString());
    assert.equal(json.hasTokens, false);
    assert.equal(json.tokenExpired, null);
  });

  await t.test('cached signals are surfaced in status payload', async () => {
    const srv = await bootServer({
      GMAIL_CLIENT_ID: 'fake-client-id.apps.googleusercontent.com',
      GMAIL_CLIENT_SECRET: 'GOCSPX-fakeSecretForTest',
    }, {
      seedData: {
        'gmail-cache.json': {
          scanned_at: Date.now() - 60_000,
          signals: [
            { id: '1', type: 'response', dismissed: false },
            { id: '2', type: 'rejection', dismissed: false },
            { id: '3', type: 'rejection', dismissed: true },
          ],
        },
      },
    });
    t.after(srv.cleanup);

    const r = await fetchPort(srv.port, '/api/gmail/status');
    const json = JSON.parse(r.body.toString());
    assert.equal(json.cachedSignalCount, 3);
    assert.equal(json.activeSignalCount, 2);
    assert.ok(json.lastScannedAt > 0);
  });

  await t.test('GET /api/gmail/disconnect → 404 (POST-only route)', async () => {
    const srv = await bootServer();
    t.after(srv.cleanup);
    const r = await fetchPort(srv.port, '/api/gmail/disconnect');
    // Server should NOT execute a destructive action under GET. 404 or 405
    // is acceptable; 200 would be a security regression.
    assert.ok([404, 405].includes(r.statusCode),
      `disconnect under GET should not execute, got ${r.statusCode}`);
  });

  await t.test('Cross-origin POST /api/gmail/disconnect blocked (CSRF)', async () => {
    const srv = await bootServer();
    t.after(srv.cleanup);
    const r = await fetchPort(srv.port, '/api/gmail/disconnect', {
      method: 'POST',
      headers: { Origin: 'https://evil.example.com' },
    });
    assert.equal(r.statusCode, 403);
  });
});
