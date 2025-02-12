import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
    },
});

// Upload Image to S3 with Custom File Name
export const uploadFileToS3 = async (file: File, fileName: string): Promise<string> => {
    const sanitizedFileName = fileName.replace(/\s+/g, "-").toLowerCase(); // Ensure clean file name

    const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: sanitizedFileName,
        ContentType: file.type,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
    });

    return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${sanitizedFileName}`;
};

// List All Images from S3 (Filtering Out Non-Image Files)
export const listS3Images = async (): Promise<{ url: string; key: string }[]> => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        });

        const { Contents } = await s3Client.send(command);

        // File extensions considered as images
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];

        return Contents
            ? Contents.filter((item) => item.Key !== undefined) // Ensure Key is defined
                .filter((item) => {
                    const fileExtension = item.Key!.split(".").pop()?.toLowerCase();
                    return fileExtension && imageExtensions.includes(fileExtension);
                })
                .map((item) => ({
                    url: `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${item.Key}`,
                    key: item.Key as string, // Type assertion since undefined values are removed
                }))
            : [];
    } catch (error) {
        console.error("Error fetching S3 images:", error);
        return [];
    }
};