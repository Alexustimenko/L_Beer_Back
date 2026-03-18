import { IncomingMessage, ServerResponse } from "http";
import { parseCookies, setCookie } from "./cookies";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";
const ADMIN_COOKIE = "admin_token";
const TOKENS = new Set<string>();

export function isAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function createAdminSession(): string {
  const token = Math.random().toString(36).slice(2) + Date.now();
  TOKENS.add(token);
  return token;
}

export function validateAdminToken(token: string): boolean {
  return token !== "" && TOKENS.has(token);
}

export function destroyAdminSession(token: string): void {
  TOKENS.delete(token);
}

export function requireAdmin(req: IncomingMessage, res: ServerResponse): boolean {
  const cookies = parseCookies(req);
  const token = cookies[ADMIN_COOKIE];
  if (!token || !validateAdminToken(token)) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Admin login required" }));
    return false;
  }
  return true;
}

export function setAdminCookie(res: ServerResponse, token: string): void {
  setCookie(res, ADMIN_COOKIE, token, {
    httpOnly: true,
    maxAgeSeconds: 60 * 60 * 24,
    sameSite: "Lax",
    path: "/",
  });
}

export function clearAdminCookie(res: ServerResponse): void {
  setCookie(res, ADMIN_COOKIE, "", { httpOnly: true, maxAgeSeconds: 0, sameSite: "Lax", path: "/" });
}
