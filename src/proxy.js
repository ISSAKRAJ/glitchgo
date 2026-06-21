import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const isLocalEnv = process.env.NODE_ENV === 'development' || host.includes('localhost') || host.includes('127.0.0.1');

  // Enforce canonical www domain redirect in production
  if (!isLocalEnv && host === 'glitchgo.tech') {
    return NextResponse.redirect(`https://www.glitchgo.tech${url.pathname}${url.search}`, 301);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh token and retrieve user
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Protect the portal route
  if (url.pathname.startsWith('/portal')) {
    if (!user) {
      url.pathname = '/signin';
      url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  // 2. Redirect logged-in users trying to access signin/signup
  if (url.pathname === '/signin' || url.pathname === '/signup') {
    if (user) {
      url.pathname = '/portal';
      url.searchParams.delete('next');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static images / assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
