import { IncomingMessage, ServerResponse } from "http";
import { parseCookies } from "./cookies";
import { getSession } from "../services/sessionService";

export function requireAuth(req: IncomingMessage, res: ServerResponse): string | null {
  const cookies = parseCookies(req);
  const sid = cookies.sid;
  if (!sid) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Unauthorized" }));
    return null;
  }

  const session = getSession(sid);
  if (!session) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Session expired" }));
    return null;
  }

  return session.userId;
}

