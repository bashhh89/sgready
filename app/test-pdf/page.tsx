'use client';

import { useState } from 'react';
import SimpleTest from './simple-test';

export default function TestPdfPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Open the PDF in a new tab
      window.open('http://localhost:3001/api/pdfmake-test', '_blank');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PDFMake Test Page</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          This page tests the PDFMake integration with custom fonts (Plus Jakarta Sans).
        </p>
        
        <button 
          onClick={handleGeneratePdf}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Test PDF'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-2">Implementation Details:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Using PDFMake library for PDF generation</li>
          <li>Custom fonts: Plus Jakarta Sans (Regular and Bold)</li>
          <li>API route at <code className="bg-gray-100 px-1">/api/pdfmake-test</code></li>
          <li>Font files stored in <code className="bg-gray-100 px-1">public/fonts/</code></li>
        </ul>
      </div>

      <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Simple Test:</h2>
        <SimpleTest />
      </div>
    </div>
  );
} 