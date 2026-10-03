import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customer, property, securityGuards } from '@/db/schema';
import { sql, or, like } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cityQuery = searchParams.get('city') || '';
    const tagQuery = searchParams.get('tag') || '';
    const searchQuery = searchParams.get('search') || '';

    // Teeno tables se independent data fetch karna
    const customersList = await db.select().from(customer);
    const propertiesList = await db.select().from(property);
    const guardsList = await db.select().from(securityGuards);

    let filteredCustomers = customersList;
    let filteredProperties = propertiesList;
    let filteredGuards = guardsList;

    // City filter apply karna
    if (cityQuery) {
      const q = cityQuery.toLowerCase();
      filteredCustomers = filteredCustomers.filter(c => c.city?.toLowerCase().includes(q));
      filteredProperties = filteredProperties.filter(p => p.city?.toLowerCase().includes(q));
    }

    // Tag filter apply karna
    if (tagQuery) {
      const q = tagQuery.toLowerCase();
      filteredCustomers = filteredCustomers.filter(c => c.tags?.toLowerCase().includes(q));
      filteredProperties = filteredProperties.filter(p => p.tags?.toLowerCase().includes(q));
      filteredGuards = filteredGuards.filter(g => g.tags?.toLowerCase().includes(q));
    }

    // General Search query apply karna
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredCustomers = filteredCustomers.filter(c => c.fullname?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q));
      filteredProperties = filteredProperties.filter(p => p.title?.toLowerCase().includes(q) || p.type?.toLowerCase().includes(q));
      filteredGuards = filteredGuards.filter(g => g.securityGuard?.toLowerCase().includes(q) || g.buildingName?.toLowerCase().includes(q));
    }

    return NextResponse.json({
      success: true,
      customers: filteredCustomers,
      properties: filteredProperties,
      guards: filteredGuards,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}