import { db } from '@/db';
import { securityGuards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Get All Security Guards
export async function GET() {
  try {
    const data = await db.select().from(securityGuards);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get Security Guards Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Add New Security Guard
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, buildingNo, buildingName, securityGuard, contactNumber, description, constructionStatus, tags } = body;

    if (!buildingNo || !buildingName || !securityGuard || !contactNumber || !constructionStatus) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await db.insert(securityGuards).values({
      id: id || Date.now().toString(),
      buildingNo: Number(buildingNo),
      buildingName,
      securityGuard,
      contactNumber,
      description: description || '',
      constructionStatus,
      tags: tags || '',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add Security Guard Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to add security guard record' }, { status: 500 });
  }
}