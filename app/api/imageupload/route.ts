import { NextResponse } from "next/server";
import { uploadFileToS3 } from "@/utils/s3";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "File and file name are required" },
        { status: 400 }
      );
    }

    const sanitizedFileName = fileName.replace(/\s+/g, "-").toLowerCase();
    const uploadedUrl = await uploadFileToS3(file, sanitizedFileName);

    return NextResponse.json({ url: uploadedUrl, key: sanitizedFileName });
  } catch (error) {
    console.error("Upload failed", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}