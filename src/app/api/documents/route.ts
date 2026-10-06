import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');
    const entityId = searchParams.get('entityId');

    if (!tableName || !entityId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const data = await db.select().from(documents).where(
      and(
        eq(documents.tableName, tableName),
        eq(documents.entityId, entityId)
      )
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const tableName = formData.get('tableName') as string;
    const entityId = formData.get('entityId') as string;
    const title = formData.get('title') as string;
    const file = formData.get('file') as File;

    if (!file || !tableName || !entityId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'raw', // <--- Yahan 'auto' ya 'image' ki jagah 'raw' kar dein
          folder: 'crm_documents',
          public_id: file.name.replace(/\.[^/.]+$/, "") // Optional: original name without extension
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    await db.insert(documents).values({
      id: Date.now().toString(),
      tableName,
      entityId,
      fileUrl: uploadResult.secure_url,
      title: title || file.name,
      status: 'Active',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}