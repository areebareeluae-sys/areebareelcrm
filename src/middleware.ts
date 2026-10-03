import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Check karein ke user login hai ya nahi (Cookie ke zariye)
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

  // 2. Protected Routes (Space error fix kar di gayi hai)
  const isProtectedRoute = 
    path.startsWith('/dashboard') || 
    path.startsWith('/profile') || 
    path.startsWith('/users/create');

  // 3. Auth Routes (Login / Home page)
  const isAuthRoute = path === '/' || path === '/login';

  // Scenario A: Agar user login nahi hai aur protected page khol raha hai -> Login page par bhej dein
  // (Agar aapka login page '/' hai toh '/' रहने dein, agar '/login' hai toh wahan redirect karein)
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url)); // ya '/' agar root hi login page hai
  }

  // Scenario B: Agar user pehle se login hai aur auth route par jana chahta hai -> Dashboard par bhej dein
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 4. Matcher configuration
export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/users/create/:path*',
    '/profile/:path*',
  ],
};