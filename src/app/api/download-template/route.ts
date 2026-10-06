import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Sample template row with headers matching the database schema
    const templateData = [
      {
        'Building No': 101,
        'Building Name': 'Sapphire Tower',
        'Security Guard': 'Ali Khan',
        'Contact Number': '+92 300 1234567',
        'Description': 'Main gate security supervisor',
        'Construction Status': 'Completed',
        'Tags': 'vip, block-a'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Security Guards');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="security_guards_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Template Download Error:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}