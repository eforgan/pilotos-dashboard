import type { NextAuthConfig } from "next-auth";
import { ACCESS_GATE_COOKIE, isValidAccessGateToken } from "@/lib/access-gate";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isAccessGatePage = nextUrl.pathname === "/access";

      // Site-wide access gate: must pass before reaching login or anything else.
      if (!isAccessGatePage) {
        const gateToken = request.cookies.get(ACCESS_GATE_COOKIE)?.value;
        if (!isValidAccessGateToken(gateToken)) {
          const url = new URL("/access", nextUrl);
          if (nextUrl.pathname !== "/") {
            url.searchParams.set("from", nextUrl.pathname);
          }
          return Response.redirect(url);
        }
      }

      const isLoggedIn = !!auth?.user;
      const isPublicPage =
        isAccessGatePage ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname === "/login";

      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isPublicPage) return true;
      return isLoggedIn;
    },
  },
  providers: [], // Add empty providers to satisfy type, will be overridden in auth.ts
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
