import { NextResponse } from 'next/server';
import { db } from '@/db';
import { property, customer, crminvoice } from '@/db/schema';
import { eq, like, or, and, SQL } from 'drizzle-orm';
import { cookies } from 'next/headers';

// GET: Closed properties fetch karna aur check karna ke invoice bani hai ya nahi
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    const conditions: SQL[] = [eq(property.status, 'Closed')];
    if (search && search.trim() !== '') {
      const term = `%${search}%`;
      conditions.push(
        or(
          like(property.title, term),
          like(property.city, term),
          like(property.type, term)
        )!
      );
    }

    const propertiesList = await db.select().from(property).where(and(...conditions));

    // Har closed property ke sath Seller, Buyer, aur Existing Invoice check karna
    const detailedProperties = await Promise.all(
      propertiesList.map(async (prop) => {
        let seller = null;
        let buyer = null;
        let existingInvoice = null;

        if (prop.salescustomerid) {
          const sRes = await db.select().from(customer).where(eq(customer.id, prop.salescustomerid));
          seller = sRes[0] || null;
        }
        if (prop.buyercustomerid) {
          const bRes = await db.select().from(customer).where(eq(customer.id, prop.buyercustomerid));
          buyer = bRes[0] || null;
        }

        // Check if invoice already exists for this property
        const invRes = await db.select().from(crminvoice).where(eq(crminvoice.propertyid, prop.id));
        if (invRes.length > 0) {
          existingInvoice = invRes[0];
        }

        return { ...prop, seller, buyer, existingInvoice };
      })
    );

    return NextResponse.json({ success: true, properties: detailedProperties });
  } catch (error) {
    console.error('Invoice GET Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Invoice Create Karna
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || 'Admin';

    const body = await req.json();
    const { propertyid, companycommission, govttax, discount, totalammount } = body;

    if (!propertyid || !totalammount) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Double check if invoice already exists
    const existing = await db.select().from(crminvoice).where(eq(crminvoice.propertyid, propertyid));
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: `Invoice already generated for this property! Invoice ID: ${existing[0].id}`, existingInvoiceId: existing[0].id }, { status: 400 });
    }

    const invoiceId = Date.now().toString();

    await db.insert(crminvoice).values({
      id: invoiceId,
      propertyid: String(propertyid),
      companycommission: Number(companycommission) || 0,
      govttax: String(govttax || '0'),
      discount: String(discount || '0'),
      totalammount: String(totalammount),
      createdby: userId,
      status: 'Active',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Invoice generated successfully!', invoiceId });
  } catch (error) {
    console.error('Invoice POST Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}