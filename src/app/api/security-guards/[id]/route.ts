import { db } from '@/db';
import { securityGuards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Update Security Guard
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { buildingNo, buildingName, securityGuard, contactNumber, description, constructionStatus, tags } = body;

    await db.update(securityGuards)
      .set({
        buildingNo: Number(buildingNo),
        buildingName,
        securityGuard,
        contactNumber,
        description: description || '',
        constructionStatus,
        tags: tags || '',
      })
      .where(eq(securityGuards.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Security Guard Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update record' }, { status: 500 });
  }
}

// Delete Security Guard
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await db.delete(securityGuards).where(eq(securityGuards.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Security Guard Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete record' }, { status: 500 });
  }
}