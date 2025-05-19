import { NextRequest, NextResponse } from 'next/server';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  console.log('[TEST-PDF] GET handler reached');

  try {
    // Define fonts - just use Roboto to avoid any font loading issues
    const fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };

    // Create PDF printer with fonts
    const printer = new PdfPrinter(fonts);
    
    // Create a very basic document definition
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Ultra Simple PDF Test', fontSize: 20, bold: true, margin: [0, 0, 0, 20] },
        { text: 'This is a minimal test PDF with no custom fonts or complex formatting', fontSize: 12 }
      ]
    };
    
    // Generate PDF
    console.log('[TEST-PDF] Creating PDF document');
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Return as a promise
    return new Promise<NextResponse>((resolve) => {
      const chunks: Buffer[] = [];
      
      pdfDoc.on('data', (chunk: Buffer) => {
        console.log('[TEST-PDF] Received chunk of PDF data');
        chunks.push(chunk);
      });
      
      pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        console.log('[TEST-PDF] PDF generated successfully, size:', result.length);
        
        resolve(
          new NextResponse(result, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="ultra-simple-test.pdf"',
              'Content-Length': result.length.toString()
            }
          })
        );
      });
      
      // End the document to flush the output
      pdfDoc.end();
    });
  } catch (error) {
    console.error('[TEST-PDF] Error:', error);
    return NextResponse.json(
      { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
