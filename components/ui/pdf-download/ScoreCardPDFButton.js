import React, { useState } from 'react';
import { generateAndDownloadPDF } from '../../../lib/pdf-generation/scorecard-pdf-v2';
import { useFirestore } from '../../../hooks/useFirestore';

// Component for the "Generate PDF V2" button for the double beautiful report
const ScoreCardPDFButton = ({ reportId, userId, variant = 'primary', size = 'md', className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getDoc, doc } = useFirestore();

  const handleGeneratePDF = async () => {
    if (!reportId) {
      setError('Report ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch the scorecard data from Firestore
      const scorecard = await getDoc(doc('scorecards', reportId));
      
      if (!scorecard.exists()) {
        throw new Error('Scorecard not found');
      }

      // Get the scorecard data
      const scorecardData = scorecard.data();
      
      // Build the SCORECARD_DEBUG_DATA object expected by the PDF generator
      const pdfData = {
        UserInformation: {
          UserName: scorecardData.userName || scorecardData.user_name || 'User',
          CompanyName: scorecardData.companyName || scorecardData.company_name || 'Company',
          Email: scorecardData.email || '',
          Industry: scorecardData.industry || ''
        },
        ScoreInformation: {
          AITier: scorecardData.aiTier || scorecardData.ai_tier || 'Not Specified',
          FinalScore: scorecardData.finalScore || scorecardData.final_score || 0,
          ReportID: reportId
        },
        FullReportMarkdown: scorecardData.fullReportMarkdown || scorecardData.full_report_markdown || '',
        QuestionAnswerHistory: scorecardData.questionAnswerHistory || scorecardData.question_answer_history || []
      };

      // Generate and download the PDF
      generateAndDownloadPDF(pdfData, `${pdfData.UserInformation.CompanyName}_AI_Scorecard_${reportId}.pdf`);
      
      // Log successful PDF generation
      console.log('PDF generated successfully');
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  // Button style classes based on variant
  const variantClasses = {
    primary: 'bg-accent-green hover:bg-accent-green-dark text-white',
    secondary: 'bg-primary-dark-teal hover:bg-primary-dark-teal-dark text-white',
    outline: 'bg-white border border-accent-green text-accent-green hover:bg-accent-green hover:text-white'
  };

  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <div>
      <button
        onClick={handleGeneratePDF}
        disabled={loading}
        className={`rounded-md font-semibold transition-colors duration-300 
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating PDF...
          </span>
        ) : (
          'Generate PDF V2'
        )}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default ScoreCardPDFButton; 