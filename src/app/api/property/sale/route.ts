import { NextResponse } from 'next/server';
import { db } from '@/db';
import { property, customer } from '@/db/schema';
import { eq, like, or, and, SQL } from 'drizzle-orm';

// GET Method: Fetch active properties, buyers, or specific customer/seller details
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'Active';
    const buyerId = searchParams.get('buyerId');

    if (buyerId) {
      const buyerData = await db.select().from(customer).where(eq(customer.id, buyerId));
      return NextResponse.json({ success: true, buyer: buyerData[0] || null });
    }

    if (type === 'customer') {
      const conditions: SQL[] = [eq(customer.status, status)];
      if (search && search.trim() !== '') {
        const term = `%${search}%`;
        conditions.push(
          or(
            like(customer.fullname, term),
            like(customer.email, term),
            like(customer.phone, term),
            like(customer.city, term)
          )!
        );
      }
      const customersList = await db.select().from(customer).where(and(...conditions));
      return NextResponse.json({ success: true, customers: customersList });
    }

    // Default: Fetch properties with seller data joined
    const conditions: SQL[] = [eq(property.status, status)];
    if (search && search.trim() !== '') {
      const term = `%${search}%`;
      conditions.push(
        or(
          like(property.id, term),       // 👈 Yahan Property ID ki search add kar di gayi hai
          like(property.title, term),
          like(property.city, term),
          like(property.type, term)
        )!
      );
    }

    const propertiesList = await db.select().from(property).where(and(...conditions));

    const propertiesWithSeller = await Promise.all(
      propertiesList.map(async (prop) => {
        let sellerData = null;
        if (prop.salescustomerid) {
          const sellerRes = await db.select().from(customer).where(eq(customer.id, prop.salescustomerid));
          sellerData = sellerRes[0] || null;
        }
        return {
          ...prop,
          seller: sellerData,
        };
      })
    );

    return NextResponse.json({ success: true, properties: propertiesWithSeller });

  } catch (error) {
    console.error('API Purchase Order GET Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST Method: Save purchase order details and close/sell the property
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId, buyercustomerid, closedprice, advance, fullpaymentdate, closeddate, purchaseorderid } = body;

    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/userId=([^;]+)/);
    const closedby = match ? decodeURIComponent(match[1]) : 'Admin';

    if (!propertyId || !buyercustomerid || !closedprice || !advance || !fullpaymentdate) {
      return NextResponse.json({ success: false, message: 'Missing required fields (including advance or full payment date)' }, { status: 400 });
    }

    await db
      .update(property)
      .set({
        buyercustomerid: String(buyercustomerid),
        closedby: closedby,
        closedprice: String(closedprice),
        advance: String(advance),
        fullpaymentdate: String(fullpaymentdate),
        closeddate: closeddate || new Date().toISOString().split('T')[0],
        Purchaseorderid: purchaseorderid ? String(purchaseorderid) : `PO-${Date.now()}`,
        status: 'Closed',
      })
      .where(eq(property.id, propertyId));

    return NextResponse.json({ success: true, message: 'Purchase order successfully created and property closed!' });
  } catch (error) {
    console.error('API Purchase Order POST Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}