"use client";

import React, { useState } from 'react';

interface ScorecardPDFDownloadButtonProps {
  reportId: string;
  className?: string;
  buttonText?: string;
  loadingText?: string;
  isLoading?: boolean;
}

const ScorecardPDFDownloadButton: React.FC<ScorecardPDFDownloadButtonProps> = ({
  reportId,
  className = 'bg-brand-deep-teal hover:bg-brand-deep-teal/90 text-white px-4 py-2 rounded-md',
  buttonText = 'Download PDF Report',
  loadingText = 'Preparing PDF...',
  isLoading = false,
}) => {
  const handleDownloadClick = () => {
    if (!reportId) {
      console.error('Report ID is missing. Cannot generate PDF.');
      return;
    }
    
    window.open(`/api/test-pdf?reportId=${reportId}`, '_blank');
  };

  return (
    <button 
      onClick={handleDownloadClick}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? loadingText : buttonText}
    </button>
  );
};

export default ScorecardPDFDownloadButton; 