import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export type StoredFile = {
  storageKey: string;
  url: string | null;
};

export async function storeUpload(file: File): Promise<StoredFile> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || guessExt(file.type);
  const storageKey = `${new Date().toISOString().slice(0, 10)}/${randomBytes(12).toString("hex")}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(storageKey, bytes, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { storageKey: blob.pathname, url: blob.url };
  }

  const fullPath = path.join(UPLOAD_ROOT, storageKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, bytes);
  return { storageKey, url: null };
}

export async function readLocalUpload(storageKey: string) {
  const fullPath = path.join(UPLOAD_ROOT, storageKey);
  return readFile(fullPath);
}

function guessExt(mime: string) {
  if (mime.includes("jpeg")) return ".jpg";
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("pdf")) return ".pdf";
  return "";
}
