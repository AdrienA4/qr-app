import { NextRequest, NextResponse } from "next/server";
import { BlobStorageError, cleanupExpiredBlobs } from "../../../lib/blob-utils";

function isCronAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = req.headers.get("authorization");
  return authorization === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupExpiredBlobs();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Cron blob cleanup error:", error);

    if (error instanceof BlobStorageError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to run blob cleanup" },
      { status: 500 },
    );
  }
}
