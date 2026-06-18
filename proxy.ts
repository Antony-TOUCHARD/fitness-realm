import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/workouts',
  '/conquest',
  '/leaderboard',
]

// Routes that should always be accessible
const PUBLIC_ROUTES = ['/login', '/onboarding']

// Check if Supabase is configured with real credentials
function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !url || url.includes('your-project') || url === 'https://your-project.supabase.co'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let API routes, public routes, and static assets pass through
  if (
    pathname.startsWith('/api/') ||
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next()
  }

  // Only run auth check on protected routes
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  // In demo mode, bypass Supabase auth entirely — allow all routes
  if (isDemoMode()) {
    return NextResponse.next()
  }

  // Create a Supabase client wired to the request/response cookies
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on the request (for downstream)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Recreate the response so Set-Cookie headers are forwarded
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session (important for token rotation)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - icons (PWA icons)
     * - sw.js (service worker)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|sw.js).*)',
  ],
}
