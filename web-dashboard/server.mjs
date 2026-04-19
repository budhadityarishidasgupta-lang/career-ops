import { createServer } from 'http';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import yaml from 'js-yaml';
import sql from '../db/client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SHELL = process.env.SHELL || '/bin/zsh';

const jobsMap = new Map();
const PROFILE_PATH = join(ROOT, 'config/profile.yml');
const OUTPUT_DIR = join(ROOT, 'output');
const REPORTS_DIR = join(ROOT, 'reports');

let currentJobId = null;
let currentProc = null;

function createJob(id) {
  jobsMap.set(id, { lines: [], running: true, clients: new Set() });
}
function pushToJob(id, entry) {
  const job = jobsMap.get(id);
  if (!job) return;
  job.lines.push(entry);
  const msg = `data: ${JSON.stringify(entry)}\n\n`;
  job.clients.forEach(res => { try { res.write(msg); } catch {} });
}
function finishJob(id, code) {
  const job = jobsMap.get(id);
  if (!job) return;
  job.running = false;
  const done = { type: 'done', text: `[exit ${code}] ${code === 0 ? '✓ done' : '✗ failed'}`, code };
  job.lines.push(done);
  const msg = `data: ${JSON.stringify(done)}\n\n`;
  job.clients.forEach(res => { try { res.write(msg); res.end(); } catch {} });
  job.clients.clear();
  currentJobId = null;
}

async function getDashboardData() {
  const apps = await sql`
    SELECT a.*, j.company, j.title as role, j.score, j.url
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    ORDER BY a.applied_at DESC
    LIMIT 100
  `;

  const pipeline = await sql`
    SELECT * FROM jobs 
    WHERE id NOT IN (SELECT job_id FROM applications)
    ORDER BY score DESC, created_at DESC
    LIMIT 80
  `;

  const scans = await sql`
    SELECT portal, jobs_found, duration_ms, created_at 
    FROM scans 
    ORDER BY created_at DESC 
    LIMIT 5
  `;

  // aggregate everything for the home view
  const metrics = {
    total: parseInt((await sql`SELECT count(*) FROM applications`)[0].count),
    applied: parseInt((await sql`SELECT count(*) FROM applications WHERE status = 'APPLIED'`)[0].count),
    evaluated: parseInt((await sql`SELECT count(*) FROM jobs WHERE score > 0`)[0].count),
    interview: parseInt((await sql`SELECT count(*) FROM applications WHERE status = 'INTERVIEW'`)[0].count),
    offer: parseInt((await sql`SELECT count(*) FROM applications WHERE status = 'OFFER'`)[0].count),
    rejected: parseInt((await sql`SELECT count(*) FROM applications WHERE status = 'REJECTED'`)[0].count),
    avgScore: parseFloat((await sql`SELECT AVG(score) FROM jobs WHERE score > 0`)[0].avg || 0).toFixed(1),
    pendingPipeline: parseInt((await sql`SELECT count(*) FROM jobs WHERE id NOT IN (SELECT job_id FROM applications)`)[0].count),
    totalScans: scans.length,
    latestScanJobs: scans[0]?.jobs_found || 0
  };

  return { apps, pipeline, metrics };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (url.pathname === '/api/data') {
    try {
      const data = await getDashboardData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/analytics') {
    try {
      const sources = await sql`SELECT source, count(*)::int as count FROM jobs GROUP BY source ORDER BY count DESC`;
      const velocity = await sql`SELECT TO_CHAR(applied_at, 'YYYY-MM-DD') as day, count(*)::int as count FROM applications WHERE applied_at > now() - interval '7 days' GROUP BY day ORDER BY day ASC`;
      const funnel = (await sql`SELECT (SELECT count(*) FROM jobs)::int as scanned, (SELECT count(*) FROM jobs WHERE score > 0)::int as scored, (SELECT count(*) FROM applications)::int as applied`)[0];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ sources, velocity, funnel }));
    } catch (err) {
      res.writeHead(500); res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/fs-data') {
    try {
      const profile = yaml.load(readFileSync(PROFILE_PATH, 'utf8'));
      
      const pdfs = existsSync(OUTPUT_DIR) ? readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith('.pdf'))
        .map(f => {
          const s = statSync(join(OUTPUT_DIR, f));
          return { name: f, size: (s.size / 1024).toFixed(1) + ' KB', mtime: s.mtime };
        })
        .sort((a,b) => b.mtime - a.mtime) : [];

      const reports = existsSync(REPORTS_DIR) ? readdirSync(REPORTS_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => {
          const s = statSync(join(REPORTS_DIR, f));
          return { name: f, mtime: s.mtime };
        })
        .sort((a,b) => b.mtime - a.mtime) : [];

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ profile, pdfs, reports }));
    } catch (err) {
      res.writeHead(500); res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/exec' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      let cmd;
      try { cmd = JSON.parse(body).cmd?.trim(); } catch {}
      if (!cmd) { res.writeHead(400); res.end(JSON.stringify({ error: 'no cmd' })); return; }
      if (currentProc) { res.writeHead(409); res.end(JSON.stringify({ error: 'A command is already running' })); return; }

      const jobId = Date.now().toString(36);
      createJob(jobId);
      currentJobId = jobId;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, jobId }));

      const nvmDir = process.env.NVM_DIR || `${process.env.HOME}/.nvm`;
      pushToJob(jobId, { type: 'start', text: `$ ${cmd}` });

      // spawn the shell and source nvm just in case
      currentProc = spawn(SHELL, ['-c', `source "${nvmDir}/nvm.sh" 2>/dev/null; ${cmd}`], {
        cwd: ROOT, env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', TERM: 'dumb' }
      });
      currentProc.stdout.on('data', d => d.toString().split('\n').forEach(l => pushToJob(jobId, { type: 'stdout', text: l })));
      currentProc.stderr.on('data', d => d.toString().split('\n').forEach(l => pushToJob(jobId, { type: 'stderr', text: l })));
      currentProc.on('close', code => { finishJob(jobId, code ?? 0); currentProc = null; });
      currentProc.on('error', err => { pushToJob(jobId, { type: 'stderr', text: err.message }); finishJob(jobId, 1); currentProc = null; });
    });
    return;
  }

  if (url.pathname === '/api/events') {
    const jobId = url.searchParams.get('jobId');
    const job = jobsMap.get(jobId);
    if (!job) { res.writeHead(404); res.end('job not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
    job.lines.forEach(entry => res.write(`data: ${JSON.stringify(entry)}\n\n`));
    if (!job.running) { res.end(); return; }
    job.clients.add(res);
    req.on('close', () => job.clients.delete(res));
    return;
  }

  if (url.pathname === '/api/kill' && req.method === 'POST') {
    if (currentProc) currentProc.kill('SIGTERM');
    res.writeHead(200); res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ running: !!currentProc, jobId: currentJobId }));
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
    res.end(readFileSync(join(__dirname, 'index.html'), 'utf8'));
    return;
  }

  res.writeHead(404); res.end('Not found');
});

const PORT = 4242;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  🎯 career-ops dashboard persistent @ http://localhost:${PORT}\n`);
});
