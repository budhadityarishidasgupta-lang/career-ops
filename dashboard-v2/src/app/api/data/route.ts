import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 1. Fetch Applications
    const applications = await sql`
      SELECT 
        a.id as app_id,
        a.status,
        a.applied_at,
        a.resume_file,
        j.company,
        j.title as role,
        j.url,
        j.score
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ${userId}
      ORDER BY a.applied_at DESC
    `;

    // 2. Fetch Stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'APPLIED') as applied,
        COUNT(*) FILTER (WHERE status = 'INTERVIEW') as interviews,
        COUNT(*) FILTER (WHERE status = 'OFFER') as offers
      FROM applications
      WHERE user_id = ${userId}
    `;

    // 3. Fetch Pipeline directly from jobs table (Multi-Tenant)
    const pipeline = await sql`
      SELECT id as pipeline_id, url, title, company, score, source, created_at
      FROM jobs
      WHERE user_id = ${userId}
        AND (score > 0 OR score IS NULL)
        AND id NOT IN (SELECT job_id FROM applications WHERE user_id = ${userId})
      ORDER BY score DESC, created_at DESC
    `;

    // 4. Fetch User Profile from DB
    const profileRow = await sql`
      SELECT resume_context, targeting_keywords 
      FROM user_profiles 
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    let profile = profileRow.length > 0 ? profileRow[0].resume_context : null;

    // 5. Fetch Generated Docs from DB (instead of local PDF files)
    let pdfs: any[] = [];
    try {
      const docs = await sql`
        SELECT id, company, title, updated_at
        FROM jobs
        WHERE user_id = ${userId} 
          AND (resume_html IS NOT NULL OR cover_letter_html IS NOT NULL)
        ORDER BY updated_at DESC
      `;
      pdfs = docs.map(d => ({
        id: d.id,
        name: `Tailored Assets: ${d.company} - ${d.title}`,
        mtime: d.updated_at
      }));
    } catch (colErr) {
      // If the columns don't exist yet, it means the user hasn't run 'tailor' since the update.
      // We gracefully ignore this error and return an empty docs list.
      pdfs = [];
    }

    return NextResponse.json({
      applications,
      pipeline,
      pdfs,
      stats: stats[0] || { total: 0, applied: 0, interviews: 0, offers: 0 },
      profile,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
