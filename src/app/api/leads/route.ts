'use server';

import { db } from '@/db';
import { customer, leads } from '@/db/schema';
import { eq, desc, lte, or, like, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

type DueLeadItem = {
  leadId: string;
  customerId: string;
  customerName: string;
  phone: string;
  remarks: string | null;
  nextFollowupDate: string;
  status: string | null;
};

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export async function getDashboardData(searchQuery?: string) {
  const today = getTodayDate();

  let customersQuery = db.select().from(customer);
  if (searchQuery && searchQuery.trim() !== '') {
    const q = `%${searchQuery.trim()}%`;
    customersQuery = customersQuery.where(
      or(
        like(customer.fullname, q),
        like(customer.phone, q),
        like(customer.id, q)
      )
    ) as any;
  }

  const allCustomers = await customersQuery.all();

  // 1. Updated Subquery: created_at ke time ke hisaab se sab se latest lead ki ID nikalna
  const latestLeadsSubquery = db
    .select({
      id: sql<string>`(
        SELECT id FROM leads 
        WHERE customer_id = ${leads.customerId} 
        ORDER BY created_at DESC 
        LIMIT 1
      )`.as('latest_lead_id'),
    })
    .from(leads)
    .groupBy(leads.customerId);

  const latestLeadIdsResult = await latestLeadsSubquery.all();
  const latestLeadIds = latestLeadIdsResult.map((row) => row.id);

  let dueLeads: DueLeadItem[] = [];

  if (latestLeadIds.length > 0) {
    // 2. Fetch only the latest leads whose nextFollowupDate is today or earlier
    dueLeads = await db
      .select({
        leadId: leads.id,
        customerId: customer.id,
        customerName: customer.fullname,
        phone: customer.phone,
        remarks: leads.remarks,
        nextFollowupDate: leads.nextFollowupDate,
        status: leads.status,
      })
      .from(leads)
      .innerJoin(customer, eq(leads.customerId, customer.id))
      .where(
        sql`${leads.id} IN (${sql.join(latestLeadIds, sql`, `)}) AND ${lte(leads.nextFollowupDate, today)}`
      )
      .orderBy(desc(leads.createdAt))
      .all();
  }

  return { allCustomers, dueLeads };
}

export async function getCustomerHistory(customerId: string) {
  if (!customerId) return [];
  
  const history = await db
    .select()
    .from(leads)
    .where(eq(leads.customerId, customerId))
    .orderBy(desc(leads.createdAt))
    .all();

  return history;
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
  });

  revalidatePath('/leads');
}