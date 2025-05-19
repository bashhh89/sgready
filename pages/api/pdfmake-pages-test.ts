import type { NextApiRequest, NextApiResponse } from 'next';
import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('[PDFMAKE FONT FIX TEST] GET /api/pdfmake-pages-test CALLED');
  try {
    const regularFontPath = path.join(process.cwd(), 'public', 'fonts', 'PlusJakartaSans-Regular.ttf');
    const boldFontPath = path.join(process.cwd(), 'public', 'fonts', 'PlusJakartaSans-Bold.ttf');

    console.log('[PDFMAKE FONT FIX TEST] Expected Font paths:', { regularFontPath, boldFontPath });

    if (!fs.existsSync(regularFontPath)) {
      const errorMsg = `Regular font NOT FOUND at: ${regularFontPath}`;
      console.error(errorMsg);
      return res.status(500).send(errorMsg);
    }
    if (!fs.existsSync(boldFontPath)) {
      const errorMsg = `Bold font NOT FOUND at: ${boldFontPath}`;
      console.error(errorMsg);
      return res.status(500).send(errorMsg);
    }
    console.log('[PDFMAKE FONT FIX TEST] Both TTF font files confirmed to exist on disk.');

    // Create fonts configuration with direct file paths
    const fonts = {
      PlusJakartaSans: {
        normal: regularFontPath,
        bold: boldFontPath
      }
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
        { text: 'Font Test: Plus Jakarta Sans', style: 'header' },
        { text: 'This should be Plus Jakarta Sans Regular.' },
        { text: 'This should be Plus Jakarta Sans Bold.', bold: true },
        { text: 'If this looks like a generic computer font, the custom font is NOT working.', margin: [0, 20, 0, 0] }
      ],
      defaultStyle: {
        font: 'PlusJakartaSans' // Set PlusJakartaSans as the default
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true, // This will use PlusJakartaSans Bold
          marginBottom: 10
        }
      }
    };

    console.log('[PDFMAKE FONT FIX TEST] Creating PDF document with new font setup...');
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    return new Promise<void>((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      pdfDoc.on('end', () => {
        try {
          const result = Buffer.concat(chunks);
          console.log('[PDFMAKE FONT FIX TEST] PDF generated, size:', result.length);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Length', String(result.length));
          res.setHeader('Content-Disposition', 'attachment; filename="pdfmake-font-fix-test.pdf"');
          res.status(200).send(result);
          resolve();
        } catch (e) { console.error('[PDFMAKE FONT FIX TEST] Error sending response:', e); reject(e); }
      });
      pdfDoc.on('error', (err) => { console.error('[PDFMAKE FONT FIX TEST] Error in PDF stream:', err); if (!res.headersSent) { res.status(500).send('Error in PDF stream'); } reject(err); });
      pdfDoc.end();
    });

  } catch (error: any) {
    console.error('[PDFMAKE FONT FIX TEST] Critical error in handler:', error);
    if (!res.headersSent) {
      res.status(500).send(`Critical error generating PDF: ${error.message}`);
    }
  }
} 