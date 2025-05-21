'use client';

import { useState, useEffect } from 'react';
import sampleScoreCardData from './preview-data';

// Define types for the scorecard data
interface AnswerHistoryEntry {
  question: string;
  answer: string;
  phaseName?: string;
  reasoningText?: string;
  answerType?: string;
  options?: string[] | null;
  index?: number;
  answerSource?: string;
}

interface ScoreCardData {
  UserInformation: {
    Industry: string;
    UserName: string;
    CompanyName: string;
    Email: string;
  };
  ScoreInformation: {
    AITier: string;
    FinalScore: number | null;
    ReportID: string;
  };
  QuestionAnswerHistory: AnswerHistoryEntry[];
  FullReportMarkdown: string;
}

export default function ScorecardPreviewPage() {
  const [reportHtml, setReportHtml] = useState<string>('');
  const [scoreCardData, setScoreCardData] = useState<ScoreCardData>(sampleScoreCardData);
  const [useRealData, setUseRealData] = useState<boolean>(false);
  const [reportId, setReportId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRealData, setIsLoadingRealData] = useState<boolean>(false);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [isGammaPdfLoading, setIsGammaPdfLoading] = useState<boolean>(false);
  const [isWeasyPrintLoading, setIsWeasyPrintLoading] = useState<boolean>(false);
  const [isPresentationPdfLoading, setIsPresentationPdfLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateReport() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/generate-scorecard-report-v6', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scoreCardData),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const html = await response.text();
        setReportHtml(html);
        setError(null);
      } catch (err) {
        console.error('Failed to generate report:', err);
        setError('Failed to generate report. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    generateReport();
  }, [scoreCardData]);

  const handleLoadRealData = async () => {
    if (!reportId.trim()) {
      setError('Please enter a Report ID');
      return;
    }
    
    try {
      setIsLoadingRealData(true);
      setError(null);
      
      // First, fetch the report data from the API
      const reportResponse = await fetch(`/api/scorecard-ai/get-report?reportId=${reportId}`);
      
      if (!reportResponse.ok) {
        throw new Error(`Failed to fetch report: ${reportResponse.status}`);
      }
      
      const reportData = await reportResponse.json();
      console.log('Fetched report data:', reportData);
      
      // Construct the ScoreCardData object from the report data
      const newScoreCardData: ScoreCardData = {
        UserInformation: {
          Industry: reportData.industry || 'Not Provided',
          UserName: reportData.userName || 'Not Provided',
          CompanyName: reportData.companyName || 'Not Provided',
          Email: reportData.email || 'Not Provided'
        },
        ScoreInformation: {
          AITier: reportData.userAITier || 'Not Available',
          FinalScore: reportData.finalScore !== undefined ? reportData.finalScore : null,
          ReportID: reportData.reportId || 'Not Available'
        },
        QuestionAnswerHistory: reportData.questionAnswerHistory || [],
        FullReportMarkdown: reportData.reportMarkdown || '# No report content available'
      };
      
      // Update state with the new data
      setScoreCardData(newScoreCardData);
      setUseRealData(true);
      
    } catch (err) {
      console.error('Failed to load real data:', err);
      setError(`Failed to load report data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingRealData(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsPdfLoading(true);
      
      const response = await fetch('/api/generate-scorecard-report-v6/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: reportHtml }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'ai-scorecard-report.pdf';
      
      // Append to document, click and remove
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setError(null);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleGammaPrintPdf = async () => {
    try {
      setIsGammaPdfLoading(true);
      setError(null);
      
      // Use fetch to call the WeasyPrint API endpoint
      const response = await fetch('/api/generate-gamma-weasyprint-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreCardData),
      });

      if (!response.ok) {
        // Try to get error details if available
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        } catch (e) {
          throw new Error(`Error: ${response.status}`);
        }
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'gamma-scorecard-report.pdf';
      
      // Append to document, click and remove
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Failed to generate Gamma WeasyPrint PDF:', err);
      setError(`Failed to generate PDF with Gamma WeasyPrint: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGammaPdfLoading(false);
    }
  };

  const handleWeasyPrintPdf = async () => {
    try {
      setIsWeasyPrintLoading(true);
      setError(null);
      
      // Use fetch to call the new WeasyPrint API endpoint
      const response = await fetch('/api/generate-weasyprint-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreCardData),
      });

      if (!response.ok) {
        // Try to get error details if available
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        } catch (e) {
          throw new Error(`Error: ${response.status}`);
        }
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'weasyprint-scorecard-report.pdf';
      
      // Append to document, click and remove
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Failed to generate WeasyPrint PDF:', err);
      setError(`Failed to generate PDF with WeasyPrint: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsWeasyPrintLoading(false);
    }
  };

  const handlePresentationPdf = async () => {
    try {
      setIsPresentationPdfLoading(true);
      setError(null);
      
      // Use fetch to call the presentation-style WeasyPrint API endpoint
      const response = await fetch('/api/generate-presentation-weasyprint-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreCardData),
      });

      if (!response.ok) {
        // Try to get error details if available
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        } catch (e) {
          throw new Error(`Error: ${response.status}`);
        }
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'presentation-scorecard-report.pdf';
      
      // Append to document, click and remove
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Failed to generate Presentation-style PDF:', err);
      setError(`Failed to generate Presentation-style PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsPresentationPdfLoading(false);
    }
  };

  const resetToSampleData = () => {
    setScoreCardData(sampleScoreCardData);
    setUseRealData(false);
    setReportId('');
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Efficiency Scorecard Preview (v6)</h1>
        
        <div className="flex flex-col mb-4">
          <div className="flex items-center mb-2">
            <input
              type="text"
              placeholder="Enter Report ID"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              className="px-3 py-2 border rounded mr-2"
            />
            <button
              onClick={handleLoadRealData}
              disabled={isLoadingRealData}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
            >
              {isLoadingRealData ? 'Loading...' : 'Load Real Report'}
            </button>
          </div>
          {useRealData && (
            <div className="flex justify-end">
              <button
                onClick={resetToSampleData}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Reset to Sample Data
              </button>
            </div>
          )}
        </div>
      </div>
      
      {useRealData && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <p className="font-semibold">Using real data from report ID: {reportId}</p>
          <p>User: {scoreCardData.UserInformation.UserName}</p>
          <p>Company: {scoreCardData.UserInformation.CompanyName}</p>
          <p>Industry: {scoreCardData.UserInformation.Industry}</p>
          <p>Tier: {scoreCardData.ScoreInformation.AITier}</p>
          <p>Final Score: {scoreCardData.ScoreInformation.FinalScore !== null ? scoreCardData.ScoreInformation.FinalScore : 'Not Available'}</p>
        </div>
      )}
      
      <div className="flex gap-2 mb-4">
        {!isLoading && !error && (
          <>
            <button 
              onClick={handleDownloadPdf} 
              disabled={isPdfLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isPdfLoading ? 'Generating PDF...' : 'Download PDF (PDFShift)'}
            </button>
            <button 
              onClick={handleGammaPrintPdf} 
              disabled={isGammaPdfLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {isGammaPdfLoading ? 'Generating...' : 'Download Gamma PDF'}
            </button>
            <button 
              onClick={handleWeasyPrintPdf} 
              disabled={isWeasyPrintLoading}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:bg-teal-300"
            >
              {isWeasyPrintLoading ? 'Generating...' : 'Download WeasyPrint PDF'}
            </button>
            <button 
              onClick={handlePresentationPdf} 
              disabled={isPresentationPdfLoading}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300"
            >
              {isPresentationPdfLoading ? 'Generating...' : 'Download Presentation PDF'}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4">Generating report...</p>
        </div>
      ) : !error ? (
        <div className="border rounded overflow-hidden bg-white">
          <iframe 
            srcDoc={reportHtml} 
            className="w-full min-h-[800px]"
            title="Scorecard Report"
          ></iframe>
        </div>
      ) : null}
    </div>
  );
} 