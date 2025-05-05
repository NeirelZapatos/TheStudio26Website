import { NextResponse } from "next/server";
import { uploadFileToS3 } from "@/utils/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  //protect
  const session = await getServerSession(authOptions);
  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const folder = formData.get("folder") as string | null; // Optional folder

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "File and file name are required" },
        { status: 400 }
      );
    }

    const sanitizedFileName = fileName.replace(/\s+/g, "-").toLowerCase();
    const uploadedUrl = await uploadFileToS3(file, sanitizedFileName, folder || undefined);

    return NextResponse.json({ url: uploadedUrl, key: folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName });
  } catch (error) {
    console.error("Upload failed", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}