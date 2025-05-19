'use client';

import React, { useEffect, useState } from 'react';
import { pdfStyles } from './pdfStyles';
import { renderMarkdownContentAsHtml } from './markdownRenderer';
import { TDocumentDefinitions, Content, StyleDictionary } from 'pdfmake/interfaces';

// Declare variables to hold pdfMake and pdfFonts
let pdfMake: any = null;
let pdfFonts: any = null;

// Initialize pdfMake for browser environment only
const initializePdfMake = async () => {
  if (typeof window === 'undefined') return;
  
  console.log('Initializing PDF libraries...');
  
  try {
    // Use dynamic imports to prevent SSR issues
    pdfMake = (await import('pdfmake/build/pdfmake')).default;
    pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
    
    console.log('PDF libraries imported, pdfMake:', !!pdfMake, 'pdfFonts:', !!pdfFonts);
    
    // Ensure pdfMake.vfs is properly initialized
    if (pdfFonts && pdfFonts.pdfMake) {
      console.log('Standard structure found, assigning pdfFonts.pdfMake.vfs');
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    } else {
      console.warn('pdfFonts structure is not as expected, attempting alternative initialization');
      // Alternative assignment if structure is different
      if (pdfFonts && pdfFonts.vfs) {
        console.log('Found alternative structure, assigning pdfFonts.vfs');
        pdfMake.vfs = pdfFonts.vfs;
      } else {
        console.error('Failed to initialize PDF fonts. VFS not available.');
        console.log('pdfFonts structure:', JSON.stringify(pdfFonts).substring(0, 100) + '...');
        // Initialize with empty VFS to prevent errors
        pdfMake.vfs = {};
      }
    }
    
    console.log('VFS initialization complete, pdfMake.vfs exists:', !!pdfMake.vfs);
  } catch (error) {
    console.error('Error initializing pdfMake:', error);
    // Initialize with empty objects to prevent undefined errors
    pdfMake = pdfMake || { vfs: {} };
  }
};

// Renamed from ScorecardPDFDocument to ScorecardPDFGenerator
export class ScorecardPDFGenerator {
  private reportData: any;
  
  constructor(reportData: any) {
    this.reportData = reportData;
  }
  
  // Generate the complete PDF document definition
  private generateDocDefinition(): TDocumentDefinitions {
    return {
      content: [
        this.createHeader(),
        this.createSummary(),
        this.createScoreBreakdown(),
        this.createRecommendations(),
        this.createFooter(),
      ] as Content[],
      styles: pdfStyles as unknown as StyleDictionary,
      defaultStyle: pdfStyles.defaultStyle,
      pageMargins: [40, 60, 40, 60],
    };
  }
  
  // Create header section
  private createHeader(): Content[] {
    return [
      {
        text: 'AI Efficiency Scorecard',
        style: 'header',
        margin: [0, 0, 0, 20],
      },
      {
        text: `Generated on: ${new Date().toLocaleDateString()}`,
        style: 'italic',
        margin: [0, 0, 0, 30],
      },
    ];
  }
  
  // Create summary section
  private createSummary(): Content[] {
    const { companyName, industryType, overallScore } = this.reportData || {
      companyName: 'Your Company',
      industryType: 'Technology',
      overallScore: 65,
    };
    
    return [
      {
        text: 'Executive Summary',
        style: 'subheader',
      },
      {
        text: `Company: ${companyName}`,
        margin: [0, 5, 0, 2],
      },
      {
        text: `Industry: ${industryType}`,
        margin: [0, 0, 0, 2],
      },
      {
        text: `Overall Score: ${overallScore}/100`,
        style: 'bold',
        margin: [0, 10, 0, 20],
      },
      {
        text: 'This report provides an assessment of your organization\'s AI maturity level based on our comprehensive evaluation framework. The score reflects your current capabilities, adoption levels, and strategic approach to artificial intelligence technologies.',
        margin: [0, 0, 0, 20],
      },
    ];
  }
  
  // Create score breakdown section
  private createScoreBreakdown(): Content[] {
    const { categories } = this.reportData || {
      categories: [
        { name: 'Strategy', score: 70 },
        { name: 'Technology', score: 65 },
        { name: 'Operations', score: 60 },
        { name: 'People', score: 55 },
      ],
    };
    
    const tableBody = [
      [
        { text: 'Category', style: 'tableHeader' },
        { text: 'Score', style: 'tableHeader' },
      ],
      ...categories.map((category: { name: string; score: number }) => [
        { text: category.name },
        { text: `${category.score}/100` },
      ]),
    ];
    
    return [
      {
        text: 'Score Breakdown',
        style: 'subheader',
        margin: [0, 20, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: tableBody,
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 0 || i === 1) ? '#aaaaaa' : '#dddddd',
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
      },
    ];
  }
  
