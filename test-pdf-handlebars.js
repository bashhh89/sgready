/**
 * Test script for PDF generation with Handlebars templates
 * This script sends a sample request to the PDF generation endpoints
 * to verify that Handlebars templates are properly processed.
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Sample test data
const testData = {
  UserInformation: {
    Industry: "Property/Real Estate",
    UserName: "Ahmad Basheer",
    CompanyName: "Test Real Estate Co.",
    Email: "test@example.com"
  },
  ScoreInformation: {
    AITier: "Enabler",
    FinalScore: 65,
    ReportID: "test-report-id-123456"
  },
  QuestionAnswerHistory: [
    {
      question: "How many employees does your company have?",
      answer: "50-100",
      phaseName: "Company Information",
      answerType: "radio",
      options: ["Under 10", "10-50", "50-100", "100-500", "Over 500"],
      reasoningText: "This helps us understand the scale of your operation."
    },
    {
      question: "What are your primary goals for using AI?",
      answer: "Increase efficiency|Reduce costs|Improve customer service",
      phaseName: "AI Goals",
      answerType: "checkbox",
      options: ["Increase efficiency", "Reduce costs", "Improve customer service", "Gain competitive advantage", "Other"],
      reasoningText: "Understanding your goals helps us tailor recommendations to your specific needs."
    },
    {
      question: "Do you currently use any AI tools?",
      answer: "Yes",
      phaseName: "Current AI Usage",
      answerType: "radio",
      options: ["Yes", "No", "Not sure"],
      answerSource: "User input"
    }
  ],
  FullReportMarkdown: `
# AI Efficiency Assessment for Test Real Estate Co.

This assessment provides an overview of your organization's AI readiness and efficiency.

## Key Findings

**Strengths:**
- Strong leadership commitment to AI adoption
- Clear understanding of AI use cases in real estate
- Existing data infrastructure that can support AI initiatives

**Weaknesses:**
- Limited technical expertise in AI/ML
- Data quality issues in some operational areas
- Lack of formal AI governance framework

## Strategic Action Plan

### Enhance Data Quality
Implement a comprehensive data quality program to address inconsistencies and gaps in property data, transaction records, and customer information.

### Develop AI Talent
Invest in upskilling current staff and recruiting specialists with expertise in AI applications relevant to real estate.

### Pilot AI-Powered Property Valuations
Start with a focused AI implementation in property valuations to demonstrate value and build organizational confidence.

## Getting Started & Resources

Here are some recommended resources to help you begin your AI journey:
- [Real Estate AI Best Practices Guide](https://example.com)
- [Property Tech AI Implementation Framework](https://example.com)
- [Data Quality for Real Estate AI Applications](https://example.com)
  `
};

async function testPdfGeneration() {
  try {
    console.log('Testing standard PDF generation...');
    const standardResponse = await fetch('http://localhost:3006/api/generate-weasyprint-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!standardResponse.ok) {
      const errorText = await standardResponse.text();
      console.error(`Standard PDF generation failed: ${standardResponse.status} - ${errorText}`);
    } else {
      const pdfBuffer = await standardResponse.arrayBuffer();
      fs.writeFileSync(path.join(__dirname, 'standard-test-output.pdf'), Buffer.from(pdfBuffer));
      console.log('Standard PDF generated successfully! Saved as standard-test-output.pdf');
    }

    console.log('Testing presentation PDF generation...');
    const presentationResponse = await fetch('http://localhost:3006/api/generate-presentation-weasyprint-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!presentationResponse.ok) {
      const errorText = await presentationResponse.text();
      console.error(`Presentation PDF generation failed: ${presentationResponse.status} - ${errorText}`);
    } else {
      const pdfBuffer = await presentationResponse.arrayBuffer();
      fs.writeFileSync(path.join(__dirname, 'presentation-test-output.pdf'), Buffer.from(pdfBuffer));
      console.log('Presentation PDF generated successfully! Saved as presentation-test-output.pdf');
    }
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
testPdfGeneration().then(() => {
  console.log('Tests completed');
}); 