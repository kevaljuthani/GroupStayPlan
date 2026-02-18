import { NextRequest } from 'next/server';
import { getAdminCookieName } from './auth';

export function isAdminRequest(request: NextRequest) {
  return request.cookies.get(getAdminCookieName())?.value === '1';
}
