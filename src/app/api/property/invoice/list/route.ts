import { NextResponse } from 'next/server';
import { db } from '@/db';
import { property, customer, crminvoice } from '@/db/schema';
import { eq, like, and, SQL, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceIdSearch = searchParams.get('invoiceId') || '';
    const propertyIdSearch = searchParams.get('propertyId') || '';
    const statusSearch = searchParams.get('status') || '';
    const page = Number(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (invoiceIdSearch) {
      conditions.push(like(crminvoice.id, `%${invoiceIdSearch}%`));
    }
    if (propertyIdSearch) {
      conditions.push(like(crminvoice.propertyid, `%${propertyIdSearch}%`));
    }
    if (statusSearch) {
      conditions.push(eq(crminvoice.status, statusSearch));
    }

    // Fetch invoices sorted by latest created_at descending
    const invoicesList = await db
      .select()
      .from(crminvoice)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(crminvoice.createdAt))
      .limit(limit)
      .offset(offset);

    // Attach Property, Buyer, Seller details to each invoice
    const detailedInvoices = await Promise.all(
      invoicesList.map(async (inv) => {
        let prop = null;
        let buyer = null;
        let seller = null;

        const propRes = await db.select().from(property).where(eq(property.id, inv.propertyid));
        if (propRes.length > 0) {
          prop = propRes[0];

          if (prop.salescustomerid) {
            const sRes = await db.select().from(customer).where(eq(customer.id, prop.salescustomerid));
            seller = sRes[0] || null;
          }
          if (prop.buyercustomerid) {
            const bRes = await db.select().from(customer).where(eq(customer.id, prop.buyercustomerid));
            buyer = bRes[0] || null;
          }
        }

        return {
          ...inv,
          property: prop,
          buyer,
          seller,
        };
      })
    );

    return NextResponse.json({ success: true, invoices: detailedInvoices });
  } catch (error) {
    console.error('Invoices List GET Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update Invoice Status to Closed & Property to Sold
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body; // invoice id

    if (!id) {
      return NextResponse.json({ success: false, message: 'Invoice ID is required' }, { status: 400 });
    }

    // 1. Pehle invoice fetch karein using crminvoice table
    const existingInvoices = await db.select().from(crminvoice).where(eq(crminvoice.id, id)).limit(1);
    const existingInvoice = existingInvoices[0];
    
    if (!existingInvoice) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }

    // 2. Invoice ka status 'Closed' update karein
    await db.update(crminvoice)
      .set({ status: 'Paid' })
      .where(eq(crminvoice.id, id));

    // 3. Associated Property ka status bhi 'Sold' update karein
    if (existingInvoice.propertyid) {
      await db.update(property)
        .set({ status: 'Sold' })
        .where(eq(property.id, existingInvoice.propertyid));
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice closed and property marked as Sold successfully!' 
    });
  } catch (error: any) {
    console.error('Invoice PUT Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}