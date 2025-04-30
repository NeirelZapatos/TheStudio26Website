import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Log all cookies for debugging
    // console.log("Cookies:", request.cookies.getAll());

    // Check for the session token
    const token = request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token");

    if (!token) {
        console.log("No session token found. Redirecting to /Login.");
        return NextResponse.redirect(new URL('/Login', request.url));
    }

    console.log("Session token found. Proceeding to the requested page.");
    return NextResponse.next();
}

export const config = {
    matcher: ['/Dashboard', '/EmailBuilder']
}