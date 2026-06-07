import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/auth")) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          ),
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Not logged in
  if (!session) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    return res;
  }

  // Logged in user on auth pages
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // /admin ke liye role check — middleware mein NAHI karte
  // Layout.tsx server component mein hoga (service role se)
  // Middleware sirf logged-in check karta hai /admin ke liye

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/sign-in", "/sign-up"],
};
