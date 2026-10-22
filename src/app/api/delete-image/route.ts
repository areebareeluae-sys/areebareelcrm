import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'Image URL is required' }, { status: 400 });
    }

    // URL se public_id nikalne ka logic
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) {
      return NextResponse.json({ success: false, error: 'Invalid Cloudinary URL' }, { status: 400 });
    }

    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

    // Cloudinary se delete karein
    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete image' }, { status: 500 });
  }
}