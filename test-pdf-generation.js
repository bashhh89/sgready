/**
 * Test script for PDF V2 generation
 * 
 * This script tests the PDF generation functionality independently
 * Run with: node test-pdf-generation.js
 */

// Mock browser environment for pdfmake
global.window = {
  document: {
    createElement: () => ({
      style: {},
    }),
  },
};
global.document = {
  getElementById: () => null,
  createElement: () => ({
    style: {},
  }),
};
global.navigator = {
  userAgent: 'node.js',
};

// Import dependencies
const fs = require('fs');
const path = require('path');
const pdfMake = require('pdfmake/build/pdfmake');

// Initialize pdfMake with empty VFS first to avoid errors
pdfMake.vfs = {};

// Try to load pdfMake fonts, with error handling
try {
  const pdfFonts = require('pdfmake/build/vfs_fonts');
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    console.log("Default fonts loaded successfully");
  } else {
    console.warn("Could not load default fonts - initializing empty vfs");
  }
} catch (error) {
  console.warn("Error loading default fonts:", error.message);
}

// Try to read base64 encoded font files
try {
  const plusJakartaSansRegularBase64 = fs.readFileSync(path.join(__dirname, './regular-font-base64.txt'), 'utf8');
  const plusJakartaSansBoldBase64 = fs.readFileSync(path.join(__dirname, './bold-font-base64.txt'), 'utf8');
  
  // Configure fonts
  pdfMake.fonts = {
    PlusJakartaSans: {
      normal: plusJakartaSansRegularBase64,
      bold: plusJakartaSansBoldBase64,
      italics: plusJakartaSansRegularBase64, // Fallback
      bolditalics: plusJakartaSansBoldBase64, // Fallback
    },
    Roboto: { // Fallback font
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf'
    }
  };
  console.log("Custom fonts loaded successfully");
} catch (error) {
  console.warn("Could not load custom fonts:", error.message);
  console.log("Using default Roboto font");
}

// Test data for PDF generation
const testData = {
  UserInformation: {
    UserName: 'Jane Smith',
    CompanyName: 'Acme Tech Solutions',
    Email: 'jsmith@acmetech.com',
    Industry: 'Technology'
  },
  ScoreInformation: {
    AITier: 'Innovator',
    FinalScore: 82,
    ReportID: 'SC-TEST-123'
  },
  FullReportMarkdown: `# AI Efficiency Scorecard

**Strengths:**
- Strong leadership commitment to AI adoption
- Technical team has solid foundation in automation
- Clear business objectives for AI implementation
- Recently completed successful pilot projects

**Weaknesses:**
- Limited data governance policies
- Siloed approach to AI development
- Inconsistent training across departments
- Data quality issues in legacy systems

## Strategic Action Plan
### Immediate Actions (0-30 days)
1. Establish an AI governance committee
2. Conduct data quality assessment
3. Develop comprehensive AI training program

### Short-term Goals (1-3 months)
1. Implement data cleaning protocols
2. Integrate AI systems with existing workflows
3. Create AI performance metrics

### Long-term Vision (3-12 months)
1. Develop AI Center of Excellence
2. Establish cross-functional AI teams
3. Scale successful AI implementations

## Getting Started & Resources
Here are some resources to help you get started:
- **Recommended Reading**: "AI Transformation Playbook"
- **Online Courses**: Stanford's "Machine Learning" on Coursera
- **Communities**: Join AI Practitioners Network
- **Tools**: Begin with our recommended no-code AI platforms

## Illustrative Benchmarks
Industry benchmarks for companies at your stage:
- Average AI productivity improvement: 23%
- Typical implementation timeline: 6-9 months
- Average ROI: 3.5x investment within first year
- Success indicators: 15% reduction in operational costs

## Your Personalized AI Learning Path
Based on your assessment, we recommend:
1. **Start with**: Introduction to AI for Business Leaders
2. **Then progress to**: Data Fundamentals for AI Implementation
3. **Advanced topic**: Change Management for AI Transformation

This report concludes here.`,
  QuestionAnswerHistory: [
    {
      phaseName: 'Industry & Role',
      question: 'What industry does your company operate in?',
      answer: 'Technology',
      answerType: 'select'
    },
    {
      phaseName: 'Current AI Usage',
      question: 'How is your organization currently using AI?',
      answer: 'Experimenting with AI in limited projects|Planning to implement AI solutions',
      answerType: 'checkbox',
      options: ['Not using AI at all', 'Experimenting with AI in limited projects', 'Planning to implement AI solutions', 'Already deployed AI in production', 'AI is core to our business model']
    }
  ]
};

