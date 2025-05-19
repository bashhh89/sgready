// Simple test script to verify font rendering in PDF generation
const htmlPdfNode = require('html-pdf-node');
const fs = require('fs');
const path = require('path');

// Create test HTML with various content to verify font rendering
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Font Rendering Test</title>
  <style>
    /* Modern sans-serif font stack */
    body, p, div, span, li, td, th {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
      line-height: 1.6;
      font-size: 11pt;
    }
    
    /* Ensure all text uses sans-serif fonts, even when rendered from markdown */
    * {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    }
    
    .page-container { 
      width: 100%; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 25mm 20mm; 
    } 
    
    h1, h2, h3, h4 { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #103138; 
      margin-top: 1.5em; 
      margin-bottom: 0.5em; 
      line-height: 1.3; 
      font-weight: 600;
    }
    
    h1 { font-size: 24pt; border-bottom: 1px solid #eee; padding-bottom: 0.3em;}
    h2 { font-size: 18pt; }
    h3 { font-size: 16pt; }
    
    p { margin-bottom: 1em; }
    ul, ol { margin-bottom: 1em; padding-left: 1.5em; }
    li { margin-bottom: 0.5em; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    
    .test-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    
    /* Only pre tags should use monospace */
    pre { 
      font-family: 'Courier New', Courier, monospace; 
      background-color: #f5f5f5; 
      padding: 1em; 
      border-radius: 4px; 
      font-size: 10pt;
    }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; }
    
    .footer { 
      text-align: center; 
      margin-top: 40px; 
      padding-top: 15px; 
      border-top: 1px solid #103138; 
      font-size: 9pt; 
      color: #555; 
    }
  </style>
</head>
<body>
  <div class="page-container">
    <h1>Font Rendering Test Document</h1>
    <p>This document tests whether sans-serif fonts are properly applied to all text elements in the generated PDF.</p>
    
    <div class="test-section">
      <h2>Test Section: Basic Text Formatting</h2>
      <p>This paragraph should use a <strong>sans-serif</strong> font. It includes some <em>italic text</em> and <strong>bold text</strong> to test formatting.</p>
      <p>This text should not appear in a monospace/typewriter font under any circumstances.</p>
    </div>
    
    <div class="test-section">
      <h2>Test Section: Lists</h2>
      <h3>Bullet List</h3>
      <ul>
        <li>First list item with <strong>bold text</strong></li>
        <li>Second list item with <em>italic text</em></li>
        <li>Third list item with <strong><em>bold italic text</em></strong></li>
      </ul>
      
      <h3>Numbered List</h3>
      <ol>
        <li>First numbered item</li>
        <li>Second numbered item</li>
        <li>Third numbered item</li>
      </ol>
    </div>
    
    <div class="test-section">
      <h2>Test Section: Table</h2>
      <table>
        <tr>
          <th>Header 1</th>
          <th>Header 2</th>
          <th>Header 3</th>
        </tr>
        <tr>
          <td>Cell 1-1</td>
          <td>Cell 1-2</td>
          <td>Cell 1-3</td>
        </tr>
        <tr>
          <td>Cell 2-1</td>
          <td>Cell 2-2</td>
          <td>Cell 2-3</td>
        </tr>
      </table>
    </div>
    
    <div class="test-section">
      <h2>Test Section: Code Block</h2>
      <p>The following is a code block that <em>should</em> use a monospace font:</p>
      <pre>function testFunction() {
  console.log('Hello world!');
  // This is a comment
  return true;
}</pre>
      <p>But regular text like this should continue to use sans-serif fonts.</p>
    </div>
    
    <div class="test-section">
      <h2>Test Section: Key Findings Example</h2>
      <h3>Strengths:</h3>
      <ul>
        <li><strong>Initiative in Exploring AI:</strong> The organization has shown initiative by launching a training program focused on upskilling teams in machine learning and data analytics.</li>
        <li><strong>Awareness of Potential:</strong> The organization recognizes the significant impact that technologies like AI, ML, and blockchain could have on their operations.</li>
      </ul>
      
      <h3>Weaknesses:</h3>
      <ul>
        <li><strong>Limited AI Strategy:</strong> The absence of a formal AI strategy limits the organization's ability to systematically integrate AI into its operations.</li>
        <li><strong>Data Governance:</strong> Rated as moderately mature, the data governance framework may not fully support data readiness and regulatory compliance.</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>Font Rendering Test &copy; ${new Date().getFullYear()}. This is a test document to verify that all text renders in sans-serif fonts.</p>
    </div>
  </div>
</body>
</html>
`;

async function generateTestPdf() {
  try {
    console.log('Generating test PDF to verify font rendering...');
    
    const file = { content: htmlContent };
    const options = {
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      printBackground: true,
      preferCSSPageSize: false,
      args: ['--font-render-hinting=none', '--disable-font-subpixel-positioning'],
    };
    
    const pdfBuffer = await htmlPdfNode.generatePdf(file, options);
    
    // Save the PDF file
    const outputPath = path.join(__dirname, 'font-rendering-test.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('Test PDF generated successfully!');
    console.log(`Output saved to: ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error('Error generating test PDF:', error);
    return false;
  }
}

// Run the test
generateTestPdf(); 