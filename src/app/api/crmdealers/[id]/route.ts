import { NextResponse } from 'next/server';
import { db } from '@/db'; // آپ کے پروجیکٹ کے مطابق db کا پاتھ
import { dealeruserscrm } from '@/db/schema'; // آپ کا ڈیلر ٹیبل اسکیما
import { eq } from 'drizzle-orm';

// PATCH /api/crmdealers/[id] - Update individual dealer details or status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const dealerId = parseInt(resolvedParams.id, 10);

    if (isNaN(dealerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Dealer ID provided' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      cnicNumber,
      phoneNumber,
      companyName,
      companyAddress,
      frontCnicImage,
      backCnicImage,
      password,
      status,
      isActive,
    } = body;

    // Check if dealer exists before updating
    const existingDealer = await db
      .select()
      .from(dealeruserscrm)
      .where(eq(dealeruserscrm.id, dealerId))
      .get();

    if (!existingDealer) {
      return NextResponse.json(
        { success: false, error: 'Dealer record not found' },
        { status: 404 }
      );
    }

    // Dynamic update object - only update provided fields
    const updateData: Partial<typeof dealeruserscrm.$inferInsert> = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (cnicNumber !== undefined) updateData.cnicNumber = cnicNumber;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
    if (frontCnicImage !== undefined) updateData.frontCnicImage = frontCnicImage;
    if (backCnicImage !== undefined) updateData.backCnicImage = backCnicImage;
    if (password !== undefined) updateData.password = password;
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Execute update query
    await db
      .update(dealeruserscrm)
      .set(updateData)
      .where(eq(dealeruserscrm.id, dealerId));

    return NextResponse.json({
      success: true,
      message: 'Dealer updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating dealer:', error);
    
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, CNIC, or Phone Number already exists for another dealer.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Server error while updating dealer details' },
      { status: 500 }
    );
  }
}

// PUT Request Support
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
