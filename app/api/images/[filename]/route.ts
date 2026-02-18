import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { IMAGE_STORAGE_DIR } from '@/lib/image-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  // Security check: prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  const filePath = path.join(IMAGE_STORAGE_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Image not found', { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/png';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
