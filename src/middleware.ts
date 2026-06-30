import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('agritayo_session');
  const role = request.cookies.get('agritayo_role')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/', '/market', '/live-tracking', '/analytics', '/system-settings', '/profile', '/post-harvest', '/my-orders', '/available-deliveries', '/my-deliveries', '/seller-orders'];

  if (!session && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (session) {
    if (pathname === '/system-settings' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
    if (pathname === '/profile' && role === 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname === '/post-harvest' && role !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname === '/my-orders' && role !== 'buyer') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if ((pathname === '/available-deliveries' || pathname === '/my-deliveries') && role !== 'driver') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/market', '/live-tracking', '/analytics', '/system-settings', '/profile', '/post-harvest', '/my-orders', '/login'],
};
