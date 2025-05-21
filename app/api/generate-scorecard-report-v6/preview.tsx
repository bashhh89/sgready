'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Sample data for testing the report
const sampleData = {
  report_title: "AI Efficiency Scorecard",
  report_subject_name: "Company XYZ",
  report_description: "A comprehensive assessment of AI effectiveness and strategic opportunities",
  report_author: "AI Strategy Team",
  header_image_url: "https://via.placeholder.com/300x150?text=AI+Scorecard",
  header_banner_text: "Confidential Assessment Report",
  section1_title: "Key Strengths in AI Adoption",
  section1_items: [
    {
      title: "Effective Data Integration",
      description: "Successfully integrated multiple data sources to create a unified view for AI analysis, resulting in more accurate insights and predictions."
    },
    {
      title: "Strong Executive Support",
      description: "Leadership team demonstrates clear understanding and commitment to AI initiatives, providing necessary resources and championing adoption across departments."
    },
    {
      title: "Skilled Technical Team",
      description: "In-house data science and engineering teams possess advanced skills in machine learning, data processing, and model deployment."
    }
  ],
  section1_banner_text: "Build on these strengths for continued success",
  section2_title: "Challenges and Weaknesses",
  section2_items: [
    {
      title: "Siloed Implementation",
      description: "AI initiatives remain isolated within departments with minimal cross-functional collaboration."
    },
    {
      title: "Scaling Difficulties",
      description: "Successful pilot projects struggle to scale to enterprise-wide deployment due to infrastructure limitations."
    },
    {
      title: "Governance Gaps",
      description: "Lack of comprehensive AI governance framework creates potential risks in compliance and ethical AI use."
    }
  ],
  section2_banner_text: "Address these challenges to improve AI efficiency",
  section3_title: "Strategic Action Plan Overview",
  section3_items: [
    {
      number: 1,
      title: "Establish Cross-Functional AI Center of Excellence",
      description: "Create a dedicated team with representatives from all business units to coordinate AI initiatives, share knowledge, and establish best practices."
    },
    {
      number: 2,
      title: "Modernize Data Infrastructure",
      description: "Invest in scalable cloud-based infrastructure to support enterprise-wide AI deployment and reduce technical debt."
    },
    {
      number: 3,
      title: "Implement AI Governance Framework",
      description: "Develop comprehensive policies for responsible AI use, including ethical guidelines, bias detection, and compliance monitoring."
    }
  ],
  section3_banner_text: "Implement these actions for optimal results",
  footer_text: "© 2023 AI Efficiency Assessment Team | Report ID: ABC123"
};

export default function PreviewPage() {
  const [reportHtml, setReportHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function generateReport() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/generate-scorecard-report-v6', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sampleData),
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
  }, []);

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

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Scorecard Report Preview (v6)</h1>
        <div className="flex gap-2">
          {!isLoading && !error && (
            <button 
              onClick={handleDownloadPdf} 
              disabled={isPdfLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isPdfLoading ? 'Generating PDF...' : 'Download as PDF'}
            </button>
          )}
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="border rounded-lg shadow-lg p-4 bg-white">
          <iframe 
            srcDoc={reportHtml}
            className="w-full h-screen border-0"
            title="Scorecard Report Preview"
          />
        </div>
      )}
    </div>
  );
} 