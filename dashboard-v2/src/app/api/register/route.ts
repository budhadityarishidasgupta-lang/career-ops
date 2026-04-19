import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User in DB
    const [user] = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name || null}, ${email}, ${hashedPassword})
      RETURNING id, name, email
    `;

    // 4. Initialize User Profile for Onboarding Checklist
    await sql`
      INSERT INTO user_profiles (user_id, resume_context, targeting_keywords)
      VALUES (${user.id}, ${sql.json({})}, ${sql.json({ positive: [], negative: [] })})
      ON CONFLICT (user_id) DO NOTHING
    `;

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email } 
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
