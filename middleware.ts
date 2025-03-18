import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will protect all routes except those specified in the matcher
export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  // You can add custom logic here if needed
  return NextResponse.next();
});

// Configure the middleware to run on all paths except those explicitly excluded
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (Auth0 authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /fonts/* (static font files)
     * 4. /images/* (static image files)
     * 5. /favicon.ico, /logo.svg, etc. (static files at root)
     */
    '/((?!api/auth|_next|fonts|images|favicon.ico|logo.svg).*)',
  ],
}; 