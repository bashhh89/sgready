'use client';

import React, { useState } from 'react';

// Simple page to test PDF generation via client-side button
export default function TestPdfPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDownloadPdf = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Using the '/api/pdf-test' endpoint but now from client-side fetch
      const response = await fetch('/api/pdf-test');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link to download the PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('PDF generated successfully! Check your downloads folder.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            PDF Generation Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            This page attempts to generate a PDF using the API route.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleDownloadPdf}
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Generating PDF...' : 'Download Test PDF'}
            </button>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 