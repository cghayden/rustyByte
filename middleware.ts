import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/admin', '/profile', '/dashboard', '/create'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

// Helper function to check if a path is a challenge route (/:category/:challenge)
function isChallengeRoute(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  // Challenge routes have exactly 2 parts: category and challenge slug
  // Exclude known non-challenge routes
  const excludedRoutes = ['admin', 'profile', 'dashboard', 'login', 'register', 'api', 'create'];
  if (parts.length >= 1 && !excludedRoutes.includes(parts[0])) {
    return true; // This is a category or challenge route
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a challenge route
  const isChallenge = isChallengeRoute(pathname);

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Simple token existence check (detailed verification happens in page components)
  const hasToken = !!token;

  // Handle protected routes and challenge routes
  if ((isProtectedRoute || isChallenge) && !hasToken) {
    // Redirect to login if trying to access protected route without valid token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes (login/register)
  if (isAuthRoute && hasToken) {
    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Admin route authorization is handled in the page component
  // (requires database query for role check)

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
