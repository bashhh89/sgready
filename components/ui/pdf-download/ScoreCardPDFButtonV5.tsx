'use client';

import React, { useState } from 'react';

/**
 * ScoreCardPDFButtonV5 Component
 * 
 * This component renders a button that triggers the V5 PDF generation
 * using the PDFShift API implementation.
 */
const ScoreCardPDFButtonV5: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownloadClick = () => {
    setIsLoading(true);
    
    try {
      // Direct the browser to the PDF API endpoint
      // This will trigger the download automatically
      window.location.href = '/api/generate-scorecard-report-v5';
      
      // Set a timeout to reset the loading state after a few seconds
      // This is because window.location.href will navigate away and we won't know when it's done
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleDownloadClick}
      disabled={isLoading}
      className="btn-primary-divine flex items-center gap-2 py-2 px-4 bg-[#20E28F] text-[#103138] hover:bg-[#20E28F]/90 font-medium rounded-md transition-colors"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Generating PDF...</span>
        </span>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Download Report PDF (V5)</span>
        </>
      )}
    </button>
  );
};

export default ScoreCardPDFButtonV5; 