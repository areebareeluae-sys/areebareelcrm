'use server';

import { db } from '@/db';
import { leadcustomer, leads } from '@/db/schema';
import { eq, desc, or, like, lte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

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

  // Optimized single-pass subquery for latest leads due today or earlier
  const dueLeads = await db
    .select({
      leadId: leads.id,
      customerId: leadcustomer.id,
      customerName: leadcustomer.fullname,
      phone: leadcustomer.phone,
      remarks: leads.remarks,
      nextFollowupDate: leads.nextFollowupDate,
      status: leads.status,
    })
    .from(leads)
    .innerJoin(leadcustomer, eq(leads.customerId, leadcustomer.id))
    .where(
      sql`${leads.id} IN (
        SELECT id FROM leads l2 
        WHERE l2.customer_id = ${leads.customerId} 
        ORDER BY l2.created_at DESC 
        LIMIT 1
      ) AND ${lte(leads.nextFollowupDate, today)}`
    )
    .orderBy(desc(leads.createdAt))
    .all();

  return { allCustomers, dueLeads };
}

export async function getCustomerHistory(customerId: string) {
  if (!customerId) return [];
  
  return await db
    .select()
    .from(leads)
    .where(eq(leads.customerId, customerId))
    .orderBy(desc(leads.createdAt))
    .all();
}

export async function saveLead(formData: FormData) {
  const customerId = formData.get('customerId') as string;
  const remarks = formData.get('remarks') as string;
  const nextFollowupDate = formData.get('nextFollowupDate') as string;
  const status = (formData.get('status') as string) || 'Pending';

  if (!customerId || !remarks || !nextFollowupDate) {
    throw new Error('Tamama fields lazmi hain!');
  }

  await db.insert(leads).values({
    id: randomUUID(),
    customerId,
    remarks,
    nextFollowupDate,
    status,
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
  });

  revalidatePath('/leads');
}