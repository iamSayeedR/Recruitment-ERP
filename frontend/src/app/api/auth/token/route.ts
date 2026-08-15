import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Server-side token endpoint.
 * Returns the current session's access token so client-side code
 * can attach it as a Bearer header without relying on getSession(),
 * which may return null during SSR hydration or initial render.
 *
 * This route is protected by the middleware: only authenticated requests
 * from the same origin can call it. The token itself is never stored
 * in a way the client JS can access the raw cookie — it comes through
 * this controlled route only.
 */
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const token =
    (session.user as any)?.accessToken ||
    (session as any)?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'No access token in session' }, { status: 401 });
  }

  return NextResponse.json({ accessToken: token });
}
