'use client';

import React from 'react';
import { pdfStyles } from './pdfStyles';
import { renderMarkdownContentAsHtml } from './markdownRenderer';

interface ScorecardPDFDocumentProps {
  reportData: {
    reportId: string;
    reportMarkdown: string;
    questionAnswerHistory: Array<{
      question: string;
      answer: string;
      reasoning?: string;
    }>;
    userName?: string;
    leadName?: string;
    leadCompany?: string;
    companyName?: string;
    industry?: string;
    userAITier?: string;
    tier?: string;
    finalScore?: number;
  };
}

export default function ScorecardPDFDocument({ reportData }: ScorecardPDFDocumentProps) {
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
        <style>{pdfStyles}</style>
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
                {questionAnswerHistory.map((qa, index) => (
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