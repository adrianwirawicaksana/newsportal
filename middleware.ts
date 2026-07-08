import { NextResponse, type NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-session";

const ADMIN_PATHS = ["/admin", "/api/admin"];
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/logout",
  "/api/admin/login",
];

function getRequiredRole(pathname: string) {
  if (pathname === "/admin/users" || pathname.startsWith("/admin/users/")) {
    return "ketua";
  }

  if (
    pathname === "/admin/statistics" ||
    pathname.startsWith("/admin/statistics/")
  ) {
    return "ketua";
  }

  if (
    pathname === "/api/admin/users" ||
    pathname.startsWith("/api/admin/users/")
  ) {
    return "ketua";
  }

  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const isAdminRoute = ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const session = getAdminSessionFromRequest(request);
  if (!session) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { success: false, error: "Sesi admin tidak valid." },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = getRequiredRole(pathname);
  if (requiredRole && session.role !== requiredRole) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak. Hanya ketua yang bisa membuka fitur ini.",
        },
        { status: 403 },
      );
    }

    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
