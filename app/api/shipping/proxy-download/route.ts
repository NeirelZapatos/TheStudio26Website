import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, customerName } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    console.log(`Proxying download from: ${url}`);
    
    // Fetch the PDF from the external URL
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/pdf,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`External fetch failed: ${response.status} ${response.statusText}`);
      return NextResponse.json({ 
        error: `Failed to fetch PDF: ${response.status}`,
        details: await response.text()
      }, { status: response.status });
    }

    // Get the content as a blob and convert to ArrayBuffer
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    
    // Sanitize customer name for filename
    const sanitizeFilename = (name: string) => {
      if (!name) return 'shipping-label';
      return name
        .replace(/[^a-zA-Z0-9-_ ]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50); // Limit length
    };
    
    const filename = customerName 
      ? `shipping-label_${sanitizeFilename(customerName)}.pdf`
      : 'shipping-label.pdf';
    
    // Return the PDF with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Proxy download error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to proxy download', details: message }, { status: 500 });
  }
}