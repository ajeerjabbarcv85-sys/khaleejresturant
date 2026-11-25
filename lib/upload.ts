import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export function saveDataUrl(dataUrl: string): string | null {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) return null;

  const mime = match[1].toLowerCase();
  const extension = MIME_EXTENSIONS[mime];
  if (!extension) return null;

  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) return null;

  const directory = path.join(process.cwd(), "public", "images", "uploads");
  fs.mkdirSync(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  fs.writeFileSync(path.join(directory, filename), buffer);
  return `/images/uploads/${filename}`;
}
