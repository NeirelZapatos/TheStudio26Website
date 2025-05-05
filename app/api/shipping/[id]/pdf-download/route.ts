import { NextRequest, NextResponse } from 'next/server';
import Shipping from '@/app/models/Shipping';
import dbConnect from '@/app/lib/dbConnect';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  //protect
  const session = await getServerSession(authOptions);
  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const id = params.id;
    
    // Fetch the shipping record
    const shipping = await Shipping.findById(id);
    
    if (!shipping || !shipping.transaction?.label_url) {
      return NextResponse.json({ error: 'Shipping label not found' }, { status: 404 });
    }
    
    const url = shipping.transaction.label_url;
    const filename = `shipping-label-${id}.pdf`;
    
    console.log(`Fetching from Shippo: ${url}`);
    
    // Add proper headers that might be required by Shippo
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/pdf,*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; YourAppName/1.0)'
      }
    });

    if (!response.ok) {
      console.error(`Shippo fetch failed: ${response.status} ${response.statusText}`);
      return NextResponse.json({ 
        error: `Failed to fetch from Shippo: ${response.status}`,
        details: await response.text()
      }, { status: response.status });
    }

    // Get content as a blob and convert to ArrayBuffer
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    
    // Return the PDF as a download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-store, must-revalidate',
        // Add debugging header to verify content
        'X-Debug-Content-Length': buffer.byteLength.toString()
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to download shipping label', details: message }, { status: 500 });
  }
}