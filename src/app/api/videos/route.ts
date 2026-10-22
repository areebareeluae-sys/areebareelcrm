import { NextResponse } from 'next/server';
import { db } from '@/db'; // Aapka drizzle db connection path
import { videos } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// 1. GET: Fetch Videos for a specific entity
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');
    const entityId = searchParams.get('entityId');

    if (!tableName || !entityId) {
      return NextResponse.json(
        { success: false, error: 'tableName and entityId are required' },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.tableName, tableName),
          eq(videos.entityId, entityId),
          eq(videos.status, 'Active')
        )
      );

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fetch videos error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// 2. POST: Add Video Link
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableName, entityId, title, fileUrl } = body;

    if (!tableName || !entityId || !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newVideo = {
      id: Date.now().toString(),
      tableName,
      entityId,
      title: title || 'Property Video',
      fileUrl,
      createdAt: new Date().toISOString(),
      status: 'Active',
    };

    await db.insert(videos).values(newVideo);

    return NextResponse.json({ success: true, data: newVideo });
  } catch (error: any) {
    console.error('Save video error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save video link' },
      { status: 500 }
    );
  }
}

// 3. DELETE: Delete Video Record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Soft delete or hard delete from SQLite
    await db.delete(videos).where(eq(videos.id, id));

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete video error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}