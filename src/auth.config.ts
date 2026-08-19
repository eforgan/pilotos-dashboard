import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPage = 
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
