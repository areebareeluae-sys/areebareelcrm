import { NextResponse } from 'next/server';
import { db } from '@/db';
import { property } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    // Conditions build karein
    let conditions = [];
    if (search) {
      conditions.push(
        or(
          like(property.title, `%${search}%`),
          like(property.city, `%${search}%`),
          like(property.type, `%${search}%`)
        )
      );
    }
    if (status) {
      conditions.push(eq(property.status, status));
    }

    const propertiesList = await db
      .select()
      .from(property)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({ success: true, properties: propertiesList });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}