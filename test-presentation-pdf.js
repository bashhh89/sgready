const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Sample data for testing
const testData = {
  UserInformation: {
    Industry: 'Property/Real Estate',
    UserName: 'Test User',
    CompanyName: 'Test Company',
    Email: 'test@example.com'
  },
  ScoreInformation: {
    AITier: 'Enabler',
    FinalScore: 72,
    ReportID: 'TEST-123'
  },
  QuestionAnswerHistory: [
    {
      question: 'How does your organization approach AI implementation?',
      answer: 'Structured AI training program with ongoing support',
      phaseName: 'Strategy & Goals'
    },
    {
      question: 'What data sources have you integrated into your AI systems?',
      answer: 'CRM data, market data, public records',
      phaseName: 'Data Readiness'
    },
    {
      question: 'Which AI-powered tools are utilized in your organization?',
      answer: 'CRM, market analysis, property valuation',
      phaseName: 'Technology & Tools'
    }
  ],
  FullReportMarkdown: `
# Executive Summary

This AI Efficiency Scorecard provides a comprehensive assessment of AI effectiveness and strategic opportunities for Test Company in the Property/Real Estate industry.

## Key Strengths

1. **Proactive AI Integration** - AI is actively used for predictive maintenance, tenant communication, and leasing decisions.
2. **Diverse AI Applications** - AI tools support marketing, client relationship management, and business analytics.

## Challenges and Weaknesses

1. **Back-Office AI Integration** - Cost, system compatibility, skilled personnel shortages, and data privacy concerns.
2. **Data Quality and Integration** - Inconsistent and fragmented data sources affect readiness.

## Strategic Action Plan

1. Enhance Data Audit Frequency
2. Optimize AI-Powered CRM
3. Establish Bias Monitoring
4. Develop AI ROI Framework
5. Increase AI Vendor Transparency
  `
};

async function testPresentationPdf() {
  try {
    console.log('Testing presentation-style PDF generation...');
    
    const response = await fetch('http://localhost:3006/api/generate-presentation-weasyprint-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      console.error(`Presentation PDF generation failed: ${response.status} - ${errorText}`);
      return;
    }
    
    const pdfBuffer = await response.arrayBuffer();
    fs.writeFileSync(path.join(__dirname, 'test-presentation-output.pdf'), Buffer.from(pdfBuffer));
    console.log('Presentation PDF generated successfully! Saved as test-presentation-output.pdf');
    
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
testPresentationPdf(); 