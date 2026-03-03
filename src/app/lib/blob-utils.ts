import { del, head, list, put } from "@vercel/blob";

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const BLOB_CLEANUP_PAGE_SIZE = 1000;
const BLOB_DELETE_BATCH_SIZE = 100;

export const BLOB_UPLOAD_PREFIX = "qr-app/uploads";
export const BLOB_RETENTION_DAYS = 30;
export const BLOB_RETENTION_MS = BLOB_RETENTION_DAYS * MILLISECONDS_IN_DAY;

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

export interface BlobDeleteResult {
  success: boolean;
}

export interface CleanupExpiredBlobsResult {
  scanned: number;
  expired: number;
  deleted: number;
  failed: number;
  failedPathnames: string[];
}

export class BlobStorageError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "BlobStorageError";
  }
}

export function createBlobPathname(
  fileName: string,
  now: Date = new Date(),
): string {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_") || "file";
  return `${BLOB_UPLOAD_PREFIX}/${now.getTime()}-${sanitizedName}`;
}

export function getUploadDateFromPathname(pathname: string): Date | null {
  const fileName = pathname.split("/").pop();
  if (!fileName) {
    return null;
  }

  const timestampMatch = /^(\d{13})-/.exec(fileName);
  if (!timestampMatch) {
    return null;
  }

  const timestamp = Number(timestampMatch[1]);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const uploadedAt = new Date(timestamp);
  return Number.isNaN(uploadedAt.getTime()) ? null : uploadedAt;
}

export function getBlobExpiryDate(uploadedAt: Date): Date {
  return new Date(uploadedAt.getTime() + BLOB_RETENTION_MS);
}

export function encodeBlobPathname(pathname: string): string {
  return Buffer.from(pathname, "utf8").toString("base64url");
}

export function decodeBlobPathname(encodedPathname: string): string | null {
  try {
    const decoded = Buffer.from(encodedPathname, "base64url").toString("utf8");
    return decoded || null;
  } catch {
    return null;
  }
}

export function isBlobExpired(
  uploadedAt: Date,
  now: Date = new Date(),
): boolean {
  return getBlobExpiryDate(uploadedAt).getTime() <= now.getTime();
}

export async function uploadToBlob(
  file: File,
  filename?: string,
): Promise<BlobUploadResult> {
  try {
    if (!file) {
      throw new BlobStorageError("No file provided", 400);
    }
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BlobStorageError("File too large. Maximum size is 50MB", 400);
    }
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
    ];
    if (!validTypes.includes(file.type)) {
      throw new BlobStorageError(
        "Invalid file type. Only images and videos are allowed",
        400,
      );
    }
    const finalFilename = filename || createBlobPathname(file.name);

    const blob = await put(finalFilename, file, {
      access: "public",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
    };
  } catch (error) {
    if (error instanceof BlobStorageError) {
      throw error;
    }
    console.error("Blob upload error:", error);
    throw new BlobStorageError("Failed to upload file", 500);
  }
}

export async function deleteFromBlob(
  pathname: string,
): Promise<BlobDeleteResult> {
  try {
    if (!pathname) {
      throw new BlobStorageError("No pathname provided", 400);
    }

    await del(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof BlobStorageError) {
      throw error;
    }
    console.error("Blob delete error:", error);
    throw new BlobStorageError("Failed to delete file", 500);
  }
}

export async function cleanupExpiredBlobs(
  now: Date = new Date(),
): Promise<CleanupExpiredBlobsResult> {
  try {
    let cursor: string | undefined;
    let hasMore = true;
    let scanned = 0;
    const expiredPathnames: string[] = [];

    while (hasMore) {
      const result = await list({
        limit: BLOB_CLEANUP_PAGE_SIZE,
        prefix: `${BLOB_UPLOAD_PREFIX}/`,
        cursor,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      scanned += result.blobs.length;
      for (const blob of result.blobs) {
        if (isBlobExpired(blob.uploadedAt, now)) {
          expiredPathnames.push(blob.pathname);
        }
      }

      hasMore = result.hasMore;
      cursor = result.cursor;
    }

    let deleted = 0;
    const failedPathnames: string[] = [];
    for (
      let index = 0;
      index < expiredPathnames.length;
      index += BLOB_DELETE_BATCH_SIZE
    ) {
      const batch = expiredPathnames.slice(index, index + BLOB_DELETE_BATCH_SIZE);
      try {
        await del(batch, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        deleted += batch.length;
      } catch (error) {
        console.error("Blob cleanup batch delete error:", error);
        failedPathnames.push(...batch);
      }
    }

    return {
      scanned,
      expired: expiredPathnames.length,
      deleted,
      failed: failedPathnames.length,
      failedPathnames,
    };
  } catch (error) {
    console.error("Blob cleanup error:", error);
    throw new BlobStorageError("Failed to cleanup expired blobs", 500);
  }
}

export async function checkBlobExists(pathname: string): Promise<boolean> {
  try {
    if (!pathname) {
      return false;
    }

    await head(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return true;
  } catch {
    return false;
  }
}

export function getBlobUrl(pathname: string): string {
  if (!pathname) {
    return "";
  }
  if (pathname.startsWith("http")) {
    return pathname;
  }
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}.public.blob.vercel-storage.com`
    : "http://localhost:3000";

  return `${baseUrl}/${pathname}`;
}
