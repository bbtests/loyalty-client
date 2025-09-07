import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    
    // If accessing admin routes, check if user has admin role
    if (isAdminRoute) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
      
      // Check if user has admin role
      const user = token.user as any
      const hasAdminRole = user?.roles?.some((role: any) => 
        role.name === "super admin" || role.name === "admin"
      )
      
      if (!hasAdminRole) {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth login page without authentication
        if (req.nextUrl.pathname === "/auth/login") {
          return true
        }
        
        // For other admin routes, require authentication
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"]
}
