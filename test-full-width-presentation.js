const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Sample test data for the scorecard report
const testData = {
  UserInformation: {
    UserName: "John Smith",
    CompanyName: "Acme Corporation",
    Industry: "Technology",
    Email: "john@acmecorp.com"
  },
  ScoreInformation: {
    FinalScore: 72,
    AITier: "Enabler",
    ReportID: "SCR-" + Math.floor(100000 + Math.random() * 900000)
  },
  FullReportMarkdown: `
# AI Efficiency Scorecard for Acme Corporation

## Introduction
This report provides an assessment of your organization's AI efficiency and maturity.

## Key Strengths in AI Adoption
1. **Strategic Vision** - Clear understanding of how AI can transform business operations
2. **Data Infrastructure** - Solid foundation of organized data ready for AI implementation
3. **Technical Expertise** - Strong technical team with AI/ML knowledge

## Challenges and Weaknesses
1. **Integration Gaps** - AI systems operate in silos rather than as an integrated ecosystem
2. **Change Management** - Resistance to AI adoption among some departments
3. **Governance Framework** - Limited governance policies for AI systems
4. **ROI Measurement** - Difficulty quantifying the business impact of AI investments

## Strategic Action Plan
1. Develop an integrated AI roadmap aligning with business objectives
2. Implement an AI governance framework with clear policies and standards
3. Create a cross-functional AI center of excellence
4. Establish standardized metrics for measuring AI ROI
5. Expand AI literacy training across all departments

## Recommendations
1. Focus on integrating existing AI systems before adding new ones
2. Develop a structured change management program for AI adoption
3. Implement regular AI audits to ensure alignment with business goals
  `,
  QuestionAnswerHistory: [
    {
      phaseName: "Strategy & Goals",
      question: "What are your primary business objectives for implementing AI?",
      answer: "Improving operational efficiency and enhancing customer experience"
    },
    {
      phaseName: "Data Readiness",
      question: "How would you describe your organization's data quality?",
      answer: "Moderate - we have good data in some areas but inconsistencies in others"
    },
    {
      phaseName: "Implementation",
      question: "Which departments currently use AI tools?",
      answer: "Marketing, Customer Service, and Operations"
    },
    {
      phaseName: "Governance",
      question: "Do you have formal AI governance policies?",
      answer: "We have basic guidelines but not a comprehensive framework"
    },
    {
      phaseName: "Skills & Culture",
      question: "How would you rate your team's AI literacy?",
      answer: "Technical teams have good knowledge, but general staff need more training"
    }
  ]
};

async function testFullWidthPresentationPdf() {
  try {
    console.log('Testing full-width presentation-style PDF generation...');
    
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
      console.error(`Full-width presentation PDF generation failed: ${response.status} - ${errorText}`);
      return;
    }
    
    const pdfBuffer = await response.arrayBuffer();
    fs.writeFileSync(path.join(__dirname, 'full-width-presentation.pdf'), Buffer.from(pdfBuffer));
    console.log('Full-width presentation PDF generated successfully! Saved as full-width-presentation.pdf');
    
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
testFullWidthPresentationPdf(); 