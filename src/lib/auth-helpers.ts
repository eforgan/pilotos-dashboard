export type Role = "ADMIN" | "BASE_SUPERVISOR" | "PILOT";

export interface SessionUser {
  id?: string;
  role?: string;
  pilotId?: string | null;
  assignedBase?: string | null;
}

/** True if the session user's role is one of the allowed roles. */
export function hasRole(user: SessionUser | undefined | null, roles: Role[]): boolean {
  return !!user?.role && (roles as string[]).includes(user.role);
}

/**
 * Whether `user` may access data scoped to `pilotBase`:
 * - ADMIN sees everything.
 * - BASE_SUPERVISOR only sees pilots whose BASE matches their assignedBase.
 * - Anyone else (PILOT) is denied — pilot-self access is checked separately
 *   by comparing pilotId, since that isn't base-scoped.
 */
export function canAccessBase(user: SessionUser | undefined | null, pilotBase: string | null | undefined): boolean {
  if (!user?.role) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "BASE_SUPERVISOR") {
    return !!user.assignedBase && !!pilotBase && user.assignedBase === pilotBase;
  }
  return false;
}
