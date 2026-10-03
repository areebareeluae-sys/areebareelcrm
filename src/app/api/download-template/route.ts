import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const templateData = [
      {
        "Building No": 1,
        "Building Name": "Intas 1",
        "Security Guard": "Sanjay",
        "Contact Number": "971-50-2840639",
        "Construction Status": "Completed",
        "Tags": "DLRC, Block A"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="security_guards_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}