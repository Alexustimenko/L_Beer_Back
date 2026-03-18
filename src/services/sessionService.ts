import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

export interface Session {
  id: string;
  userId: string;
  expiresAt: number; // epoch ms
}

const sessionsPath = path.join(__dirname, "../storage/sessions.json");

function readSessions(): Session[] {
  if (!fs.existsSync(sessionsPath)) {
    fs.writeFileSync(sessionsPath, "[]");
    return [];
  }
  const raw = fs.readFileSync(sessionsPath, "utf-8");
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? (parsed as Session[]) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: Session[]): void {
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
}

export function createSession(userId: string, ttlSeconds: number): Session {
  const sessions = readSessions().filter(s => s.expiresAt > Date.now());
  const session: Session = {
    id: randomUUID(),
    userId,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };
  sessions.push(session);
  writeSessions(sessions);
  return session;
}

export function getSession(sessionId: string): Session | null {
  const sessions = readSessions();
  const session = sessions.find(s => s.id === sessionId) || null;
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    // очистка просроченной
    writeSessions(sessions.filter(s => s.expiresAt > Date.now()));
    return null;
  }
  return session;
}

export function deleteSession(sessionId: string): void {
  const sessions = readSessions();
  writeSessions(sessions.filter(s => s.id !== sessionId));
}

