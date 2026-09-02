import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const isPdf = ext === 'pdf';
    const filename = isPdf ? `guide_${Date.now()}.pdf` : `remedy_${Date.now()}.${ext}`;

    const subDir = isPdf ? path.join('assets', 'pdfs') : path.join('assets', 'images', 'remedies');
    const uploadDir = path.join(process.cwd(), 'public', subDir);

    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/${subDir.replace(/\\/g, '/')}/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
