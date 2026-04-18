import { NextResponse, NextRequest } from "next/server";

// Protected routes that require authentication
const protectedRoutes = ["/portfolio", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Current Path: ${pathname}`);
  
  // URL STANDARDIZATION: Redirect top-level links to the default language explicitly
  const defaultLangRoutes = ["/portfolio", "/analysis", "/sectors", "/login", "/register", "/dashboard"];
  if (defaultLangRoutes.includes(pathname)) {
    console.log(`[Middleware] Redirecting ${pathname} to /en${pathname} for consistency`);
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
  }
  
  // Check if the path is a protected route (supporting both /route and /[locale]/route)
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || 
    pathname.endsWith(route) ||
    pathname.includes(`${route}/`)
  );
  
  console.log(`[Middleware] Is Protected Route: ${isProtectedRoute}`);
  
  if (isProtectedRoute) {
    // Check for auth token in cookies - check all possible session cookies
    const token = request.cookies.get("token")?.value;
    const sessionToken = request.cookies.get("next-auth.session-token")?.value;
    const secureSessionToken = request.cookies.get("__Secure-next-auth.session-token")?.value;
    
    // Also check if token cookie exists but might be empty
    const hasToken = !!(token && token.length > 0);
    const hasSession = !!(sessionToken && sessionToken.length > 0);
    const hasSecureSession = !!(secureSessionToken && secureSessionToken.length > 0);
    
    const isAuthenticated = hasToken || hasSession || hasSecureSession;
    
    console.log(`[Middleware] Cookie check:`, {
      path: pathname,
      hasToken,
      hasSession,
      hasSecureSession,
      isAuthenticated,
      tokenLength: token?.length || 0,
      tokenValue: token ? token.substring(0, 20) + "..." : "none"
    });
    
    // DEBUG MODE: Allow access even without token to debug data fetching
    const DEBUG_MODE = true; // Set to false to enforce auth
    
    if (!isAuthenticated && !DEBUG_MODE) {
      console.log(`[Middleware] No valid session found, redirecting to login`);
      // Redirect to login with a query parameter to show toast message
      const locale = pathname.startsWith("/ar") ? "ar" : "en";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("message", "auth_required");
      
      return NextResponse.redirect(loginUrl);
    }
    
    if (DEBUG_MODE && !isAuthenticated) {
      console.log(`[Middleware] DEBUG MODE: Allowing access without session to debug data fetching`);
    } else {
      console.log(`[Middleware] Valid session found, allowing access to ${pathname}`);
    }
  }
  
  // Locale-based routing: redirect / to /en
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/portfolio",
    "/ar/portfolio",
    "/en/portfolio",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$).*)",
  ],
};
