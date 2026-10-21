import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'y556pcib';
    const apiKey = process.env.CLOUDINARY_API_KEY || '475551924862539';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '8gXwf91NPnjkSAgPGC2VzSD_sec';

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Generate SHA-1 signature for Cloudinary authentication
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const uploadFormData = new URLSearchParams();
    uploadFormData.append('file', base64Data);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('signature', signature);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    const result = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      console.error('Cloudinary API Error:', result);
      return NextResponse.json(
        { success: false, error: result.error?.message || 'Cloudinary upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error('Server upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during image upload' },
      { status: 500 }
    );
  }
}