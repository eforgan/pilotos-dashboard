import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // DIRECT NEON BYPASS: Using the direct driver to ensure connection works in production
          const { neon } = await import("@neondatabase/serverless");
          const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_YlxtfsAoD1M4@ep-little-morning-a4qh58zw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
          const sql = neon(connectionString);
          
          console.log("[AUTH_DEBUG] Attempting direct lookup for:", credentials.email);
          const results = await sql`SELECT * FROM "User" WHERE email = ${credentials.email} LIMIT 1`;
          const user = results[0] as { id: string; email: string; name: string; role: string; password: string };

          if (!user) {
            console.log("[AUTH_DEBUG] User not found via direct SQL");
            return null;
          }

          console.log("[AUTH_DEBUG] User found. ID:", user.id);

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          console.log("[AUTH_DEBUG] Password valid?", isValid);

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("[AUTH_DEBUG] Authentication crash:", error.message);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: string; id?: string; email?: string | null };
        if (u.role) token.role = u.role;
        if (u.id) token.id = u.id;
        if (u.email) token.email = u.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as { role?: string; id?: string };
        u.role = token.role as string;
        u.id = token.id as string;
      }
      return session;
    },
  },
});
