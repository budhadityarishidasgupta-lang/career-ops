import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import yaml from 'js-yaml';

export async function GET() {
  try {
    // 1. Fetch Applications with Job Details
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
    `;

    // 3. Load Pipeline from current_eval.json & Enrich with DB data
    const pipelinePath = path.join(process.cwd(), '..', 'data', 'current_eval.json');
    let pipeline = [];
    
    // Fetch all jobs for metadata lookup
    const allJobs = await sql`SELECT url, title, company, score, source FROM jobs`;
    const jobMap = new Map(allJobs.map((j: any) => [j.url, j]));

    if (fs.existsSync(pipelinePath)) {
      const rawData = JSON.parse(fs.readFileSync(pipelinePath, 'utf8'));
      pipeline = Object.entries(rawData).map(([k, v]: any) => {
        const dbMatch = jobMap.get(v.url);
        return {
          ...v,
          pipeline_id: k,
          // Enrich with DB data if available
          title: v.title || dbMatch?.title || 'Unknown Role',
          source: v.source || dbMatch?.source || 'Discovery',
          score: v.score || dbMatch?.score || 0
        };
      });
    }

    // 4. Scan Output for PDFs
    const outDir = path.join(process.cwd(), '..', 'output');
    let pdfs: any[] = [];
    if (fs.existsSync(outDir)) {
      pdfs = fs.readdirSync(outDir)
        .filter(f => f.endsWith('.pdf'))
        .map(f => ({ name: f, mtime: fs.statSync(path.join(outDir, f)).mtime }));
    }

    // 5. Load Profile from root profile.yml
    const profilePath = path.join(process.cwd(), '..', 'config', 'profile.yml');
    let profile = null;
    if (fs.existsSync(profilePath)) {
      profile = yaml.load(fs.readFileSync(profilePath, 'utf8'));
    }

    return NextResponse.json({
      applications,
      pipeline,
      pdfs,
      stats: stats[0],
      profile,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
