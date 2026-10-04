import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { IpfsUploadError, pinFileToIpfs } from "@/lib/ipfs/pinata";

// Backs the operator-facing photo upload on project creation, tree
// registration, and monitoring evidence. All three fall back to a
// `placeholder-<slug>` string (lib/ipfs/placeholder.ts) when this 503s or
// isn't used, so nothing that worked before this route existed breaks while
// IPFS_API_KEY/IPFS_API_SECRET are unset.
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "operator") {
      return NextResponse.json(
        { success: false, error: "Operator session required" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const label = String(formData.get("label") ?? "upload");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    const { cid, uri } = await pinFileToIpfs(file, label);
    return NextResponse.json(
      { success: true, data: { cid, uri } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof IpfsUploadError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 503 },
      );
    }
    console.error("POST /api/ipfs/upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
