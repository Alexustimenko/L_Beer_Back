import { IncomingMessage, ServerResponse } from "http";

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};

  const out: Record<string, string> = {};
  header.split(";").forEach(part => {
    const [rawKey, ...rawVal] = part.trim().split("=");
    if (!rawKey) return;
    out[rawKey] = decodeURIComponent(rawVal.join("=") || "");
  });
  return out;
}

type SameSite = "Lax" | "Strict" | "None";

export function setCookie(
  res: ServerResponse,
  name: string,
  value: string,
  opts: {
    maxAgeSeconds?: number;
    httpOnly?: boolean;
    path?: string;
    sameSite?: SameSite;
    secure?: boolean;
  } = {}
): void {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path ?? "/"}`);

  if (opts.maxAgeSeconds != null) parts.push(`Max-Age=${opts.maxAgeSeconds}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.secure) parts.push("Secure");

  // Не затираем возможные другие Set-Cookie
  const existing = res.getHeader("Set-Cookie");
  if (existing == null) {
    res.setHeader("Set-Cookie", parts.join("; "));
    return;
  }
  const arr = Array.isArray(existing) ? existing : [String(existing)];
  arr.push(parts.join("; "));
  res.setHeader("Set-Cookie", arr);
}

