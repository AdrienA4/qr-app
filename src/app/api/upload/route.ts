import { NextRequest, NextResponse } from "next/server";
import {
  BLOB_RETENTION_DAYS,
  BLOB_UPLOAD_PREFIX,
  cleanupExpiredBlobs,
  deleteFromBlob,
  BlobStorageError,
  encodeBlobPathname,
  getBlobExpiryDate,
  getUploadDateFromPathname,
  uploadToBlob,
} from "../../lib/blob-utils";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadType = type === "image" || type === "video" ? type : "video";
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const folder = uploadType === "video" ? "videos" : "images";
    const pathname = `${BLOB_UPLOAD_PREFIX}/${folder}/${timestamp}-${sanitizedName}`;

    const blob = await uploadToBlob(file, pathname);
    const uploadedAt = getUploadDateFromPathname(blob.pathname) ?? new Date();
    const expiresAt = getBlobExpiryDate(uploadedAt).toISOString();
    const id = encodeBlobPathname(blob.pathname);
    const proxyUrl =
      uploadType === "video"
        ? new URL(`/api/videos/${id}`, req.nextUrl.origin).toString()
        : blob.url;

    let thumbnailUrl: string | null = null;
    if (uploadType === "video") {
      const thumbnailFile = formData.get("thumbnail") as File | null;
      if (thumbnailFile && thumbnailFile.type.startsWith("image/")) {
        try {
          const nameWithoutExtension = sanitizedName.replace(/\.[^.]+$/, "");
          const thumbnailPathname = `${BLOB_UPLOAD_PREFIX}/thumbnails/${timestamp}-${nameWithoutExtension}.jpg`;
          const thumbnailBlob = await uploadToBlob(thumbnailFile, thumbnailPathname);
          const thumbnailId = encodeBlobPathname(thumbnailBlob.pathname);
          thumbnailUrl = new URL(
            `/api/videos/${thumbnailId}`,
            req.nextUrl.origin,
          ).toString();
        } catch (thumbnailError) {
          console.error("Thumbnail upload failed:", thumbnailError);
        }
      }
    }

    void cleanupExpiredBlobs().catch((cleanupError) => {
      console.error("Background blob cleanup failed:", cleanupError);
    });

    return NextResponse.json({
      url: proxyUrl,
      id,
      pathname: blob.pathname,
      expiresAt,
      retentionDays: BLOB_RETENTION_DAYS,
      thumbnailUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof BlobStorageError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { pathname } = await req.json();

    if (!pathname) {
      return NextResponse.json(
        { error: "No pathname provided" },
        { status: 400 },
      );
    }

    await deleteFromBlob(pathname);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);

    if (error instanceof BlobStorageError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
