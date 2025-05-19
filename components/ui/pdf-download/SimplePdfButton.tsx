'use client';

import { useState } from 'react';
import { Button } from '../Button';
import { toast } from 'sonner';
import ReactDOMServer from 'react-dom/server';
import ScorecardPDFDocument from './ScorecardPDFDocument';
import { renderMarkdownContentAsHtml } from './markdownRenderer';
import React from 'react';

interface SimplePdfButtonProps {
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
  className?: string;
}

export default function SimplePdfButton({ reportData, className }: SimplePdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const generatePdf = async () => {
    if (!reportData?.reportId) {
      toast.error('No report data available for PDF generation');
      return;
    }

    setIsLoading(true);
    toast('Generating your PDF, please wait...');
    
    try {
      // Debug markdown rendering
      const markdownInput = reportData.reportMarkdown;
      if (markdownInput) {
        try {
          // Create the React element for renderMarkdownContentAsHtml
          const markdownComponentElement = React.createElement(
            () => renderMarkdownContentAsHtml(markdownInput)
          );
          const markdownHtmlOutput = ReactDOMServer.renderToString(markdownComponentElement);
          console.log("DEBUG_MARKDOWN_OUTPUT: Output of renderMarkdownContentAsHtml for actual report markdown:", markdownHtmlOutput.substring(0, 1000));

          // Test with a simple known markdown string
          const testMarkdownString = "## Test Heading\n\n**This should be bold.**\n\n- Item 1\n- Item 2";
          const testMarkdownComponentElement = React.createElement(
            () => renderMarkdownContentAsHtml(testMarkdownString)
          );
          const testMarkdownHtmlOutput = ReactDOMServer.renderToString(testMarkdownComponentElement);
          console.log("DEBUG_MARKDOWN_OUTPUT: Output of renderMarkdownContentAsHtml for TEST markdown:", testMarkdownHtmlOutput);
        } catch (e) {
          console.error("DEBUG_MARKDOWN_OUTPUT: Error rendering markdown to string on client:", e);
        }
      }

      // Generate HTML content using the ScorecardPDFDocument component
      const htmlContent = ReactDOMServer.renderToString(
        <ScorecardPDFDocument reportData={reportData} />
      );
      
      // Send to API for PDF generation
      const response = await fetch('/api/test-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent
        }),
      });
      
      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }
      
      // Get the PDF as a blob
      const pdfBlob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-scorecard-report-${reportData.reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      // Show success toast
      toast.success('Your PDF download has started!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={generatePdf} 
      disabled={isLoading || !reportData?.reportId}
      className={className}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Generating your PDF...</span>
        </span>
      ) : (
        'Download PDF Report'
      )}
    </Button>
  );
} 