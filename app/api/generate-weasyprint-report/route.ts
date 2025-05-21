import { NextResponse } from 'next/server';
import { generateScorecardHTML } from '../generate-scorecard-report-v6/scorecard-html-generator';

// WeasyPrint service configuration
const WEASYPRINT_SERVICE_URL = 'http://168.231.86.114:5001/generate-pdf';

/**
 * API route handler for generating PDF using WeasyPrint service
 * POST /api/generate-weasyprint-report
 */
export async function POST(request: Request) {
  try {
    // Get the report data from the request body
    const reportData = await request.json();
    
    // Validate input data
    if (!reportData || !reportData.UserInformation || !reportData.ScoreInformation) {
      return NextResponse.json(
        { error: 'Invalid input data. UserInformation and ScoreInformation are required.' },
        { status: 400 }
      );
    }
    
    try {
      // Generate HTML using the scorecard HTML generator
      const html = await generateScorecardHTML(reportData);
      
      // Add PDF-specific styles to ensure proper rendering
      const htmlWithPdfStyles = html.replace('</head>',
        `<style>
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .page-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .slide-page {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: var(--space-4) !important;
            page-break-inside: avoid;
          }
          .section-wrapper {
            width: 100% !important;
            margin-bottom: var(--space-4) !important;
            page-break-inside: avoid;
          }
          .section-asymmetric {
            width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            gap: var(--space-4) !important;
          }
          .section-sidebar {
            flex: 0 0 25% !important;
            max-width: 25% !important;
          }
          .section-content {
            flex: 1 !important;
            width: 75% !important;
            max-width: 75% !important;
          }
          .card, .content-card {
            width: 100% !important;
            page-break-inside: avoid;
          }
          .action-item, .qa-item, .findings-card, .weaknesses-card, .feature-box {
            page-break-inside: avoid;
          }
          
          /* Enhanced Q&A section styling */
          .qa-phase {
            margin-bottom: 20px;
            page-break-inside: avoid;
            width: 100% !important;
          }
          
          .phase-title {
            font-weight: 700;
            border-bottom: 2px solid #20E28F;
            padding-bottom: 5px;
            margin-bottom: 15px;
            width: 100% !important;
          }
          
          .qa-item {
            border-left: 4px solid #20E28F;
            margin-bottom: 15px;
            page-break-inside: avoid;
            width: 100% !important;
          }
          
          .qa-question {
            font-weight: 600;
            position: relative;
            padding-left: 25px;
            width: 100% !important;
          }
          
          .qa-question::before {
            content: 'Q:';
            position: absolute;
            left: 0;
            font-weight: 700;
            color: #20E28F;
          }
          
          .qa-answer {
            position: relative;
            padding-left: 25px;
            width: 100% !important;
          }
          
          .qa-answer::before {
            content: 'A:';
            position: absolute;
            left: 0;
            font-weight: 700;
            color: #01CEFE;
          }
          
          /* Hide any unprocessed handlebars templates */
          [class*="qa"]:empty,
          .qa-phase:empty,
          .phase-title:empty,
          .qa-item:has(> :empty) {
            display: none;
          }
        </style>
        </head>`
      );
      
      // Log request being made to WeasyPrint service (for debugging)
      console.log(`Sending request to WeasyPrint service at: ${WEASYPRINT_SERVICE_URL}`);
      
      // Call the WeasyPrint service to generate PDF
      const weasyPrintResponse = await fetch(WEASYPRINT_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html_content: htmlWithPdfStyles,
          pdf_options: {
            presentational_hints: true,
            optimize_size: ['fonts', 'images'],
            full_page: true,
            pdf_format: {
              page_size: 'A4',
              orientation: 'landscape',
              margin: {
                top: '0.5cm',
                right: '0.5cm',
                bottom: '0.5cm',
                left: '0.5cm'
              }
            }
          }
        }),
      });
      
      // Check if the WeasyPrint service response is successful
      if (!weasyPrintResponse.ok) {
        // Try to get error details from the response
        let errorDetails = '';
        try {
          const errorData = await weasyPrintResponse.json();
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          errorDetails = await weasyPrintResponse.text();
        }
        
        console.error(`WeasyPrint service error: ${weasyPrintResponse.status} - ${errorDetails}`);
        
        return NextResponse.json(
          { error: `WeasyPrint service error: ${weasyPrintResponse.status}` },
          { status: 500 }
        );
      }
      
      // Get the PDF binary data
      const pdfBuffer = await weasyPrintResponse.arrayBuffer();
      
      // Generate a dynamic filename based on the report data
      const companyName = reportData.UserInformation.CompanyName || 'Company';
      const userName = reportData.UserInformation.UserName || 'User';
      const sanitizedName = `${userName}_${companyName}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `${sanitizedName}_ai_scorecard_${timestamp}.pdf`;
      
      console.log(`PDF generated successfully. Filename: ${filename}`);
      
      // Return the PDF as a downloadable file
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
      
    } catch (htmlError) {
      console.error('Error generating HTML:', htmlError);
      return NextResponse.json(
        { error: 'Failed to generate HTML for the report' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 