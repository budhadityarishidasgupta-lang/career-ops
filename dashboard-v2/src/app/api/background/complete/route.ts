import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-worker-secret') || '';
  const expected = process.env.WORKER_WEBHOOK_SECRET || '';
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const userId = String((body as any).user_id || '').trim();
  const actionScript = String((body as any).action_script || '').trim();
  const actionArgs = String((body as any).action_args || '').trim();
  const status = String((body as any).status || '').trim(); // success | failure | cancelled
  const runUrl = String((body as any).run_url || '').trim();

  if (!userId || !actionScript || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Ensure table exists (keeps deploys simple across DBs)
  await sql`
    CREATE TABLE IF NOT EXISTS background_events (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      action_script TEXT NOT NULL,
      action_args TEXT,
      status TEXT NOT NULL,
      run_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS background_events_user_id_created_at_idx ON background_events (user_id, created_at DESC);`;

  const rows = await sql`
    INSERT INTO background_events (user_id, action_script, action_args, status, run_url)
    VALUES (${userId}, ${actionScript}, ${actionArgs || null}, ${status}, ${runUrl || null})
    RETURNING id, created_at
  `;

  return NextResponse.json({ ok: true, id: rows[0]?.id, created_at: rows[0]?.created_at });
}

