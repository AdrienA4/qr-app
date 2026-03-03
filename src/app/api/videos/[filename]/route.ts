import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import {
  BlobStorageError,
  decodeBlobPathname,
} from "../../../lib/blob-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 });
    }

    const decodedPathname = decodeBlobPathname(filename);
    const pathname = decodedPathname || filename;
    const range = req.headers.get("range");

    const blob = await get(pathname, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      headers: range ? { Range: range } : undefined,
    });

    if (!blob) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const headers = new Headers();
    const forwardHeaderNames = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "etag",
      "last-modified",
      "cache-control",
    ];

    for (const headerName of forwardHeaderNames) {
      const value = blob.headers.get(headerName);
      if (value) {
        headers.set(headerName, value);
      }
    }

    if (!headers.has("cache-control")) {
      headers.set("cache-control", "public, max-age=60");
    }

    const status = headers.has("content-range") ? 206 : 200;
    return new NextResponse(blob.stream, {
      status,
      headers,
    });
  } catch (error) {
    console.error("Video serve error:", error);

    if (error instanceof BlobStorageError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to serve video" },
      { status: 500 },
    );
  }
}
