# AI Efficiency Scorecard Report Generator (v6)

This module provides a modern, responsive HTML template for generating AI Efficiency Scorecard reports with dynamic content. The template is designed to be visually appealing and easily convertible to PDF format.

## Features

- Clean, modern design with responsive layout
- Support for dynamic content insertion
- Sections for key strengths, challenges, and strategic action plans
- PDF download functionality
- Preview interface for testing

## API Endpoints

### Generate HTML Report

**Endpoint:** `/api/generate-scorecard-report-v6`

**Method:** POST

**Request Body:**

```json
{
  "report_title": "AI Efficiency Scorecard",
  "report_subject_name": "Company XYZ",
  "report_description": "A comprehensive assessment of AI effectiveness and strategic opportunities",
  "report_author": "AI Strategy Team",
  "header_image_url": "https://example.com/image.jpg",
  "header_banner_text": "Confidential Assessment Report",
  "section1_title": "Key Strengths in AI Adoption",
  "section1_items": [
    {
      "title": "Strength 1",
      "description": "Description of strength 1"
    },
    {
      "title": "Strength 2",
      "description": "Description of strength 2"
    }
  ],
  "section1_banner_text": "Build on these strengths for continued success",
  "section2_title": "Challenges and Weaknesses",
  "section2_items": [
    {
      "title": "Challenge 1",
      "description": "Description of challenge 1"
    },
    {
      "title": "Challenge 2",
      "description": "Description of challenge 2"
    },
    {
      "title": "Challenge 3",
      "description": "Description of challenge 3"
    }
  ],
  "section2_banner_text": "Address these challenges to improve AI efficiency",
  "section3_title": "Strategic Action Plan Overview",
  "section3_items": [
    {
      "number": 1,
      "title": "Action 1",
      "description": "Description of action 1"
    },
    {
      "number": 2,
      "title": "Action 2",
      "description": "Description of action 2"
    },
    {
      "number": 3,
      "title": "Action 3",
      "description": "Description of action 3"
    }
  ],
  "section3_banner_text": "Implement these actions for optimal results",
  "footer_text": "© 2023 AI Efficiency Assessment Team | Report ID: ABC123"
}
```

**Response:**
HTML content with the populated template

### Generate PDF Report

**Endpoint:** `/api/generate-scorecard-report-v6/download-pdf`

**Method:** POST

**Request Body:**

```json
{
  "html": "HTML content to convert to PDF"
}
```

**Response:**
PDF file as a downloadable attachment

## Setup Instructions

1. Ensure you have the required environment variables:
   - `PDFSHIFT_API_KEY`: API key for PDFShift service (for PDF generation)

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Access the preview page at `/api/generate-scorecard-report-v6`

## PDF Generation

This module uses the PDFShift API for converting HTML to PDF. Alternatively, you can use the Puppeteer implementation by:

1. Uncommenting the Puppeteer code in `pdf-generator.ts`
2. Installing the required dependencies:
   ```bash
   pnpm add puppeteer
   ```
3. Updating the `generatePDF` function to use the Puppeteer implementation

## Customization

The template can be customized by modifying:

- `template.html` - HTML structure and placeholder syntax
- CSS styles within the `<style>` tag in `template.html`
- Color variables in the `:root` CSS selector

## Integration

To integrate this report generator into your application:

1. Make a POST request to `/api/generate-scorecard-report-v6` with your report data
2. Display the returned HTML or convert it to PDF using the `/api/generate-scorecard-report-v6/download-pdf` endpoint

## License

This project is licensed under the MIT License. 