import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if accessing dashboard routes
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isAdminRoute = pathname.startsWith("/dashboard/admin");

    // If accessing dashboard routes, require authentication
    if (isDashboardRoute) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }

      // If accessing admin dashboard, check admin role
      if (isAdminRoute) {
        const user = token.user as any;
        const hasAdminRole = user?.roles?.some(
          (role: any) => role.name === "super admin" || role.name === "admin",
        );

        if (!hasAdminRole) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow access to auth login page without authentication
        if (pathname === "/auth/login") {
          return true;
        }

        // Allow access to home page without authentication
        if (pathname === "/") {
          return true;
        }

        // For dashboard routes, require authentication
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