  // Create recommendations section
  private createRecommendations(): Content[] {
    const { recommendations } = this.reportData || {
      recommendations: [
        'Develop a comprehensive AI strategy aligned with business objectives',
        'Invest in employee upskilling for AI literacy',
        'Implement data governance practices to ensure quality data for AI initiatives',
        'Establish clear metrics for measuring AI project success',
      ],
    };
    
    return [
      {
        text: 'Recommendations',
        style: 'subheader',
        margin: [0, 20, 0, 10],
      },
      {
        ul: recommendations.map((rec: string) => ({
          text: rec,
          margin: [0, 5, 0, 5],
        })),
        margin: [0, 0, 0, 20],
      },
    ];
  }
  
  // Create footer section
  private createFooter(): Content {
    return {
      text: 'This report is confidential and intended solely for the use of the organization for which it was generated.',
      style: 'brandFooter',
      margin: [0, 20, 0, 0],
    };
  }
  
  // Generate and return PDF as blob
  public async generatePDF(): Promise<Blob> {
    // Make sure pdfMake is initialized if not already
    if (!pdfMake) {
      await initializePdfMake();
    }
    
    // Safety check - if we still don't have pdfMake, throw a user-friendly error
    if (!pdfMake) {
      throw new Error("PDF generation is not available. Please try again or contact support if the issue persists.");
    }
    
    const docDefinition = this.generateDocDefinition();
    return new Promise((resolve) => {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob);
      });
    });
  }
}

// React component keeps the name ScorecardPDFDocument
export default function ScorecardPDFDocument({ reportData }: { reportData: any }) {
  // State to track if we're in browser environment and if PDF libraries are loaded
  const [isPdfLibraryReady, setIsPdfLibraryReady] = useState(false);
  
  // Initialize PDF libraries after component mounts
  useEffect(() => {
    const loadPdfLibraries = async () => {
      if (typeof window !== 'undefined' && !pdfMake) {
        await initializePdfMake();
        setIsPdfLibraryReady(true);
      } else if (pdfMake) {
        setIsPdfLibraryReady(true);
      }
    };
    
    loadPdfLibraries();
  }, []);
  
  // If not in browser or libraries aren't loaded, render loading state
  if (!isPdfLibraryReady) {
    return <div className="loading-pdf-component">Loading PDF component...</div>;
  }

  const {
    reportId,
    reportMarkdown,
    questionAnswerHistory,
    leadName,
    userName,
    leadCompany,
    companyName,
    industry,
    userAITier,
    tier,
    finalScore,
  } = reportData;

  const displayName = leadName || userName || 'Valued User';
  const displayCompany = leadCompany || companyName || 'N/A';
  const displayIndustry = industry || 'N/A';
  const displayTier = userAITier || tier || 'N/A';
  const displayScore = finalScore !== undefined && finalScore !== null ? finalScore.toFixed(1) : 'N/A';

  // Split the markdown content by h2 headers to create separate cards
  const splitContentByHeaders = (markdown: string) => {
    if (!markdown) return [''];
    
    // Split by h2 headers (## Header)
    const sections = markdown.split(/(?=^## )/m);
    
    // If there are no h2 headers or just one section, return as is
    if (sections.length <= 1) return [markdown];
    
    return sections;
  };

  const contentSections = splitContentByHeaders(reportMarkdown);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>AI Efficiency Scorecard</title>
        
        {/* Font loading status tracking */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-loading-status: false;
          }
          
          /* Set font loading status to true once loaded */
          body {
            --font-loading-status: true;
          }
        `}} />
        
        {/* Main styles with embedded fonts */}
        <style>{JSON.stringify(pdfStyles)}</style>
      </head>
      <body>
        <div className="header report-card">
          <h1>AI Efficiency Scorecard</h1>
          <p>Report for: {displayName}</p>
          <p>Company: {displayCompany}</p>
          <p>Industry: {displayIndustry}</p>
          <p>AI Maturity Tier: {displayTier}</p>
          {displayScore !== 'N/A' && <p>Final Score: {displayScore}</p>}
          <p className="report-id">Report ID: {reportId}</p>
          <p className="report-date">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Overall Tier Section - First section gets special treatment */}
        {contentSections.length > 0 && (
          <div className="section">
            <div className="report-card">
              <div className="content">
                {renderMarkdownContentAsHtml(contentSections[0])}
              </div>
            </div>
          </div>
        )}

        {/* Render remaining content sections as separate cards */}
        {contentSections.slice(1).map((section, index) => (
          <div key={`section-${index + 1}`} className="section">
            <div className="report-card">
              <div className="content">
                {renderMarkdownContentAsHtml(section)}
              </div>
            </div>
          </div>
        ))}

        {/* Q&A History Section */}
        {questionAnswerHistory && questionAnswerHistory.length > 0 && (
          <div className="section">
            <div className="report-card">
              <div className="qa-section">
                <h2>Q&A History</h2>
                {questionAnswerHistory.map((qa: any, index: number) => (
                  <div key={index} className="qa-item">
                    <p><strong>Q:</strong> {qa.question}</p>
                    <p><strong>A:</strong> {qa.answer}</p>
                    {qa.reasoning && (
                      <p className="qa-reasoning">
                        <strong>Reasoning:</strong> {qa.reasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="footer">
          <p>AI Efficiency Scorecard © {new Date().getFullYear()}</p>
          <p>This report is confidential and intended for the recipient only.</p>
        </div>
      </body>
    </html>
  );
} 