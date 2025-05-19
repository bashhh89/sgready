// File: app/api/scorecard-v2/route.ts
// Adding font configuration - avoiding template literals

import { NextResponse, NextRequest } from 'next/server';
import PdfPrinter from 'pdfmake';
import path from 'path';
import fs from 'fs';
import { generateScorecardDocumentDefinition } from '../../../lib/pdf-generation/scorecard-pdf-v2.js';

// Sample data without template literals
const SCORECARD_DEBUG_DATA = {
  UserInformation: { 
    Industry: "Property/Real Estate", 
    UserName: "Ahmad Basheer", 
    CompanyName: "QanDu.io", 
    Email: "ahmadbasheerr@gmail.com" 
  },
  ScoreInformation: { 
    AITier: "Enabler", 
    FinalScore: null, 
    ReportID: "4zrPq2Jmh53iSEjGPImk" 
  },
  QuestionAnswerHistory: [
    { 
      "reasoningText": "Sample reasoning",
      "phaseName": "Strategy & Goals",
      "answerType": "scale", 
      "options": ["1", "2", "3", "4", "5"], 
      "question": "How effectively are AI tools used?", 
      "answer": "4", 
      "answerSource": "Fallback" 
    }
  ],
  // Using string concatenation for now instead of template literals
  FullReportMarkdown: "# AI Efficiency Scorecard\n\n" +
    "## Overall Tier: Enabler\n\n" +
    "## Key Findings\n\n" +
    "**Strengths:**\n" +
    "1. **Proactive AI Integration**: Your agency is working on integrating AI.\n" +
    "2. **Diverse AI Application**: AI tools are utilized in marketing.\n\n" +
    "**Weaknesses:**\n" +
    "1. **Integration Challenges**: System compatibility issues exist.\n" +
    "2. **Limited AI Maturity**: Opportunities for enhancement.\n\n" +
    "## Strategic Action Plan\n\n" +
    "1. **Enhance Back-Office Integration:**\n" +
    "   - Conduct cost-benefit analysis\n" +
    "   - Develop phased plan\n\n" +
    "This report concludes here."
};

// Font Configuration
const projectRoot = process.cwd();

const pjsRegularPath = path.resolve(projectRoot, 'PlusJakartaSans-Regular.ttf');
const pjsBoldPath = path.resolve(projectRoot, 'PlusJakartaSans-Bold.ttf');
const robotoFolderPath = path.resolve(projectRoot, 'fonts');
const robotoRegularPath = path.resolve(robotoFolderPath, 'Roboto-Regular.ttf');
const robotoMediumPath = path.resolve(robotoFolderPath, 'Roboto-Medium.ttf');
const robotoItalicPath = path.resolve(robotoFolderPath, 'Roboto-Italic.ttf');
const robotoMediumItalicPath = path.resolve(robotoFolderPath, 'Roboto-MediumItalic.ttf');

const serverSideFonts = {
  PlusJakartaSans: {
    normal: pjsRegularPath,
    bold: pjsBoldPath,
    italics: robotoItalicPath,
    bolditalics: robotoMediumItalicPath
  },
  Roboto: {
    normal: robotoRegularPath,
    bold: robotoMediumPath,
    italics: robotoItalicPath,
    bolditalics: robotoMediumItalicPath
  }
};

// Initialize printer with fonts
let printer: PdfPrinter | null = null;
try {
  // Check font files
  const missingFonts: string[] = [];
  if (!fs.existsSync(pjsRegularPath)) missingFonts.push('PlusJakartaSans-Regular.ttf');
  if (!fs.existsSync(pjsBoldPath)) missingFonts.push('PlusJakartaSans-Bold.ttf');
  if (!fs.existsSync(robotoRegularPath)) missingFonts.push('fonts/Roboto-Regular.ttf');
  
  if (missingFonts.length > 0) {
    console.error('Missing font files: ' + missingFonts.join(', '));
  } else {
    printer = new PdfPrinter(serverSideFonts);
    console.log('PdfPrinter initialized successfully with custom fonts');
  }
} catch (e: any) {
  console.error("Failed to initialize PdfPrinter: " + e.message);
}

export async function GET(request: NextRequest) {
  console.log('Scorecard V2 API with font configuration called');
  
  const reportId = request.nextUrl.searchParams.get('reportId');
  console.log('Report ID:', reportId);
  
  // Check if printer was initialized
  const printerStatus = printer ? "initialized" : "failed to initialize";
  
  return NextResponse.json({ 
    status: "success", 
    message: "Scorecard V2 API with font configuration is working", 
    reportId: reportId || "no report ID provided",
    printerStatus: printerStatus,
    sampleData: {
      userName: SCORECARD_DEBUG_DATA.UserInformation.UserName,
      tier: SCORECARD_DEBUG_DATA.ScoreInformation.AITier,
      reportSnippet: SCORECARD_DEBUG_DATA.FullReportMarkdown.substring(0, 50) + "..."
    }
  });
} 