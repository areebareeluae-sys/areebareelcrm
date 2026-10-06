import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/db';
import { securityGuards } from '@/db/schema';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let parsedData: any[] = [];

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Excel Parsing
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      parsedData = rows.map((row) => ({
        id: randomUUID(),
        buildingNo: Number(row['Building No'] || row['buildingNo'] || 0),
        buildingName: String(row['Building Name'] || row['buildingName'] || ''),
        securityGuard: String(row['Security Guard'] || row['securityGuard'] || ''),
        contactNumber: String(row['Contact Number'] || row['contactNumber'] || ''),
        description: String(row['Description'] || row['description'] || ''),
        constructionStatus: String(row['Construction Status'] || row['constructionStatus'] || 'Completed'),
        tags: String(row['Tags'] || row['tags'] || ''),
        createdAt: new Date().toISOString(),
      }));

    } else if (fileName.endsWith('.pdf')) {
      // 👈 Fixed TypeScript error using `as any` casting
      const pdfParse = await import('pdf-parse');
      const pdfData = await (pdfParse as any)(buffer);
      console.log("PDF Text Extracted:", pdfData.text);
      
      // Yahan aap PDF text se data extract karne ka custom logic likh sakte hain
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload Excel or PDF.' }, { status: 400 });
    }

    // Database Insert
    if (parsedData.length > 0) {
      for (const item of parsedData) {
        await db.insert(securityGuards).values(item);
      }
    }

    return NextResponse.json({ success: true, message: `${parsedData.length} records uploaded successfully!` });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}