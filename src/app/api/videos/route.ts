import { del, list, type ListBlobResultBlob } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import {
  BLOB_RETENTION_DAYS,
  BLOB_UPLOAD_PREFIX,
  BlobStorageError,
  decodeBlobPathname,
  deleteFromBlob,
  encodeBlobPathname,
  getBlobExpiryDate,
} from "../../lib/blob-utils";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

interface VideoListItem {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string | null;
  uploadedAt: string;
  expiresAt: string;
  daysLeft: number;
  size: number;
  retentionDays: number;
}

function extractUploadKey(pathname: string): string | null {
  const fileName = pathname.split("/").pop();
  if (!fileName) {
    return null;
  }

  const match = /^(\d{13})-/.exec(fileName);
  return match?.[1] ?? null;
}

function getDisplayName(pathname: string): string {
  const fileName = pathname.split("/").pop() ?? pathname;
  return fileName.replace(/^\d{13}-/, "");
}

function buildProxyUrl(origin: string, pathname: string): string {
  const id = encodeBlobPathname(pathname);
  return new URL(`/api/videos/${id}`, origin).toString();
}

async function listAllBlobsWithPrefix(prefix: string): Promise<ListBlobResultBlob[]> {
  let hasMore = true;
  let cursor: string | undefined;
  const blobs: ListBlobResultBlob[] = [];

  while (hasMore) {
    const result = await list({
      prefix,
      limit: 1000,
      cursor,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    blobs.push(...result.blobs);
    hasMore = result.hasMore;
    cursor = result.cursor;
  }

  return blobs;
}

export async function GET(req: NextRequest) {
  try {
    const [videoBlobs, thumbnailBlobs] = await Promise.all([
      listAllBlobsWithPrefix(`${BLOB_UPLOAD_PREFIX}/videos/`),
      listAllBlobsWithPrefix(`${BLOB_UPLOAD_PREFIX}/thumbnails/`),
    ]);

    const thumbnailByKey = new Map<string, ListBlobResultBlob>();
    for (const thumbnailBlob of thumbnailBlobs) {
      const key = extractUploadKey(thumbnailBlob.pathname);
      if (!key) {
        continue;
      }
      thumbnailByKey.set(key, thumbnailBlob);
    }

    const now = Date.now();
    const videos: VideoListItem[] = videoBlobs
      .map((videoBlob) => {
        const key = extractUploadKey(videoBlob.pathname);
        const thumbnailBlob = key ? thumbnailByKey.get(key) : undefined;
        const expiresAt = getBlobExpiryDate(videoBlob.uploadedAt);
        const daysLeft = Math.max(
          0,
          Math.ceil((expiresAt.getTime() - now) / MS_IN_DAY),
        );

        return {
          id: encodeBlobPathname(videoBlob.pathname),
          name: getDisplayName(videoBlob.pathname),
          url: buildProxyUrl(req.nextUrl.origin, videoBlob.pathname),
          thumbnailUrl: thumbnailBlob
            ? buildProxyUrl(req.nextUrl.origin, thumbnailBlob.pathname)
            : null,
          uploadedAt: videoBlob.uploadedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          daysLeft,
          size: videoBlob.size,
          retentionDays: BLOB_RETENTION_DAYS,
        };
      })
      .sort(
        (left, right) =>
          new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime(),
      );

    return NextResponse.json({
      videos,
      retentionDays: BLOB_RETENTION_DAYS,
    });
  } catch (error) {
    console.error("List videos error:", error);

    if (error instanceof BlobStorageError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to list videos" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string };
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Video id required" }, { status: 400 });
    }

    const pathname = decodeBlobPathname(id);
    if (!pathname) {
      return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
    }

    const uploadKey = extractUploadKey(pathname);
    await deleteFromBlob(pathname);

    if (uploadKey) {
      const thumbnailBlobs = await listAllBlobsWithPrefix(
        `${BLOB_UPLOAD_PREFIX}/thumbnails/`,
      );
      const matchingThumbnails = thumbnailBlobs
        .filter((thumbnailBlob) => extractUploadKey(thumbnailBlob.pathname) === uploadKey)
        .map((thumbnailBlob) => thumbnailBlob.pathname);

      if (matchingThumbnails.length > 0) {
        await del(matchingThumbnails, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete video error:", error);

    if (error instanceof BlobStorageError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 },
    );
  }
}