// Define colors
const colors = {
  primaryDarkTeal: '#103138',
  accentGreen: '#20E28F',
  lightMintBg: '#F3FDF5',
  accentBlue: '#01CEFE',
  accentOrange: '#FE7F01',
  yellowAccent: '#FEC401',
  creamBg1: '#FFF9F2',
  creamBg2: '#FFFCF2',
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
};

/**
 * Helper function to extract sections from markdown content
 */
function extractSectionContent(fullMarkdown, titleRegex, endMarkerRegexOrString) {
  if (!fullMarkdown) return '';
  
  const fullReportLines = fullMarkdown.split('\n');
  let content = '';
  let capture = false;
  
  for (const line of fullReportLines) {
    if (titleRegex.test(line)) {
      capture = true;
      continue;
    }
    if (capture) {
      if (typeof endMarkerRegexOrString === 'string' && line.startsWith(endMarkerRegexOrString)) {
        break;
      } else if (endMarkerRegexOrString instanceof RegExp && endMarkerRegexOrString.test(line)) {
        break;
      }
      content += line + '\n';
    }
  }
  return content.trim();
}

/**
 * Basic markdown parser for sections
 */
function parseMarkdownSection(markdownText) {
  if (!markdownText) return [];
  
  const content = [];
  const lines = markdownText.split('\n').map(line => line.trim());

  lines.forEach(line => {
    if (line.startsWith('### ')) { // H3
      content.push({ text: line.substring(4), style: 'h3', margin: [0, 10, 0, 5] });
    } else if (line.startsWith('## ')) { // H2
      content.push({ text: line.substring(3), style: 'h2', margin: [0, 15, 0, 10] });
    } else if (line.startsWith('# ')) { // H1
      content.push({ text: line.substring(2), style: 'h1', margin: [0, 20, 0, 15] });
    } else if (line.startsWith('**') && line.endsWith('**')) {
      content.push({ text: line.substring(2, line.length - 2), style: 'boldText', margin: [0, 5, 0, 5] });
    } else if (line.startsWith('* ') || line.startsWith('- ')) { // Unordered list
      if (content.length > 0 && content[content.length - 1].ul) {
        content[content.length - 1].ul.push({text: line.substring(2), style: 'listItem'});
      } else {
        content.push({ ul: [{text: line.substring(2), style: 'listItem'}], margin: [10, 5, 0, 5] });
      }
    } else if (line.match(/^\d+\.\s/)) { // Ordered list
      const itemText = line.substring(line.indexOf(' ') + 1);
      if (content.length > 0 && content[content.length - 1].ol) {
        content[content.length - 1].ol.push({text: itemText, style: 'listItem'});
      } else {
        content.push({ ol: [{text: itemText, style: 'listItem'}], margin: [10, 5, 0, 5] });
      }
    } else if (line) { // Paragraph
      content.push({ text: line, style: 'paragraph', margin: [0, 0, 0, 8] });
    }
  });
  return content;
}

/**
 * Generate document definition for the scorecard PDF
 */
