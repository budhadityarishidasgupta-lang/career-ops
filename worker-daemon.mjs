import sql from './db/client.mjs';
import { spawn } from 'child_process';

const SCAN_INTERVAL_MS = 6 * 60 * 60 * 1000; // Run every 6 hours

console.log('🤖 Career-Ops Cloud Worker Initialized');

async function triggerScraper(userId) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶️ Starting Scan Sequence for User [${userId}]`);
    
    // Spawn the scraper sequence natively inside the docker runtime
    const child = spawn('node', ['scratch-scan.mjs'], {
      env: { ...process.env, SCAN_USER_ID: userId.toString() },
      stdio: 'inherit' // Stream output natively
    });

    child.on('close', (code) => {
      console.log(`\n✅ Scan Sequence for User [${userId}] completed with code ${code}`);
      resolve(code);
    });

    child.on('error', (err) => {
      console.error(`❌ Scan Sequence failed for User [${userId}]:`, err);
      reject(err);
    });
  });
}

async function daemonLoop() {
  while (true) {
    try {
      console.log('\n=============================================');
      console.log(`🕒 Polling active users [${new Date().toISOString()}]`);
      console.log('=============================================');
      
      const activeUsers = await sql`SELECT user_id FROM user_profiles ORDER BY updated_at DESC`;

      if (activeUsers.length === 0) {
        console.log('💤 No active profiles found in cluster. Sleeping...');
      } else {
        console.log(`📡 Discovered ${activeUsers.length} tenants. Dispatching scrapers sequentially...`);
        for (const tenant of activeUsers) {
          try {
             await triggerScraper(tenant.user_id);
          } catch(e) {
             console.log(`⚠️ User [${tenant.user_id}] encountered a scraper halt. Skipping to next.`);
          }
        }
      }
    } catch (e) {
      console.error('🔥 Fatal Worker Loop Crash:', e);
    }
    
    console.log(`\n⏳ Cluster settling. Next dispatch in ${SCAN_INTERVAL_MS / 1000 / 60 / 60} hours...`);
    await new Promise(resolve => setTimeout(resolve, SCAN_INTERVAL_MS));
  }
}

daemonLoop();
