import { IncomingMessage, ServerResponse } from "http";
import * as fs from "fs";
import * as path from "path";

const imagesDir = path.join(__dirname, "../storage/images");

const MIMES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function imagesController(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Method not allowed" }));
    return;
  }
  const pathname = req.url?.split("?")[0] ?? "";
  if (!pathname.startsWith("/images/")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end("Not found");
    return;
  }
  const filename = pathname.slice("/images/".length);
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid filename" }));
    return;
  }
  const filePath = path.join(imagesDir, filename);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIMES[ext] ?? "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.writeHead(200);
  fs.createReadStream(filePath).pipe(res);
}
