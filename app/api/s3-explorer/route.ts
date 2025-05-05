import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  //protect 
  const session = await getServerSession(authOptions);
  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const bucket = searchParams.get('bucket');
  const prefix = searchParams.get('prefix') || '';
  const delimiter = '/'; // Use delimiter to navigate folders

  if (!bucket) {
    return NextResponse.json(
      { error: 'Bucket parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Get AWS credentials from environment variables
    const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2';

    // Validate credentials
    if (!accessKeyId || !secretAccessKey) {
      console.error('AWS credentials are missing in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: AWS credentials not configured' },
        { status: 500 }
      );
    }

    // Configure S3 client
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    console.log(`Listing objects in bucket: ${bucket}, prefix: ${prefix}`);

    // Create the command to list objects
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: delimiter,
      MaxKeys: 1000,
    });

    // Execute the command
    const response = await s3Client.send(command);

    console.log(`Successfully listed objects: ${response.Contents?.length || 0} files, ${response.CommonPrefixes?.length || 0} folders`);

    // Process the response to identify folders and files
    const objects = [
      // Process CommonPrefixes (folders)
      ...(response.CommonPrefixes || []).map((prefix) => ({
        Key: prefix.Prefix || '',
        LastModified: null,
        Size: 0,
        IsFolder: true,
      })),

      // Process Contents (files)
      ...(response.Contents || [])
        // Filter out the current prefix itself if it's returned
        .filter((item) => item.Key !== prefix)
        .map((item) => ({
          Key: item.Key || '',
          LastModified: item.LastModified,
          Size: item.Size,
          IsFolder: false,
        })),
    ];

    return NextResponse.json({ objects });
  } catch (error) {
    console.error('Error listing S3 objects:', error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Error';

    return NextResponse.json(
      {
        error: 'Failed to list S3 objects',
        details: errorMessage,
        type: errorName
      },
      { status: 500 }
    );
  }
}