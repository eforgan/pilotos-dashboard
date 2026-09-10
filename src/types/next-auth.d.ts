import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      pilotId?: string | null;
      assignedBase?: string | null;
      mustChangePassword?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    pilotId?: string | null;
    assignedBase?: string | null;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    pilotId?: string | null;
    assignedBase?: string | null;
    mustChangePassword?: boolean;
  }
}
