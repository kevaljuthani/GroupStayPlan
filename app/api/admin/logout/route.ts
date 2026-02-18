import { getAdminCookieName } from '@/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  cookies().delete(getAdminCookieName());
  return NextResponse.json({ ok: true });
}
