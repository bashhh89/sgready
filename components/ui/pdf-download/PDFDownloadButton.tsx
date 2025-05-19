'use client';

import React, { useState } from 'react';
import ScorecardPDFDocument from './ScorecardPDFDocument';

interface PDFDownloadButtonProps {
  data: any; // Replace with your actual data type
  filename?: string;
}

export default function PDFDownloadButton({ data, filename = 'scorecard.pdf' }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateComplete = (pdfBlob: Blob) => {
    // Create a URL for the blob
    const url = window.URL.createObjectURL(pdfBlob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
    
    setIsGenerating(false);
  };

  const handleError = (error: Error) => {
    setError(error.message);
    setIsGenerating(false);
  };

  const handleClick = () => {
    setIsGenerating(true);
    setError(null);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isGenerating}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isGenerating ? 'Generating PDF...' : 'Download PDF'}
      </button>
      
      {error && (
        <p className="mt-2 text-red-600">Error: {error}</p>
      )}
      
      {isGenerating && (
        <ScorecardPDFDocument
          data={data}
          onGenerateComplete={handleGenerateComplete}
          onError={handleError}
        />
      )}
    </div>
  );
} 