import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { eq } from 'drizzle-orm';
import { db } from '@/db'; // Main Database Connection
import { dealeruserscrm } from '@/db/schema'; // Main Database CRM Schema

const client = createClient({
  url: "libsql://areebareeldb-divcodexweb.aws-ap-south-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg5NzU2MjcsImlkIjoiMDFhMDg3NDEtMzEwMS03ZmJhLWExMDEtNWY2OTlmM2U0YWEyIiwia2lkIjoiS1IzcDBOR1pwUXVjdkJ4R0QxYXltY3J1QTliTnMyc1ByOVA4ekdJQWtrNCIsInJpZCI6ImU1NTY5OTM0LTVmOTktNDcxNi05YWE2LTc2ZmQ3MjlkMmJhMCJ9.5skf7vqdaKMf0Xhgkn28v98hQa4KGGBCCsz_ots518Lm6t5ZsmpHfZftpBgXJYTsFJL0Tp1RIylPvNVm64tMAA"
});

const dbs = drizzle(client);

export const dealerUsers = sqliteTable('dealer_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  cnicNumber: text('cnic_number').notNull().unique(),
  phoneNumber: text('phone_number').notNull().unique(),
  companyName: text('company_name').notNull(),
  companyAddress: text('company_address').notNull(),
  frontCnicImage: text('front_cnic_image').notNull(),
  backCnicImage: text('back_cnic_image').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] })
    .notNull()
    .default('pending'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// GET: Fetch All Dealers from `dbs`
export async function GET() {
  try {
    const dealers = await dbs.select().from(dealerUsers).all();
    return NextResponse.json({ data: dealers }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dealers.' }, { status: 500 });
  }
}

// PATCH: Update Status, Toggle Active/Inactive, & Copy/Update in Main DB
export async function PATCH(req: Request) {
  try {
    const { id, status, isActive } = await req.json();

    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid ID or status.' }, { status: 400 });
    }

    // Find record in `dbs`
    const dealerRecord = await dbs
      .select()
      .from(dealerUsers)
      .where(eq(dealerUsers.id, id))
      .limit(1);

    if (dealerRecord.length === 0) {
      return NextResponse.json({ error: 'Dealer record not found.' }, { status: 404 });
    }

    const dealer = dealerRecord[0];
    const newIsActive = isActive !== undefined ? isActive : status === 'approved';

    // 1. Update status and isActive in `dbs` Turso DB
    await dbs
      .update(dealerUsers)
      .set({ 
        status,
        isActive: newIsActive 
      })
      .where(eq(dealerUsers.id, id));

    // 2. If Approved, handle password and sync with main `db` (`dealeruserscrm`)
    if (status === 'approved') {
      const cleanCnic = dealer.cnicNumber.replace(/\D/g, ''); 
      const passwordLastSix = cleanCnic.slice(-6); // Last 6 digits of CNIC as password

      try {
        // Check if already exists in main CRM db by email or cnic
        const existingCrmUser = await db
          .select()
          .from(dealeruserscrm)
          .where(eq(dealeruserscrm.email, dealer.email))
          .limit(1);

        if (existingCrmUser.length > 0) {
          // Update existing record in main db
          await db
            .update(dealeruserscrm)
            .set({
              status: 'approved',
              isActive: newIsActive,
            })
            .where(eq(dealeruserscrm.email, dealer.email));
        } else {
          // Insert new record into main db
          await db.insert(dealeruserscrm).values({
            name: dealer.name,
            email: dealer.email,
            cnicNumber: dealer.cnicNumber,
            password: passwordLastSix,
            phoneNumber: dealer.phoneNumber,
            companyName: dealer.companyName,
            companyAddress: dealer.companyAddress,
            frontCnicImage: dealer.frontCnicImage,
            backCnicImage: dealer.backCnicImage,
            status: 'approved',
            isActive: newIsActive,
          });
        }
      } catch (dbError) {
        console.error('Main DB Sync Error:', dbError);
      }
    } else if (status === 'rejected') {
      // If rejected, ensure isActive is set to false in main db if exists
      try {
        await db
          .update(dealeruserscrm)
          .set({
            status: 'rejected',
            isActive: false,
          })
          .where(eq(dealeruserscrm.email, dealer.email));
      } catch (err) {
        console.error('Main DB Rejection Sync Error:', err);
      }
    }

    return NextResponse.json(
      { message: `Dealer application successfully ${status}!` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update status.' }, { status: 500 });
  }
}