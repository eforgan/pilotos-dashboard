import crypto from "crypto";

// Site-wide access gate, independent from the per-user NextAuth login.
// Everyone who knows the shared password gets a signed cookie; the cookie
// value is an HMAC of the password so it can't be forged without AUTH_SECRET.
export const ACCESS_GATE_COOKIE = "mas_access_gate";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET no está configurada. Definila en el entorno (.env / variables de Vercel).");
  }
  return secret;
}

function getGatePassword() {
  const password = process.env.SITE_ACCESS_PASSWORD;
  if (!password) {
    throw new Error("SITE_ACCESS_PASSWORD no está configurada. Definila en el entorno (.env / variables de Vercel).");
  }
  return password;
}

export function computeAccessGateToken(): string {
  return crypto.createHmac("sha256", getSecret()).update(getGatePassword()).digest("hex");
}

export function isValidAccessGateToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = computeAccessGateToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function checkAccessPassword(candidate: string): boolean {
  return candidate === getGatePassword();
}