function generateScorecardDocumentDefinition(SCORECARD_DEBUG_DATA) {
  if (!SCORECARD_DEBUG_DATA) {
    // Fallback if data is not provided
    return {
      content: [{ text: 'Error: Scorecard data is missing.', style: 'error' }],
      styles: { error: { color: 'red', fontSize: 20, bold: true, alignment: 'center', margin: [0, 200, 0, 0] } }
    };
  }

  // Extract sections from FullReportMarkdown
  const keyFindingsStrengthsText = extractSectionContent(
    SCORECARD_DEBUG_DATA.FullReportMarkdown, 
    /\*\*Strengths:\*\*/, 
    /\*\*Weaknesses:\*\*/
  );
  
  const keyFindingsWeaknessesText = extractSectionContent(
    SCORECARD_DEBUG_DATA.FullReportMarkdown, 
    /\*\*Weaknesses:\*\*/, 
    /## Strategic Action Plan/
  );
  
  const strategicActionPlanText = extractSectionContent(
    SCORECARD_DEBUG_DATA.FullReportMarkdown, 
    /## Strategic Action Plan/, 
    /## Getting Started & Resources/
  );
  
  const gettingStartedResourcesText = extractSectionContent(
    SCORECARD_DEBUG_DATA.FullReportMarkdown, 
    /## Getting Started & Resources/, 
    /## Illustrative Benchmarks/
  );
  
  const illustrativeBenchmarksText = extractSectionContent(
    SCORECARD_DEBUG_DATA.FullReportMarkdown, 
    /## Illustrative Benchmarks/, 
    /## Your Personalized AI Learning Path/
  );
  
  const personalizedLearningPathText = extractSectionContent(
    SCORECARD_DEBUG_DATA.FullReportMarkdown, 
    /## Your Personalized AI Learning Path/, 
    /This report concludes here./
  );

  // Convert markdown sections to pdfmake objects
  const strengthsPdfMake = parseMarkdownSection(keyFindingsStrengthsText);
  const weaknessesPdfMake = parseMarkdownSection(keyFindingsWeaknessesText);
  const actionPlanPdfMake = parseMarkdownSection(strategicActionPlanText);
  const resourcesPdfMake = parseMarkdownSection(gettingStartedResourcesText);
  const benchmarksPdfMake = parseMarkdownSection(illustrativeBenchmarksText);
  const learningPathPdfMake = parseMarkdownSection(personalizedLearningPathText);

  // ----- DOCUMENT DEFINITION -----
  const dd = {
    pageSize: 'A4',
    pageMargins: [40, 80, 40, 60], // [left, top, right, bottom]

    header: function(currentPage, pageCount, pageSize) {
      return {
        columns: [
          { text: SCORECARD_DEBUG_DATA.UserInformation.CompanyName + ' - AI Efficiency Scorecard', alignment: 'left', style: 'headerText', margin: [40, 40, 0, 0] },
          { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', style: 'headerPageNumber', margin: [0, 40, 40, 0] }
        ],
      };
    },

    footer: function(currentPage, pageCount) {
      return {
        text: `Report ID: ${SCORECARD_DEBUG_DATA.ScoreInformation.ReportID} | © ${new Date().getFullYear()} ${SCORECARD_DEBUG_DATA.UserInformation.CompanyName}`,
        alignment: 'center',
        style: 'footerText'
      };
    },

    content: [
      // Main Title
      { text: `AI Efficiency Scorecard`, style: 'mainTitle', alignment: 'center' },
      { text: `for ${SCORECARD_DEBUG_DATA.UserInformation.UserName}, ${SCORECARD_DEBUG_DATA.UserInformation.CompanyName}`, style: 'subTitle', alignment: 'center', margin: [0,0,0,30]},

      // User Information Section (Card-like)
      {
        table: {
          widths: ['*'],
          body: [
            [{
              stack: [
                { text: 'User Information', style: 'h2' },
                { text: `Name: ${SCORECARD_DEBUG_DATA.UserInformation.UserName}`, style: 'paragraph' },
                { text: `Company: ${SCORECARD_DEBUG_DATA.UserInformation.CompanyName}`, style: 'paragraph' },
                { text: `Email: ${SCORECARD_DEBUG_DATA.UserInformation.Email}`, style: 'paragraph' },
                { text: `Industry: ${SCORECARD_DEBUG_DATA.UserInformation.Industry}`, style: 'paragraph' },
                { text: `AI Tier: ${SCORECARD_DEBUG_DATA.ScoreInformation.AITier}`, style: 'paragraph', bold: true, color: colors.accentBlue },
                { text: `Final Score: ${SCORECARD_DEBUG_DATA.ScoreInformation.FinalScore || 'N/A'}`, style: 'paragraph' },
              ],
              margin: [15, 15, 15, 15],
            }]
          ]
        },
        layout: {
          fillColor: colors.creamBg1, // Card background
          hLineWidth: function(i, node) { return 0; }, // no horizontal lines
          vLineWidth: function(i, node) { return 0; }, // no vertical lines
          paddingLeft: function(i, node) { return 0; },
          paddingRight: function(i, node) { return 0; },
          paddingTop: function(i, node) { return 0; },
          paddingBottom: function(i, node) { return 0; }
        },
        margin: [0, 0, 0, 20] // Margin below the card
      },
      
      // --- Sections from FullReportMarkdown ---
      // Key Findings (Strengths & Weaknesses)
      { text: 'Key Findings', style: 'h1', pageBreak: 'before', margin: [0,0,0,10] },
      {
        columns: [
          {
            stack: [
              {text: 'Strengths:', style: 'h2', color: colors.accentGreen},
              ...strengthsPdfMake
            ],
            width: '50%',
            margin: [0,0,10,0]
          },
          {
            stack: [
              {text: 'Weaknesses:', style: 'h2', color: colors.accentOrange},
              ...weaknessesPdfMake
            ],
            width: '50%',
            margin: [10,0,0,0]
          }
        ],
        margin: [0,0,0,20]
      },

      // Strategic Action Plan
      { text: 'Strategic Action Plan', style: 'h1', pageBreak: 'before', margin: [0,0,0,10] },
      ...actionPlanPdfMake,
      { text: '', margin: [0,0,0,20]}, // Spacer

      // Getting Started & Resources
      { text: 'Getting Started & Resources', style: 'h1', pageBreak: 'before', margin: [0,0,0,10] },
      ...resourcesPdfMake,
      { text: '', margin: [0,0,0,20]}, // Spacer

      // Illustrative Benchmarks
      { text: 'Illustrative Benchmarks', style: 'h1', pageBreak: 'before', margin: [0,0,0,10] },
      ...benchmarksPdfMake,
      { text: '', margin: [0,0,0,20]}, // Spacer
      
      // Personalized AI Learning Path
      { text: 'Your Personalized AI Learning Path', style: 'h1', pageBreak: 'before', margin: [0,0,0,10] },
      ...learningPathPdfMake,
      { text: '', margin: [0,0,0,20]}, // Spacer

      // Question & Answer History (Card per Q&A)
      { text: 'Question & Answer History', style: 'h1', pageBreak: 'before', margin: [0,0,0,10] },
      ...(SCORECARD_DEBUG_DATA.QuestionAnswerHistory || []).map(item => ({
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: `Phase: ${item.phaseName}`, style: 'qnaPhase' },
              { text: `Q: ${item.question}`, style: 'qnaQuestion' },
              { text: `A: ${item.answerType === 'checkbox' || item.answerType === 'radio' ? item.answer.split('|').map(s => s.trim()).join(', ') : item.answer}`, style: 'qnaAnswer' },
              item.options ? { text: `Options: ${Array.isArray(item.options) ? item.options.join(', ') : ''}`, style: 'qnaOptions' } : null,
            ].filter(Boolean),
            margin: [10,10,10,10]
          }]]
        },
        layout: {
          fillColor: colors.lightMintBg,
          hLineWidth: function(i, node) { return 0; },
          vLineWidth: function(i, node) { return 0; },
          defaultBorder: true,
        },
        margin: [0, 0, 0, 15] // Margin below each Q&A card
      })),
    ],

    // ----- STYLES -----
    defaultStyle: {
      font: pdfMake.fonts.PlusJakartaSans ? 'PlusJakartaSans' : 'Roboto', // Use Plus Jakarta Sans if available, otherwise Roboto
      fontSize: 10,
      lineHeight: 1.3,
      color: colors.textPrimary
    },
    styles: {
      mainTitle: {
        fontSize: 28,
        bold: true,
        color: colors.primaryDarkTeal,
        margin: [0, 0, 0, 10],
        lineHeight: 1.2
      },
      subTitle: {
        fontSize: 14,
        color: colors.gray,
        margin: [0,0,0,20]
      },
      h1: {
        fontSize: 20,
        bold: true,
        color: colors.primaryDarkTeal,
        margin: [0, 15, 0, 8]
      },
      h2: {
        fontSize: 16,
        bold: true,
        color: colors.primaryDarkTeal,
        margin: [0, 10, 0, 6]
      },
      h3: {
        fontSize: 14,
        bold: true,
        color: colors.textPrimary,
        margin: [0, 8, 0, 4]
      },
      paragraph: {
        margin: [0, 0, 0, 8],
        color: colors.textSecondary,
      },
      boldText: {
        bold: true,
        color: colors.textPrimary
      },
      listItem: {
        margin: [0, 0, 0, 3],
        color: colors.textSecondary,
      },
      headerText: {
        fontSize: 9,
        color: colors.gray,
      },
      headerPageNumber: {
        fontSize: 9,
        color: colors.gray,
      },
      footerText: {
        fontSize: 8,
        color: colors.gray,
        italics: true
      },
      // Q&A Styles
      qnaPhase: {
        fontSize: 9,
        bold: true,
        color: colors.primaryDarkTeal,
        italics: true,
        margin: [0,0,0,5]
      },
      qnaQuestion: {
        fontSize: 11,
        bold: true,
        color: colors.textPrimary,
        margin: [0,0,0,5]
      },
      qnaAnswer: {
        fontSize: 10,
        color: colors.textSecondary,
        margin: [0,0,0,5]
      },
      qnaOptions: {
        fontSize: 9,
        italics: true,
        color: colors.gray,
        margin: [0,0,0,5]
      },
      error: {
        color: 'red',
        fontSize: 16,
        bold: true,
        alignment: 'center'
      }
    },
  };

  return dd;
}

// Generate and save the PDF
try {
  console.log('Generating test PDF...');
  const docDefinition = generateScorecardDocumentDefinition(testData);
  
  const pdfDoc = pdfMake.createPdf(docDefinition);
  
  pdfDoc.getBuffer((buffer) => {
    fs.writeFileSync('test-output.pdf', buffer);
    console.log('Test PDF generated successfully at test-output.pdf');
    console.log('PDF generation test passed!');
  });
} catch (error) {
  console.error('Error generating PDF:', error);
  console.log('PDF generation test failed!');
} 