import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// The most simple usage is when you want to require authentication for 
// your entire site. You can add a middleware.js file with the following:
export { default } from "next-auth/middleware"
// Access token from anywhere
import { getToken } from 'next-auth/jwt'
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token = await getToken({req: request})
    const url = request.nextUrl

    if (token && (
        url.pathname.startsWith('/signin') ||
        url.pathname.startsWith('/signup') ||
        url.pathname.startsWith('/verify') ||
        url.pathname.startsWith('/')
    )) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!token && (
        url.pathname.startsWith('/dashboard')
    )) {
        return NextResponse.redirect(new URL('/signin', request.url))
    }

}
// here, you define paths you want the middleware to run on
export const config = {
  matcher: [
    '/signin',
    '/signup',
    '/',
    '/dashboard/:path*',
    '/verify/:path*',
  ],
}