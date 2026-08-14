import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "./db";

const SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function signToken(payload: object) {
  const body = base64url(JSON.stringify(payload));
  const sig = base64url(crypto.createHmac("sha256", SECRET).update(body).digest());
  return `${body}.${sig}`;
}

function verifyToken(token: string) {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = base64url(crypto.createHmac("sha256", SECRET).update(body).digest());
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return data;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest) {
  // Try Authorization header first
  const auth = req.headers.get("authorization") || "";
  let token: string | null = null;
  if (auth.startsWith("Bearer ")) token = auth.slice(7);
  // Fallback to cookie
  if (!token) {
    try {
      token = req.cookies.get("earn_token")?.value ?? null;
    } catch {
      token = null;
    }
  }
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;
  const user = await db.user.findUnique({ where: { id: String(payload.userId) } });
  return user || null;
}

export function createAuthTokenForUser(user: { id: string; role?: string }) {
  return signToken({ userId: user.id, role: user.role || "user", iat: Date.now() });
}

export { verifyToken };
