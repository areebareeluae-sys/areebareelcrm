import { NextResponse } from 'next/server';
import { db } from '@/db'; // Apna path check kar Lein
import { customer, property } from '@/db/schema'; // Apna path check kar Lein
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // 1. Total Customers & Properties Count
    const totalCustomersResult = await db.select({ count: sql<number>`count(*)` }).from(customer);
    const totalCustomers = totalCustomersResult[0]?.count || 0;

    const totalPropertiesResult = await db.select({ count: sql<number>`count(*)` }).from(property);
    const totalProperties = totalPropertiesResult[0]?.count || 0;

    // 2. Property Status Counts (Active, Closed, etc.)
    const propertyStatusRows = await db
      .select({
        status: property.status,
        count: sql<number>`count(*)`
      })
      .from(property)
      .groupBy(property.status);

    const propertyStatus: Record<string, number> = {};
    propertyStatusRows.forEach(row => {
      propertyStatus[row.status || 'Unknown'] = row.count;
    });

    // 3. Buyer vs Seller Count from Properties table
    // Properties mein salescustomerid seller hai aur buyercustomerid buyer hai
    const allProperties = await db.select({
      salescustomerid: property.salescustomerid,
      buyercustomerid: property.buyercustomerid,
    }).from(property);

    const sellersSet = new Set<string>();
    const buyersSet = new Set<string>();

    allProperties.forEach(p => {
      if (p.salescustomerid) sellersSet.add(p.salescustomerid);
      if (p.buyercustomerid) buyersSet.add(p.buyercustomerid);
    });

    // 4. Financial / Earnings Breakdown (Advance Received, Pending, Received)
    const financialRows = await db.select({
      advance: property.advance,
      closedprice: property.closedprice,
      status: property.status,
      fullpaymentdate: property.fullpaymentdate
    }).from(property);

    let totalAdvanceReceived = 0;
    let totalReceived = 0;
    let totalPending = 0;

    financialRows.forEach(row => {
      const adv = Number(row.advance) || 0;
      const closedPrice = Number(row.closedprice) || 0;
      
      totalAdvanceReceived += adv;

      // Agar status Closed hai ya full payment date available hai toh received maana jayega
      if (row.status?.toLowerCase() === 'closed' || row.fullpaymentdate) {
        totalReceived += closedPrice > 0 ? closedPrice : adv;
      } else {
        // Baaki amount pending maani jayegi agar closed price zyada hai
        const pending = (closedPrice - adv);
        totalPending += pending > 0 ? pending : 0;
      }
    });

    // 5. Monthly Sales Chart Aggregation
    const monthlySalesData = await db
      .select({
        month: sql<string>`strftime('%m', ${property.createdAt})`,
        totalSales: sql<number>`sum(CAST(${property.closedprice} AS REAL))`
      })
      .from(property)
      .groupBy(sql`strftime('%m', ${property.createdAt})`);

    const monthsMap: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
      '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
      '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };

    const salesByMonth: Record<string, number> = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    };

    monthlySalesData.forEach((row) => {
      if (row.month && monthsMap[row.month]) {
        salesByMonth[monthsMap[row.month]] = row.totalSales || 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        customersCount: totalCustomers,
        propertiesCount: totalProperties,
        propertyStatus,
        marketRole: {
          totalSellers: sellersSet.size,
          totalBuyers: buyersSet.size,
        },
        earnings: {
          advanceReceived: totalAdvanceReceived,
          received: totalReceived,
          pendingPayments: totalPending,
        },
        monthlySales: salesByMonth,
      }
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}