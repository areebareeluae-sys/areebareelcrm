import { NextResponse } from 'next/server';
import { db } from '@/db';
import { dealeruserscrm } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/dealers - Fetch all dealers list
export async function GET() {
  try {
    const dealersList = await db
      .select({
        id: dealeruserscrm.id,
        name: dealeruserscrm.name,
        email: dealeruserscrm.email,
        cnicNumber: dealeruserscrm.cnicNumber,
        phoneNumber: dealeruserscrm.phoneNumber,
        companyName: dealeruserscrm.companyName,
        companyAddress: dealeruserscrm.companyAddress,
        frontCnicImage: dealeruserscrm.frontCnicImage,
        backCnicImage: dealeruserscrm.backCnicImage,
        status: dealeruserscrm.status,
        isActive: dealeruserscrm.isActive,
        createdAt: dealeruserscrm.createdAt,
      })
      .from(dealeruserscrm)
      .orderBy(desc(dealeruserscrm.id));

    return NextResponse.json({
      success: true,
      data: dealersList,
    });
  } catch (error: any) {
    console.error('Error fetching dealers:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while fetching dealers list' },
      { status: 500 }
    );
  }
}

// PATCH /api/dealers - General status update route
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    const updateData: Partial<typeof dealeruserscrm.$inferInsert> = {};
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db
      .update(dealeruserscrm)
      .set(updateData)
      .where(eq(dealeruserscrm.id, id));

    return NextResponse.json({
      success: true,
      message: 'Dealer status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating dealer status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dealer status' },
      { status: 500 }
    );
  }
}