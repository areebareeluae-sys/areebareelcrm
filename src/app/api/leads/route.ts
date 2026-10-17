'use server';

import { db } from '@/db';
import { leadcustomer ,leads } from '@/db/schema';
import { eq, desc, or, like, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
type DueLeadItem = {
  leadId: string;
  customerId: string;
  customerName: string;
  phone: string;
  remarks: string | null;
  nextFollowupDate: string | null;
  status: string | null;
};

// Get local date string YYYY-MM-DD safely
function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getDashboardData(searchQuery?: string) {
  const today = getTodayDate();

  let customersQuery = db.select().from(leadcustomer);
  
  if (searchQuery && searchQuery.trim() !== '') {
    const q = `%${searchQuery.trim()}%`;
    customersQuery = customersQuery.where(
      or(
        like(leadcustomer.fullname, q),
        like(leadcustomer.phone, q),
        like(leadcustomer.id, q)
      )
    ) as typeof customersQuery;
  }

  const allCustomers = await customersQuery.all();

  // Aaj aur aaj se pehle ki due dates wale customers ko dueLeads mein fetch karna
  const rawDueLeads = await db
    .select()
    .from(leadcustomer)
    .where(lte(leadcustomer.nextFollowupDate, today))
    .orderBy(desc(leadcustomer.createdAt))
    .all();

  // Type compatibility maintain karne ke liye mapping
  const dueLeads: DueLeadItem[] = rawDueLeads.map((c) => ({
    leadId: c.id,
    customerId: c.id,
    customerName: c.fullname,
    phone: c.phone,
    remarks: null,
    nextFollowupDate: c.nextFollowupDate,
    status: c.status,
  }));

  return { allCustomers, dueLeads };
}

export async function getCustomerHistory(customerId: string) {
  if (!customerId) return [];
  
  // Leads table khatam hone ki wajah se empty array ya customer record return karein
  const customer = await db.select().from(leads).where(eq(leads.customerId, customerId)).all();
  return customer;
}

export async function saveLead(formData: FormData) {
  const customerId = formData.get('customerId') as string;
  const remarks = formData.get('remarks') as string;
  const nextFollowupDate = formData.get('nextFollowupDate') as string;
  const status = (formData.get('status') as string) || 'Pending';

  if (!customerId || !remarks || !nextFollowupDate) {
    throw new Error('Enter all required fields: Customer, Remarks, Next Follow-up Date.');
  }
await db
    .update(leadcustomer)
    .set({
      nextFollowupDate,
    })
    .where(eq(leadcustomer.id, customerId));
  await db.insert(leads).values({
    id: randomUUID(),
    customerId,
    remarks,
    status,
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
  });

  revalidatePath('/leads');
}