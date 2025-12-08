import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard"]
const authRoutes = ["/login"]

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Check for session token in cookies
	const sessionToken =
		request.cookies.get("better-auth.session_token")?.value ||
		request.cookies.get("__Secure-better-auth.session_token")?.value

	const isAuthenticated = !!sessionToken

	// Redirect authenticated users away from auth routes
	if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
		return NextResponse.redirect(new URL("/dashboard", request.url))
	}

	// Redirect unauthenticated users to login
	if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
		return NextResponse.redirect(new URL("/login", request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/dashboard/:path*", "/login"],
}
