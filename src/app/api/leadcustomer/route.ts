'use server';

import { db } from '@/db';
import { leadcustomer } from '@/db/schema';
import { eq, or, like, and, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper function jo empty ya undefined fields ko safely null ya default value mein convert kare
const cleanField = (value: FormDataEntryValue | null | string, defaultValue: string | null = null) => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return defaultValue;
  }
  return value.trim();
};

// 1. Get All Customers (with optional search filter & status filter)
export async function getCustomers(searchQuery?: string, statusFilter?: string) {
  let conditions = [];

  if (searchQuery && searchQuery.trim() !== '') {
    const term = `%${searchQuery}%`;
    conditions.push(
      or(
        like(leadcustomer.fullname, term),
        like(leadcustomer.email, term),
        like(leadcustomer.phone, term),
        like(leadcustomer.city, term),
        like(leadcustomer.tags, term)
      )
    );
  }

  if (statusFilter && statusFilter.trim() !== '') {
    conditions.push(eq(leadcustomer.status, statusFilter));
  }

  if (conditions.length > 0) {
    return await db.select().from(leadcustomer).where(and(...conditions));
  }

  return await db.select().from(leadcustomer);
}

// 2. Add Customer Action
export async function addCustomer(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'admin';

  const fullname = formData.get('fullname') as string;
  const phone = formData.get('phone') as string;

  if (!fullname || !phone) {
    return { success: false, error: 'Full Name and Phone are required.' };
  }

  // Check if phone number already exists
  const existingCustomer = await db.select().from(leadcustomer).where(eq(leadcustomer.phone, phone)).limit(1);
  
  if (existingCustomer.length > 0) {
    return { success: false, error: 'Yeh phone number pehle se registered hai!' };
  }

  // Safe cleaning for all optional fields to prevent NOT NULL constraint crashes
  const email = cleanField(formData.get('email'));
  const country = cleanField(formData.get('country'), 'Pakistan');
  const city = cleanField(formData.get('city'), 'Lahore');
  const address = cleanField(formData.get('address'), ''); // Agar address khali ho toh empty string jayegi, ya agar column nullable hai toh null rakhein
  const tags = cleanField(formData.get('tags'));
  
  const refname = cleanField(formData.get('refname'));
  const refnumber = cleanField(formData.get('refnumber'));
  const refemail = cleanField(formData.get('refemail'));
  const refaddress = cleanField(formData.get('refaddress'));

  try {
    await db.insert(leadcustomer).values({
      id: Date.now().toString(),
      fullname,
      email,
      phone,
      country,
      city,
      address,
      tags,
      refname,
      refnumber,
      refemail,
      refaddress,
      createdby: userId,
      status: 'Active',
      createdAt: new Date().toISOString(),
    });

    revalidatePath('/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Add Customer Error:', error);
    return { success: false, error: error.message || 'Failed to add customer.' };
  }
}

// 3. Update Customer Action
export async function updateCustomer(id: string, formData: FormData) {
  const fullname = formData.get('fullname') as string;
  const phone = formData.get('phone') as string;

  if (!fullname || !phone) {
    return { success: false, error: 'Full Name and Phone are required.' };
  }

  // Check if phone number already exists for another customer
  const existingCustomerWithPhone = await db
    .select()
    .from(leadcustomer)
    .where(and(eq(leadcustomer.phone, phone), ne(leadcustomer.id, id)))
    .limit(1);

  if (existingCustomerWithPhone.length > 0) {
    return { success: false, error: 'Yeh phone number kisi aur lead ke paas pehle se registered hai!' };
  }

  const email = cleanField(formData.get('email'));
  const country = cleanField(formData.get('country'), 'Pakistan');
  const city = cleanField(formData.get('city'), 'Lahore');
  const address = cleanField(formData.get('address'), '');
  const tags = cleanField(formData.get('tags'));
  
  const refname = cleanField(formData.get('refname'));
  const refnumber = cleanField(formData.get('refnumber'));
  const refemail = cleanField(formData.get('refemail'));
  const refaddress = cleanField(formData.get('refaddress'));

  try {
    await db.update(leadcustomer)
      .set({
        fullname,
        email,
        phone,
        country,
        city,
        address,
        tags,
        refname,
        refnumber,
        refemail,
        refaddress,
      })
      .where(eq(leadcustomer.id, id));

    revalidatePath('/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Update Customer Error:', error);
    return { success: false, error: error.message || 'Failed to update customer.' };
  }
}

// 4. Delete Customer Action
export async function deleteCustomer(id: string) {
  try {
    await db.delete(leadcustomer).where(eq(leadcustomer.id, id));
    revalidatePath('/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Delete Customer Error:', error);
    return { success: false, error: 'Failed to delete customer.' };
  }
}

export async function GET() {
  try {
    const data = await db.select().from(leadcustomer);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}