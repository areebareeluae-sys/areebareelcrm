'use server';

import { db } from '@/db';
import { customer } from '@/db/schema';
import { eq, or, like, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// 1. Get All Customers (with optional search filter & status filter)
export async function getCustomers(searchQuery?: string, statusFilter?: string) {
  let conditions = [];

  // Search filter check
  if (searchQuery && searchQuery.trim() !== '') {
    const term = `%${searchQuery}%`;
    conditions.push(
      or(
        like(customer.fullname, term),
        like(customer.email, term),
        like(customer.phone, term),
        like(customer.city, term)
      )
    );
  }

  // Status filter check (e.g. 'Active')
  if (statusFilter && statusFilter.trim() !== '') {
    conditions.push(eq(customer.status, statusFilter));
  }

  if (conditions.length > 0) {
    return await db.select().from(customer).where(and(...conditions));
  }

  return await db.select().from(customer);
}

// 2. Add Customer Action
export async function addCustomer(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'admin'; // Cookie se createdby id uthayega

  const fullname = formData.get('fullname') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const country = formData.get('country') as string;
  const city = formData.get('city') as string;
  const address = formData.get('address') as string;
  
  const refname = formData.get('refname') as string;
  const refnumber = formData.get('refnumber') as string;
  const refemail = formData.get('refemail') as string;
  const refaddress = formData.get('refaddress') as string;

  try {
    await db.insert(customer).values({
      id: Date.now().toString(),
      fullname,
      email,
      phone,
      country,
      city,
      address,
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
    return { success: false, error: 'Failed to add customer.' };
  }
}

// 3. Update Customer Action
export async function updateCustomer(id: string, formData: FormData) {
  const fullname = formData.get('fullname') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const country = formData.get('country') as string;
  const city = formData.get('city') as string;
  const address = formData.get('address') as string;
  
  const refname = formData.get('refname') as string;
  const refnumber = formData.get('refnumber') as string;
  const refemail = formData.get('refemail') as string;
  const refaddress = formData.get('refaddress') as string;

  try {
    await db.update(customer)
      .set({
        fullname,
        email,
        phone,
        country,
        city,
        address,
        refname,
        refnumber,
        refemail,
        refaddress,
      })
      .where(eq(customer.id, id));

    revalidatePath('/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Update Customer Error:', error);
    return { success: false, error: 'Failed to update customer.' };
  }
}

// 4. Delete Customer Action
export async function deleteCustomer(id: string) {
  try {
    await db.delete(customer).where(eq(customer.id, id));
    revalidatePath('/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Delete Customer Error:', error);
    return { success: false, error: 'Failed to delete customer.' };
  }
}

export async function GET() {
  try {
    const data = await db.select().from(customer);
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