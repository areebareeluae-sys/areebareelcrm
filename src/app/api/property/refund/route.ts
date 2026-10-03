import { NextResponse } from 'next/server';
import { db } from '@/db';
import { property, activity_logs } from '@/db/schema';
import { customer } from '@/db/schema';
import { eq, or, like, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || '';
    const searchQuery = searchParams.get('search') || '';

    let propertiesList;

    // Search aur status filter logic
    if (searchQuery && searchQuery.trim() !== '') {
      const term = `%${searchQuery}%`;
      propertiesList = await db.select().from(property).where(
        and(
          statusFilter ? eq(property.status, statusFilter) : undefined,
          or(
            like(property.title, term),
            like(property.city, term),
            like(property.address, term),
            like(property.category, term)
          )
        )
      );
    } else {
      propertiesList = statusFilter 
        ? await db.select().from(property).where(eq(property.status, statusFilter))
        : await db.select().from(property);
    }

    // Har property ke sath seller aur buyer ka data attach karna
    const propertiesWithDetails = await Promise.all(
      propertiesList.map(async (prop) => {
        let sellerData = null;
        let buyerData = null;

        if (prop.salescustomerid) {
          const sellerRes = await db.select().from(customer).where(eq(customer.id, prop.salescustomerid));
          sellerData = sellerRes[0] || null;
        }

        if (prop.buyercustomerid) {
          const buyerRes = await db.select().from(customer).where(eq(customer.id, prop.buyercustomerid));
          buyerData = buyerRes[0] || null;
        }

        return {
          ...prop,
          seller: sellerData,
          buyer: buyerData,
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      properties: propertiesWithDetails 
    }, { status: 200 });

  } catch (error: any) {
    console.error('API Error /api/property/sale GET:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ success: false, message: 'Property ID is required' }, { status: 400 });
    }

    // 1. Check karein ke property mojood hai ya nahi
    const existingProperty = await db.select().from(property).where(eq(property.id, propertyId));
    if (existingProperty.length === 0) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    const prop = existingProperty[0];

    // 2. Property ke closing details ko NULL/reset kar dein aur status Active kar dein
    await db
      .update(property)
      .set({
        buyercustomerid: '',
        closedprice: '0',
        advance: '0',
        fullpaymentdate: '',
        closeddate: '',
        closedby: '',
        status: 'Active',
      })
      .where(eq(property.id, propertyId));

    // 3. Activity Log mein record add karein (Fixed string/math random error)
    const logId = 'log_' + Date.now() + Math.random().toString(36).substring(2, 7);
    
    await db.insert(activity_logs).values({
      id: logId,
      propertyid: String(propertyId),
      property_id: Number(propertyId) || 0,
      action: 'REFUND',
      details: `Property refunded and deal cancelled for title: ${prop.title}`,
      performed_by: 'Admin',
    });

    return NextResponse.json({ success: true, message: 'Property successfully refunded and activity logged!' });
  } catch (error) {
    console.error('API Refund Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}