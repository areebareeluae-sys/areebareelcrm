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
    const body = await request.json();
    const { tableName, entityId, title, fileUrl } = body;

    if (!fileUrl || !tableName || !entityId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await db.insert(documents).values({
      id: Date.now().toString(),
      tableName,
      entityId,
      fileUrl,
      title: title || 'Untitled Document',
      status: 'Active',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to save to database' }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    // 1. Database se document fetch karein
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));

    if (doc && doc.fileUrl) {
      try {
        // 2. fileUrl se public_id nikalne ka 100% working tareeqa:
        // URL aisi hoti hai: https://res.cloudinary.com/y556pcib/raw/upload/v171000/crm_documents/my_file.pdf
        const urlWithoutQuery = doc.fileUrl.split('?')[0]; // Query params hata dein agar hain
        const parts = urlWithoutQuery.split('/upload/');
        
        if (parts.length > 1) {
          let pathAfterUpload = parts[1]; // e.g., "v171000/crm_documents/my_file.pdf" ya "crm_documents/my_file.pdf"
          
          // Agar version (v123456/) mojood hai toh usay remove kar dein
          pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
          
          // Akhir se extension (.pdf) hata dein taake sirf folder/filename bache
          const publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'));

          console.log('Extracted public_id:', publicId); // Debugging ke liye check kar sakte hain

          // 3. Cloudinary se delete karein
          if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          }
        }
      } catch (cloudError) {
        console.error('Cloudinary delete error:', cloudError);
      }
    }

    // 4. Database se record delete karein
    await db.delete(documents).where(eq(documents.id, id));

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete document' }, { status: 500 });
  }
}