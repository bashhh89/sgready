// Define colors for consistency
const COLORS = {
  primaryDark: '#103138',
  accentGreen: '#20E28F',
  white: '#FFFFFF',
  lightBg: '#F7F9FC',
  textDark: '#103138',
  textLight: '#6D7278',
  borderColor: '#DDE2E5',
  cardShadow: 'rgba(0,0,0,0.12)',
};

// Import Base64 font data directly
// In a real production environment, you might want to use a more sophisticated approach
// but for now, we'll use a simple require approach since we confirmed the files exist
let regularFontBase64 = '';
let boldFontBase64 = '';

try {
  // Try to load the font files
  regularFontBase64 = require('fs').readFileSync('./regular-font-base64.txt', 'utf8');
  boldFontBase64 = require('fs').readFileSync('./bold-font-base64.txt', 'utf8');
} catch (e) {
  console.error('Error loading font files:', e);
  // Fallback to empty strings if files can't be loaded
}

export const pdfStyles = `
  /* Base64 Font Embedding - COMPLETE FONT DATA */
  @font-face {
    font-family: 'Plus Jakarta Sans';
    font-style: normal;
    font-weight: 400; /* Regular */
    src: url(data:font/truetype;base64,${regularFontBase64}) format('truetype');
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Plus Jakarta Sans';
    font-style: normal;
    font-weight: 700; /* Bold */
    src: url(data:font/truetype;base64,${boldFontBase64}) format('truetype');
    font-display: swap;
  }

  /* Base styles */
  body {
    font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    line-height: 1.6;
    color: ${COLORS.textDark};
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    background-color: #f4f7f9; /* Light grey/blue background for the page */
  }
  
  .header {
    background-color: ${COLORS.primaryDark};
    color: ${COLORS.white};
    padding: 30px 35px;
    text-align: center;
    margin-bottom: 40px;
    border-radius: 10px;
    box-shadow: 0 6px 12px ${COLORS.cardShadow};
  }
  
  .header h1 {
    font-size: 24pt;
    margin-bottom: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .header p {
    margin: 8px 0;
    font-size: 14px;
  }
  
  .report-id {
    font-size: 12px;
    margin-top: 15px;
    opacity: 0.8;
  }
  
  .report-date {
    font-size: 12px;
    opacity: 0.8;
  }
  
  .content {
    white-space: pre-wrap;
    margin-bottom: 35px;
  }

  /* Card Layout Styling - Enhanced for visual appeal */
  .report-card {
    background-color: ${COLORS.white};
    padding: 35px 40px;
    margin-bottom: 35px;
    border-radius: 10px;
    border: 1px solid ${COLORS.borderColor};
    box-shadow: 0 8px 16px ${COLORS.cardShadow};
    break-inside: avoid; /* Prevent cards from breaking across pages */
    position: relative;
  }

  /* Section styling with cards and separators */
  .section {
    margin-bottom: 40px;
    break-inside: avoid; /* Prevent sections from breaking across pages */
    position: relative;
  }

  .section:not(:last-of-type):after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(to right, transparent, ${COLORS.borderColor}, transparent);
  }

  .section:last-of-type {
    margin-bottom: 0;
  }
  
  .qa-section {
    margin-top: 15px;
  }
  
  .qa-section h2 {
    color: ${COLORS.primaryDark};
    border-bottom: 3px solid ${COLORS.accentGreen};
    padding-bottom: 12px;
    margin-bottom: 30px;
    margin-top: 0;
    font-weight: 700;
    font-size: 18pt;
    break-after: avoid; /* Prevent page break after heading */
  }
  
  .qa-item {
    margin-bottom: 30px;
    padding: 25px;
    background-color: ${COLORS.white};
    border-radius: 8px;
    border: 1px solid ${COLORS.borderColor};
    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
    break-inside: avoid; /* Prevent Q&A items from breaking across pages */
  }
  
  .qa-reasoning {
    margin-top: 18px;
    padding: 18px;
    background-color: ${COLORS.lightBg};
    border-left: 4px solid ${COLORS.accentGreen};
    border-radius: 0 6px 6px 0;
  }
  
  .footer {
    margin-top: 45px;
    padding: 25px;
    border-top: 1px solid ${COLORS.borderColor};
    text-align: center;
    color: ${COLORS.textLight};
    font-size: 9pt;
  }

  /* Markdown Styles */
  .markdown-content {
    font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    line-height: 1.75;
    color: ${COLORS.textDark};
  }

  .markdown-content .paragraph {
    margin-bottom: 20px;
    font-size: 11pt;
    widows: 2; /* Minimum lines to keep at end of paragraph before break */
    orphans: 2; /* Minimum lines to carry to new page at start of paragraph */
  }

  .markdown-content .heading-1 {
    font-size: 26px;
    font-weight: 700;
    margin: 1.8em 0 1.2em;
    color: ${COLORS.primaryDark};
    break-after: avoid; /* Prevent page break after heading */
    letter-spacing: -0.02em;
  }

  .markdown-content .heading-2 {
    font-size: 18pt;
    font-weight: 700;
    margin: 0 0 25px;
    color: ${COLORS.primaryDark};
    border-bottom: 3px solid ${COLORS.accentGreen};
    padding-bottom: 12px;
    break-after: avoid; /* Prevent page break after heading */
    letter-spacing: -0.01em;
  }

  .markdown-content .heading-3 {
    font-size: 14pt;
    font-weight: 600;
    margin: 30px 0 18px;
    color: ${COLORS.primaryDark};
    break-after: avoid; /* Prevent page break after heading */
  }

  .markdown-content .heading-4,
  .markdown-content .heading-5,
  .markdown-content .heading-6 {
    font-size: 13pt;
    font-weight: 700;
    margin: 1.2em 0 1em;
    color: ${COLORS.primaryDark};
    break-after: avoid; /* Prevent page break after heading */
  }

  .markdown-content .list-container {
    margin: 1.5em 0;
    padding-left: 2.5em;
    break-inside: avoid; /* Prevent lists from breaking across pages */
  }

  .markdown-content .list-item {
    margin-bottom: 12px;
    font-size: 11pt;
    widows: 2; /* Minimum lines to keep at end of list item before break */
    orphans: 2; /* Minimum lines to carry to new page at start of list item */
  }

  .markdown-content .bold-text {
    font-weight: 700;
    color: inherit;
  }

  .markdown-content .link {
    color: ${COLORS.accentGreen};
    text-decoration: none;
  }

  .markdown-content code {
    background-color: #f5f5f5;
    padding: 0.3em 0.5em;
    border-radius: 4px;
    font-family: monospace;
  }

  .markdown-content pre {
    background-color: #f5f5f5;
    padding: 1.2em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1.2em 0;
    break-inside: avoid; /* Prevent code blocks from breaking across pages */
  }

  .markdown-content blockquote {
    border-left: 4px solid ${COLORS.accentGreen};
    margin: 1.5em 0;
    padding: 1em 1.5em;
    color: #555;
    background-color: ${COLORS.lightBg};
    border-radius: 0 6px 6px 0;
    break-inside: avoid; /* Prevent blockquotes from breaking across pages */
  }

  .markdown-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5em 0;
    break-inside: avoid; /* Prevent tables from breaking across pages */
  }

  .markdown-content th,
  .markdown-content td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }

  .markdown-content th {
    background-color: #f5f5f5;
    font-weight: 700;
  }
  
  /* Prevent double top margins for headings inside cards */
  .report-card .section-title, 
  .report-card .markdown-content h2, 
  .report-card .markdown-content h3 {
    margin-top: 0; 
  }

  /* Enhanced Page Break Control */
  .report-card, 
  .section,
  .qa-item,
  .markdown-content figure,
  .markdown-content pre,
  .markdown-content ul,
  .markdown-content ol {
    break-inside: avoid; 
  }

  .section-title, 
  .markdown-content h1, 
  .markdown-content h2, 
  .markdown-content h3, 
  .markdown-content h4 {
    break-after: avoid;
  }

  .report-card,
  .section-title,
  .markdown-content h1, 
  .markdown-content h2, 
  .markdown-content h3 {
    break-before: auto;
  }

  p, 
  .paragraph, 
  .markdown-content p,
  .markdown-content li {
    widows: 2;
    orphans: 2;
    font-size: 11pt;
    line-height: 1.75;
  }
`; 