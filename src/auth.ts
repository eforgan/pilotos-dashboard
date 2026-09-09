import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs";
import { db } from "./lib/db";
import { sanitizeDni, isAdminDni, findPilotByDni } from "./lib/dni";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const rawInput = String(credentials.email).trim();
          const cleanDni = sanitizeDni(rawInput);
          const rawPassword = String(credentials.password).trim();
          const cleanPassword = sanitizeDni(rawPassword);

          const existingUser = await db.user.findFirst({
            where: {
              OR: [
                { email: rawInput },
                { email: cleanDni },
                { email: `${cleanDni}@modena.com` },
                { pilot: { DNI: cleanDni } },
              ],
            },
            include: { pilot: { select: { PILOTO: true } } },
          });

          // FIRST LOGIN AUTO-PROVISIONING: no User account yet, but a Pilot
          // exists for this DNI and the submitted password equals the DNI.
          if (!existingUser && cleanDni.length >= 6) {
            const pilot = await findPilotByDni(db, cleanDni);

            if (pilot && cleanPassword === cleanDni) {
              const hashedPassword = await bcrypt.hash(cleanPassword, 10);
              const userEmail =
                pilot.EMAIL && pilot.EMAIL.trim() !== "" ? pilot.EMAIL.trim() : `${cleanDni}@modena.com`;
              const role = isAdminDni(cleanDni) ? "ADMIN" : "PILOT";

              const createdUser = await db.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  role,
                  mustChangePassword: true,
                  pilotId: pilot.id,
                },
              });

              return {
                id: createdUser.id,
                email: createdUser.email,
                name: pilot.PILOTO,
                role: createdUser.role,
                pilotId: createdUser.pilotId,
                mustChangePassword: true,
              };
            }
          }

          if (!existingUser) return null;

          const isValid = await bcrypt.compare(rawPassword, existingUser.password);
          // Allow the initial DNI-as-password match while it hasn't been changed yet.
          const isValidCleanDni =
            !isValid && cleanPassword === cleanDni && (await bcrypt.compare(cleanDni, existingUser.password));

          if (!isValid && !isValidCleanDni) return null;

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.pilot?.PILOTO || existingUser.email,
            role: existingUser.role,
            pilotId: existingUser.pilotId,
            mustChangePassword: existingUser.mustChangePassword,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("[AUTH] Authentication error:", error.message);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as { role?: string; id?: string; email?: string | null; pilotId?: string | null; name?: string | null; mustChangePassword?: boolean };
        if (u.role) token.role = u.role;
        if (u.id) token.id = u.id;
        if (u.email) token.email = u.email;
        if (u.name) token.name = u.name;
        token.pilotId = u.pilotId ?? null;
        token.mustChangePassword = u.mustChangePassword ?? false;
      }

      // Allow the client to push updates (e.g. after changing the password)
      // via useSession().update(...) without forcing a full re-login.
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { mustChangePassword?: boolean };
        if (typeof s.mustChangePassword === "boolean") {
          token.mustChangePassword = s.mustChangePassword;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as { role?: string; id?: string; pilotId?: string | null; name?: string | null; mustChangePassword?: boolean };
        u.role = token.role as string;
        u.id = token.id as string;
        u.pilotId = (token.pilotId as string | null) ?? null;
        u.mustChangePassword = (token.mustChangePassword as boolean) ?? false;
        if (token.name) u.name = token.name as string;
      }
      return session;
    },
  },
});
