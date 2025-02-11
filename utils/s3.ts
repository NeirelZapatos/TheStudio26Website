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

// Upload Image to S3
export const uploadFileToS3 = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

    const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: fileName,
        ContentType: file.type,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
    });

    return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`;
};

// List Images from S3
export const listS3Images = async (): Promise<string[]> => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        });

        const { Contents } = await s3Client.send(command);

        return Contents
            ? Contents.map((item) => `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${item.Key}`)
            : [];
    } catch (error) {
        console.error("Error fetching S3 images:", error);
        return [];
    }
};
