'use server';

import { db } from '@/db'; // Apne db ka path check kar lein
import { customer, leads } from '@/db/schema';
import { eq, desc, lte, or, like } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

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

  // Aaj ki due leads - Latest follow-up date/creation sab se upar
  const dueLeads = await db
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
    .where(lte(leads.nextFollowupDate, today))
    .orderBy(desc(leads.createdAt))
    .all();

  return { allCustomers, dueLeads };
}

export async function getCustomerHistory(customerId: string) {
  if (!customerId) return [];
  // History mein latest record sab se upar show hoga
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
  const status = formData.get('status') as string || 'Pending';

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