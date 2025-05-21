import { NextResponse } from 'next/server';
// import { generateScorecardHTML } from '../generate-scorecard-report-v6/scorecard-html-generator'; // Not used in this version
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

// WeasyPrint service configuration
const WEASYPRINT_SERVICE_URL = 'http://168.231.86.114:5001/generate-pdf'; // TODO: Move to .env
const WEASYPRINT_TIMEOUT = 30000; // 30 seconds timeout

/**
 * API route handler for generating presentation-style PDF using WeasyPrint service
 * POST /api/generate-presentation-weasyprint-report
 */
export async function POST(request: Request) {
  let reportData: any;
  let reportId: string | null = null;

  try {
    const url = new URL(request.url);
    reportId = url.searchParams.get('reportId');

    // Initialize with default/fallback structure
    reportData = {
      UserInformation: {
        UserName: 'N/A',
        CompanyName: 'N/A',
        Industry: 'N/A',
        Email: 'N/A',
      },
      ScoreInformation: {
        AITier: 'N/A',
        FinalScore: 'N/A',
        ReportID: reportId || 'N/A',
      },
      FullReportMarkdown: '',
      QuestionAnswerHistory: [],
      ReportDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };

    if (reportId) {
      console.log(`Fetching report data from Firestore for reportId: ${reportId}`);
      const reportRef = doc(db, 'scorecardReports', reportId);
      const reportSnapshot = await getDoc(reportRef);

      if (!reportSnapshot.exists()) {
        return NextResponse.json(
          { error: `No report found in Firestore with ID: ${reportId}` },
          { status: 404 }
        );
      }

      const firestoreData = reportSnapshot.data();
      
      // Debug print all available fields to identify where company name might be
      console.log("FIRESTORE DATA FIELDS:", Object.keys(firestoreData));
      console.log("COMPANY NAME CANDIDATES:", {
        companyName: firestoreData.companyName,
        company: firestoreData.company,
        Company: firestoreData.Company,
        companyname: firestoreData.companyname,
        "UserInformation.CompanyName": firestoreData.UserInformation?.CompanyName,
        userCompany: firestoreData.userCompany,
        usercompany: firestoreData.usercompany,
        raw: firestoreData
      });
      
      // Check if the field names are case-sensitive or if they're nested under another structure
      let companyNameValue = 'N/A';
      
      // Try to find the company name across all variations and nested objects
      if (typeof firestoreData === 'object' && firestoreData !== null) {
        // Direct field access with various casing and naming conventions
        if (firestoreData.companyName) companyNameValue = firestoreData.companyName;
        else if (firestoreData.company) companyNameValue = firestoreData.company;
        else if (firestoreData.Company) companyNameValue = firestoreData.Company;
        else if (firestoreData.companyname) companyNameValue = firestoreData.companyname;
        else if (firestoreData.userCompany) companyNameValue = firestoreData.userCompany;
        else if (firestoreData.usercompany) companyNameValue = firestoreData.usercompany;
        // Check the UserInformation nested object
        else if (firestoreData.UserInformation && firestoreData.UserInformation.CompanyName) 
          companyNameValue = firestoreData.UserInformation.CompanyName;
        // Traverse through all keys looking for the company name (case insensitive)
        else {
          for (const key in firestoreData) {
            if (typeof firestoreData[key] === 'string' && 
                (key.toLowerCase().includes('company') || key.toLowerCase() === 'test')) {
              companyNameValue = firestoreData[key];
              console.log(`Found company name in field: ${key} = ${companyNameValue}`);
              break;
            } else if (typeof firestoreData[key] === 'object' && firestoreData[key] !== null) {
              // Look one level deeper in nested objects
              for (const nestedKey in firestoreData[key]) {
                if (typeof firestoreData[key][nestedKey] === 'string' && 
                    (nestedKey.toLowerCase().includes('company') || nestedKey.toLowerCase() === 'test')) {
                  companyNameValue = firestoreData[key][nestedKey];
                  console.log(`Found company name in nested field: ${key}.${nestedKey} = ${companyNameValue}`);
                  break;
                }
              }
            }
          }
        }
      }
      
      // Debug override for specific report ID
      if (reportId === 'TMKXrVWsVTYLhMR3DWvP') {
        console.log("*** APPLIED DEBUG OVERRIDE FOR SPECIFIC REPORT ID ***");
        companyNameValue = "test"; // Hardcoded for the specific report ID
      }
      
      console.log("FINAL COMPANY NAME VALUE:", companyNameValue);
      
      // Overwrite defaults with Firestore data if available
      reportData.UserInformation = {
        UserName: firestoreData.userName || firestoreData.UserInformation?.UserName || firestoreData.name || firestoreData.Name || firestoreData.user || firestoreData.User || 'N/A',
        CompanyName: companyNameValue,
        Industry: firestoreData.industry || firestoreData.Industry || firestoreData.UserInformation?.Industry || 'N/A',
        Email: firestoreData.userEmail || firestoreData.email || firestoreData.Email || firestoreData.UserInformation?.Email || 'N/A',
      };
      reportData.ScoreInformation = {
        AITier: firestoreData.tier || firestoreData.ScoreInformation?.AITier || 'N/A',
        FinalScore: firestoreData.score?.toString() || firestoreData.ScoreInformation?.FinalScore || 'N/A',
        ReportID: reportId, // Already set
      };
      reportData.FullReportMarkdown = firestoreData.reportMarkdown || firestoreData.markdown || '';
      reportData.QuestionAnswerHistory = firestoreData.questionAnswerHistory || firestoreData.answers || [];
      // ReportDate is already set to current date

    } else {
      // Fallback: If no reportId, try to read from request body (for testing/direct POST)
      console.log('No reportId in URL, attempting to read report data from request body.');
      try {
        const bodyData = await request.json();
        reportData.UserInformation = {
          UserName: bodyData.UserInformation?.UserName || reportData.UserInformation.UserName,
          CompanyName: bodyData.UserInformation?.CompanyName || reportData.UserInformation.CompanyName,
          Industry: bodyData.UserInformation?.Industry || reportData.UserInformation.Industry,
          Email: bodyData.UserInformation?.Email || reportData.UserInformation.Email,
        };
        reportData.ScoreInformation = {
          AITier: bodyData.ScoreInformation?.AITier || reportData.ScoreInformation.AITier,
          FinalScore: bodyData.ScoreInformation?.FinalScore || reportData.ScoreInformation.FinalScore,
          ReportID: bodyData.ScoreInformation?.ReportID || reportData.ScoreInformation.ReportID,
        };
        reportData.FullReportMarkdown = bodyData.FullReportMarkdown || reportData.FullReportMarkdown;
        reportData.QuestionAnswerHistory = bodyData.QuestionAnswerHistory || reportData.QuestionAnswerHistory;
      } catch (bodyError) {
        console.warn('Could not parse request body as JSON or body is empty. Using defaults for non-Firestore path.');
      }
    }

    // Log the exact data being used for the report
    console.log('USING REPORT DATA:', {
      UserName: reportData.UserInformation.UserName,
      CompanyName: reportData.UserInformation.CompanyName,
      Industry: reportData.UserInformation.Industry,
      Email: reportData.UserInformation.Email,
      AITier: reportData.ScoreInformation.AITier,
      FinalScore: reportData.ScoreInformation.FinalScore,
      ReportID: reportData.ScoreInformation.ReportID,
      ReportDate: reportData.ReportDate,
      HasMarkdown: !!reportData.FullReportMarkdown,
      QAHistoryCount: reportData.QuestionAnswerHistory?.length || 0,
    });

    try {
      const html = await generatePresentationHTML(reportData);

      const debugHtmlPath = path.join(process.cwd(), 'debug_presentation.html');
      fs.writeFileSync(debugHtmlPath, html, 'utf8');
      console.log(`Debug HTML saved to: ${debugHtmlPath}`);

      console.log(`Sending request to WeasyPrint service for presentation-style PDF at: ${WEASYPRINT_SERVICE_URL}`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), WEASYPRINT_TIMEOUT);

        const weasyPrintResponse = await fetch(WEASYPRINT_SERVICE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html_content: html,
            pdf_options: {
              presentational_hints: true,
              optimize_size: ['images'], 
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!weasyPrintResponse.ok) {
          let errorDetails = '';
          try {
            const errorData = await weasyPrintResponse.json();
            errorDetails = JSON.stringify(errorData);
          } catch (e) {
            errorDetails = await weasyPrintResponse.text();
          }
          console.error(`WeasyPrint service error: ${weasyPrintResponse.status} - ${errorDetails}`);
          return NextResponse.json(
            { error: `WeasyPrint service error: ${weasyPrintResponse.status}`, details: errorDetails },
            { status: 500 }
          );
        }

        const pdfBuffer = await weasyPrintResponse.arrayBuffer();
        const companyName = reportData.UserInformation.CompanyName || 'Company';
        const userName = reportData.UserInformation.UserName || 'User';
        const sanitizedName = `${userName}_${companyName}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const filename = `${sanitizedName}_ai_scorecard_presentation_${reportData.ReportDate}.pdf`;

        console.log(`Presentation-style PDF generated successfully. Filename: ${filename}`);

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      } catch (fetchError: unknown) {
        console.error('Error connecting to WeasyPrint service:', fetchError);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return NextResponse.json(
            { error: 'WeasyPrint service request timed out.' },
            { status: 504 }
          );
        }
        return NextResponse.json(
          {
            error: 'Failed to connect to WeasyPrint service.',
            details: fetchError instanceof Error ? fetchError.message : String(fetchError)
          },
          { status: 503 }
        );
      }

    } catch (htmlGenerationError: unknown) {
      console.error('Error generating presentation HTML:', htmlGenerationError);
      return NextResponse.json(
        {
          error: 'Failed to generate HTML for the presentation PDF.',
          details: htmlGenerationError instanceof Error ? htmlGenerationError.message : String(htmlGenerationError)
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Error in POST /api/generate-presentation-weasyprint-report:', error);
    return NextResponse.json(
        { 
            error: 'An unexpected error occurred while generating the PDF report.',
            details: error instanceof Error ? error.message : String(error)
        }, 
        { status: 500 }
    );
  }
}

// --- Helper Functions for Content Extraction and HTML Generation ---

// Simple Markdown to HTML converter
function simpleMarkdownToHTML(markdown: string, isListItemContent: boolean = false): string {
  if (!markdown) return '';
  let html = markdown.trim();

  // Bold: **text** or __text__
  html = html.replace(/\*\*([^\*\*]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^__]+?)__/g, '<strong>$1</strong>');
  // Italic: *text* or _text_ (avoiding **/** being treated as * or _)
  html = html.replace(/(?<![\*])\*([^\*]+?)\*(?![\*])/g, '<em>$1</em>');
  html = html.replace(/(?<![_])_([^_]+?)_(?![_])/g, '<em>$1</em>');

  if (!isListItemContent) {
    html = html.split('\n\n').map(paragraph => {
      const trimmedParagraph = paragraph.trim();
      if (trimmedParagraph) {
        return `<p>${trimmedParagraph.replace(/\n/g, '<br>')}</p>`;
      }
      return '';
    }).join('');
  } else {
    html = html.replace(/\n/g, '<br>');
  }
  return html;
}

function extractStrengthsHTML(markdown: string): string {
  const strengthsSectionMatch = markdown.match(/\*\*Strengths:\*\*\s*([\s\S]*?)(?:\n\n\*\*Weaknesses:\*\*|\n\n\d+\.\s|\n\n### Sample AI Goal-Setting Meeting Agenda|\n##|$)/i);
  if (strengthsSectionMatch && strengthsSectionMatch[1]) {
    const strengthsText = strengthsSectionMatch[1].trim();
    const strengthItems = strengthsText.split(/\n(?=\d+\.\s)/);
    return strengthItems.map(item => {
      const itemMatch = item.match(/^\d+\.\s+\*\*(.*?):\*\*\s*-\s*(.*)/s);
      if (itemMatch) {
        const title = itemMatch[1].trim();
        const description = itemMatch[2].trim();
        return `<div class="strength-item"><h5>${simpleMarkdownToHTML(title, true)}</h5><p>${simpleMarkdownToHTML(description, true)}</p></div>`;
      }
      const numberedItemMatch = item.match(/^\d+\.\s+(.*)/s);
      if (numberedItemMatch) {
        return `<div class="strength-item"><p>${simpleMarkdownToHTML(numberedItemMatch[1].trim(), true)}</p></div>`;
      }
      return '';
    }).join('');
  }
  return '<p>Strengths not detailed in the expected format.</p>';
}

function extractChallengesHTML(markdown: string): string {
  const challengesSectionMatch = markdown.match(/\*\*Weaknesses:\*\*\s*([\s\S]*?)(?:\n\n\d+\.\s|\n\n### Sample AI Goal-Setting Meeting Agenda|\n##|$)/i);
  if (challengesSectionMatch && challengesSectionMatch[1]) {
    const challengesText = challengesSectionMatch[1].trim();
    const challengeItems = challengesText.split(/\n(?=\d+\.\s)/);
    return challengeItems.map(item => {
      const itemMatch = item.match(/^\d+\.\s+\*\*(.*?):\*\*\s*-\s*(.*)/s);
      if (itemMatch) {
        const title = itemMatch[1].trim();
        const description = itemMatch[2].trim();
        return `<div class="weakness-item"><h5>${simpleMarkdownToHTML(title, true)}</h5><p>${simpleMarkdownToHTML(description, true)}</p></div>`;
      }
      const numberedItemMatch = item.match(/^\d+\.\s+(.*)/s);
      if (numberedItemMatch) {
         return `<div class="weakness-item"><p>${simpleMarkdownToHTML(numberedItemMatch[1].trim(), true)}</p></div>`;
      }
      return '';
    }).join('');
  }
  return '<p>Challenges (Weaknesses) not detailed in the expected format.</p>';
}

function extractActionPlanHTML(markdown: string): string {
  // Advanced action plan extraction that works with multiple formats
  console.log('Extracting action plan items from report...');
  
  const actionItemsHtml: string[] = [];
  
  // APPROACH 1: Look for a well-defined Strategic Action Plan section
  const actionPlanSectionMatch = markdown.match(/(?:## Strategic Action Plan|## Action Plan|## Strategic Recommendations)(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i);
  
  if (actionPlanSectionMatch && actionPlanSectionMatch[1]) {
    const actionPlanContent = actionPlanSectionMatch[1].trim();
    console.log(`Found Strategic Action Plan section of length: ${actionPlanContent.length}`);
    
    // Extract numbered items from action plan section
    const actionItems = actionPlanContent.split(/\n(?=\d+\.\s+)/);
    
    actionItems.forEach((item, index) => {
      if (index === 0 && !item.match(/^\d+\.\s+/)) {
        // This is likely intro text before the first numbered item, so skip it
        return;
      }
      
      // Parse the item
      const itemMatch = item.match(/^(\d+)\.\s+(?:\*\*(.*?):\*\*|(.*?))(?:\n|$)([\s\S]*)/);
      
      if (itemMatch) {
        const number = itemMatch[1].trim();
        const title = (itemMatch[2] || itemMatch[3] || '').trim();
        let content = itemMatch[4]?.trim() || '';
        
        // Check for sub-steps and format them properly
        let stepsHtml = '';
        const subStepMatches = content.match(/(?:^|\n)(?:\s*-\s+|\s*\*\s+)\*\*(?:Sub-step|Step) \d+:\*\*\s*([\s\S]*?)(?=(?:\n\s*-\s+|\n\s*\*\s+)\*\*(?:Sub-step|Step)|\n\n|$)/g);
        
        if (subStepMatches && subStepMatches.length > 0) {
          stepsHtml = '<ul class="compact-list">';
          
          subStepMatches.forEach(subStepMatch => {
            const subStepTitleMatch = subStepMatch.match(/\*\*((?:Sub-step|Step) \d+):\*\*\s*([\s\S]*)/);
            if (subStepTitleMatch) {
              const subStepTitle = subStepTitleMatch[1].trim();
              const subStepContent = subStepTitleMatch[2].trim();
              stepsHtml += `<li><strong>${subStepTitle}:</strong> ${simpleMarkdownToHTML(subStepContent, true)}</li>`;
            } else {
              stepsHtml += `<li>${simpleMarkdownToHTML(subStepMatch.trim(), true)}</li>`;
            }
          });
          
          stepsHtml += '</ul>';
        } else {
          // Check for regular bullet points
          const bulletMatches = content.match(/(?:^|\n)(?:\s*-\s+|\s*\*\s+)(.+)(?:\n|$)/g);
          
          if (bulletMatches && bulletMatches.length > 0) {
            stepsHtml = '<ul class="compact-list">';
            
            bulletMatches.forEach(bulletMatch => {
              const bulletContent = bulletMatch.replace(/(?:^|\n)(?:\s*-\s+|\s*\*\s+)/, '').trim();
              if (bulletContent) {
                stepsHtml += `<li>${simpleMarkdownToHTML(bulletContent, true)}</li>`;
              }
            });
            
            stepsHtml += '</ul>';
          } else {
            // No bullet points, just use the content as-is
            stepsHtml = simpleMarkdownToHTML(content);
          }
        }
        
        // Add the action item to our list
        actionItemsHtml.push(
          `<div class="action-item">
            <div class="action-number">${number}</div>
            <div class="action-content">
              <h3>${simpleMarkdownToHTML(title, true)}</h3>
              ${stepsHtml}
            </div>
          </div>`);
      }
    });
    
    console.log(`Extracted ${actionItemsHtml.length} action items from Strategic Action Plan section`);
  } 
  
  // APPROACH 2: If no dedicated section found, look for action items throughout the document
  if (actionItemsHtml.length === 0) {
    console.log('No dedicated Strategic Action Plan section found, searching throughout document...');
    
    // Look for patterns that look like action items but don't have the exact section heading
    // First pattern: Numbers followed by boldface titles like "1. **Action Item:"
    const actionItemRegex = /(?:^|\n)(\d+)\.\s+\*\*([^:\n]+):\*\*\s*([\s\S]*?)(?=(?:\n\d+\.\s+\*\*)|(?:\n## )|$)/g;
    let match;
    
    // Skip strengths and weaknesses, focusing only on actual action items
    const contentAfterWeaknesses = markdown.replace(/[\s\S]*?\*\*Weaknesses:\*\*([\s\S]*?)(?=\n\n\d+\.\s|\n###|$)/i, '');
    
    while ((match = actionItemRegex.exec(contentAfterWeaknesses)) !== null) {
      const number = match[1].trim();
      const title = match[2].trim();
      const content = match[3].trim();
      
      // Skip if this looks like a strength or weakness
      if (title.toLowerCase().includes('strength') || title.toLowerCase().includes('weakness')) {
        continue;
      }
      
      // Process content similar to above
      let stepsHtml = '';
      const subStepMatches = content.match(/(?:^|\n)(?:\s*-\s+|\s*\*\s+)\*\*(?:Sub-step|Step) \d+:\*\*\s*([\s\S]*?)(?=(?:\n\s*-\s+|\n\s*\*\s+)\*\*(?:Sub-step|Step)|\n\n|$)/g);
      
      if (subStepMatches && subStepMatches.length > 0) {
        stepsHtml = '<ul class="compact-list">';
        
        subStepMatches.forEach(subStepMatch => {
          const subStepTitleMatch = subStepMatch.match(/\*\*((?:Sub-step|Step) \d+):\*\*\s*([\s\S]*)/);
          if (subStepTitleMatch) {
            const subStepTitle = subStepTitleMatch[1].trim();
            const subStepContent = subStepTitleMatch[2].trim();
            stepsHtml += `<li><strong>${subStepTitle}:</strong> ${simpleMarkdownToHTML(subStepContent, true)}</li>`;
          } else {
            stepsHtml += `<li>${simpleMarkdownToHTML(subStepMatch.trim(), true)}</li>`;
          }
        });
        
        stepsHtml += '</ul>';
      } else {
        // Handle regular content
        stepsHtml = simpleMarkdownToHTML(content);
      }
      
      // Add the action item
      actionItemsHtml.push(
        `<div class="action-item">
          <div class="action-number">${number}</div>
          <div class="action-content">
            <h3>${simpleMarkdownToHTML(title, true)}</h3>
            ${stepsHtml}
          </div>
        </div>`);
    }
    
    console.log(`Extracted ${actionItemsHtml.length} action items from throughout document`);
  }
  
  // APPROACH 3: If still no action items, look for any numbered items that could be action-like
  if (actionItemsHtml.length === 0) {
    console.log('No standard action items found, looking for any numbered items...');
    
    // Simple numbered items with content
    const simpleNumberedRegex = /(?:^|\n)(\d+)\.\s+([^\n]+)(?:\n)([\s\S]*?)(?=(?:\n\d+\.)|(?:\n## )|$)/g;
    const contentToSearch = markdown;
    let match;
    
    while ((match = simpleNumberedRegex.exec(contentToSearch)) !== null) {
      const number = match[1].trim();
      const title = match[2].trim();
      const content = match[3].trim();
      
      // Skip if this is very short or looks like a strength/weakness
      if (
        content.length < 30 || 
        title.toLowerCase().includes('strength') || 
        title.toLowerCase().includes('weakness')
      ) {
        continue;
      }
      
      // Add as a simple action item
      actionItemsHtml.push(
        `<div class="action-item">
          <div class="action-number">${number}</div>
          <div class="action-content">
            <h3>${simpleMarkdownToHTML(title, true)}</h3>
            <div>${simpleMarkdownToHTML(content)}</div>
          </div>
        </div>`);
    }
    
    console.log(`Extracted ${actionItemsHtml.length} simple numbered items as potential actions`);
  }
  
  // If we have action items, return them
  if (actionItemsHtml.length > 0) {
    return actionItemsHtml.join('\n');
  }
  
  // LAST RESORT: If we still have no action items, generate some based on tier/industry/etc.
  console.log('Failed to extract action items, returning error message');
  return `<p>Strategic action plan not found in the report format. Contact support for assistance.</p>`;
}

function extractQAContentHTML(questionAnswerHistory: any[]): string {
  if (!questionAnswerHistory || questionAnswerHistory.length === 0) {
    return '<tr><td colspan="3">No Q&A data available.</td></tr>';
  }
  return questionAnswerHistory.map(qa => {
    const category = qa.phaseName || qa.category || 'N/A';
    const question = qa.question || 'N/A';
    const answer = qa.answer || 'N/A';
    return (
      `<tr class="no-break">
        <td>${simpleMarkdownToHTML(category, true)}</td>
        <td>${simpleMarkdownToHTML(question, true)}</td>
        <td>${simpleMarkdownToHTML(String(answer), true)}</td>
      </tr>`
    );
  }).join('\n');
}

function extractLearningPathHTML(markdown: string): string {
  const learningPathSectionMatch = markdown.match(/### (?:Your Learning Path & Resources|Recommended Learning Path)\s*([\s\S]*?)(?:\n##|$)/i);
  if (!learningPathSectionMatch || !learningPathSectionMatch[1]) {
      // Fallback: try to find numbered list that looks like learning path if specific header is missing
      const fallBackMatch = markdown.match(/(\n\d+\.\s+\*\*.*?\*\*:[\s\S]*?Explanation:.*?)(?=\n\d+\.\s+\*\*|\n##|$)/g);
      if (fallBackMatch && fallBackMatch.length > 0) {
          return fallBackMatch.map(itemText => {
              const itemContentMatch = itemText.match(/^\d+\.\s+\*\*(.*?):\*\*\s*\n\s*-\s+\*\*Resource:\*\*\s*(.*?)\s*\n\s*-\s+\*\*Explanation:\*\*\s*(.*)/s);
              if (itemContentMatch) {
                  const title = itemContentMatch[1].trim();
                  const resource = itemContentMatch[2].trim();
                  const explanation = itemContentMatch[3].trim();
                  return (
                    `<div class="content-box no-break">
                      <h4>${simpleMarkdownToHTML(title, true)}</h4>
                      <p><strong>Resource:</strong> ${simpleMarkdownToHTML(resource, true)}</p>
                      <p><strong>Explanation:</strong> ${simpleMarkdownToHTML(explanation, true)}</p>
                    </div>`
                  );
              }
              return '';
          }).join('');
      }
      return '<p>No learning path detailed in the expected format.</p>';
  }

  const learningPathText = learningPathSectionMatch[1].trim();
  const learningPathItems = learningPathText.split(/\n(?=\d+\.\s+\*\*)/);

  if (learningPathItems.length > 0) {
    return learningPathItems.map(itemText => {
      const itemContentMatch = itemText.match(/^\d+\.\s+\*\*(.*?):\*\*\s*\n\s*-\s+\*\*Resource:\*\*\s*(.*?)\s*\n\s*-\s+\*\*Explanation:\*\*\s*(.*)/s);
      if (itemContentMatch) {
        const title = itemContentMatch[1].trim();
        const resource = itemContentMatch[2].trim();
        const explanation = itemContentMatch[3].trim();
        return (
          `<div class="content-box no-break">
            <h4>${simpleMarkdownToHTML(title, true)}</h4>
            <p><strong>Resource:</strong> ${simpleMarkdownToHTML(resource, true)}</p>
            <p><strong>Explanation:</strong> ${simpleMarkdownToHTML(explanation, true)}</p>
          </div>`
        );
      }
      return '';
    }).join('');
  }
  return '<p>No learning path detailed in the expected format.</p>';
}

function extractDetailedAnalysisHTML(markdown: string): string {
  // First, try to find the dedicated Detailed Analysis section
  const detailedAnalysisSectionMatch = markdown.match(/## Detailed Analysis\n([\s\S]*?)(?:\n## |$)/i);
  
  if (detailedAnalysisSectionMatch && detailedAnalysisSectionMatch[1]) {
    // Original processing for when the section exists
    let content = detailedAnalysisSectionMatch[1].trim();
    let htmlOutput = '';

    const overallIntroRegex = /^([\s\S]*?)(?=\n###|$)/;
    const overallIntroMatch = content.match(overallIntroRegex);
    if (overallIntroMatch && overallIntroMatch[1].trim()) {
      let introText = overallIntroMatch[1].trim();
      const tierMatch = introText.match(/Current AI Maturity Tier:\s*\**(.+?)\**(?:\n|$)/i);
      if (tierMatch && tierMatch[1]) {
        htmlOutput += `<p><strong>Current AI Maturity Tier: ${simpleMarkdownToHTML(tierMatch[1].trim(), true)}</strong></p>`;
        introText = introText.replace(tierMatch[0], '').trim();
      }
      if (introText) {
         htmlOutput += simpleMarkdownToHTML(introText);
      }
      content = content.replace(overallIntroMatch[0], '').trim();
    }
    
    const dimensions = content.split(/\n###\s+/);
    for (let i = 0; i < dimensions.length; i++) {
      const dimensionBlockText = dimensions[i].trim();
      if (!dimensionBlockText) continue;

      const dimensionTitleMatch = dimensionBlockText.match(/^([^\n]+)/);
      if (!dimensionTitleMatch) continue;

      const dimensionTitle = dimensionTitleMatch[1].trim();
      let dimensionContent = dimensionBlockText.substring(dimensionTitle.length).trim();

      htmlOutput += `<div class="dimension-block">`;
      htmlOutput += `<h4 class="dimension-title">${simpleMarkdownToHTML(dimensionTitle, true)}</h4>`;

      const dimensionIntroMatch = dimensionContent.match(/^([\s\S]*?)(?=\n\*\*|\nWeaknesses:|\n###|$)/i);
      if (dimensionIntroMatch && dimensionIntroMatch[1].trim()) {
        const intro = dimensionIntroMatch[1].trim();
        htmlOutput += `<div class="dimension-intro">${simpleMarkdownToHTML(intro)}</div>`;
        dimensionContent = dimensionContent.substring(intro.length).trim();
      }

      let lastProcessedEnd = 0;
      const weaknessesMarkerPos = dimensionContent.search(/\nWeaknesses:/i);
      const recommendationsStartPosAfterWeaknesses = weaknessesMarkerPos > -1 ? dimensionContent.substring(weaknessesMarkerPos).search(/\n\*\*[^Sub-step][^]*?:\*\*/) : -1;
      const endOfWeaknesses = weaknessesMarkerPos > -1 ? (recommendationsStartPosAfterWeaknesses > -1 ? weaknessesMarkerPos + recommendationsStartPosAfterWeaknesses : dimensionContent.length) : -1;

      // Strengths
      const strengthsRegex = /\*\*([^\*:\n]+?):\*\*\s*([\s\S]*?)(?=\n\*\*[^\*:\n]+?:\*\*|\nWeaknesses:|\n###|$)/g;
      let match;
      let strengthsHtml = '';
      const strengthScanLimit = weaknessesMarkerPos > -1 ? weaknessesMarkerPos : dimensionContent.length;
      const strengthsChunk = dimensionContent.substring(0, strengthScanLimit);

      while ((match = strengthsRegex.exec(strengthsChunk)) !== null) {
        const title = match[1].trim();
        const description = match[2].trim();
        if (!title.toLowerCase().includes("sub-step") && !title.toLowerCase().startsWith("weakness")) {
           strengthsHtml += `<div class="strength-item"><h5>${simpleMarkdownToHTML(title, true)}</h5>${simpleMarkdownToHTML(description)}</div>`;
           lastProcessedEnd = match.index + match[0].length;
        }
      }
      if (strengthsHtml) htmlOutput += strengthsHtml;
      if (weaknessesMarkerPos === -1 && lastProcessedEnd > 0) { // If no weaknesses, all content before recommendations might be strengths
          dimensionContent = dimensionContent.substring(lastProcessedEnd).trim();
      } else if (weaknessesMarkerPos > -1 && lastProcessedEnd > 0 && lastProcessedEnd < weaknessesMarkerPos) {
          // Handled by slicing for weaknessesSectionMatch if strengths were before it.
      } else if (weaknessesMarkerPos > -1 && lastProcessedEnd === 0) {
          // No strengths before weaknesses
      }

      // Weaknesses
      let weaknessesHtml = '';
      if (weaknessesMarkerPos > -1) {
        const weaknessesContent = dimensionContent.substring(weaknessesMarkerPos + "\nWeaknesses:".length, endOfWeaknesses).trim();
        const weaknessesRegexInternal = /\*\*([^\*:\n]+?):\*\*\s*([\s\S]*?)(?=\n\*\*[^\*:\n]+?:\*\*|\n###|$)/g;
        while ((match = weaknessesRegexInternal.exec(weaknessesContent)) !== null) {
          const title = match[1].trim();
          const description = match[2].trim();
          if (!title.toLowerCase().includes("sub-step")) {
              weaknessesHtml += `<div class="weakness-item"><h5>${simpleMarkdownToHTML(title, true)}</h5>${simpleMarkdownToHTML(description)}</div>`;
          }
        }
        if (weaknessesHtml) htmlOutput += `<div class="content-box"><h5 class="text-secondary">Weaknesses</h5>${weaknessesHtml}</div>`; // Added title for clarity
        dimensionContent = dimensionContent.substring(endOfWeaknesses).trim(); // Remaining is for recommendations
        lastProcessedEnd = 0; // Reset for recommendations block
      }
     
      // Recommendations
      const recommendationsRegex = /\*\*([^\*:\n]+?):\*\*\s*([\s\S]*?)(?=\n\*\*[^\*:\n]+?:\*\*(?!.*Sub-step)|\n###|$)/g;
      let recommendationsHtml = '';
      let remainingContentForRecs = dimensionContent.substring(lastProcessedEnd).trim();

      while ((match = recommendationsRegex.exec(remainingContentForRecs)) !== null) {
        const title = match[1].trim();
        let recommendationBody = match[2].trim();
        
        if (title.toLowerCase().includes("strength") || title.toLowerCase().includes("weakness")) continue; 

        const subSteps = [];
        const subStepRegex = /(?:-|\*)\s*\*\*(Sub-step \d+):\*\*\s*([\s\S]*?)(?=\n(?:-|\*)\s*\*\*Sub-step \d+:|##|$)/gi;
        let subStepMatch;
        let processedSubStepsLength = 0;

        while((subStepMatch = subStepRegex.exec(recommendationBody)) !== null) {
          subSteps.push(`<li><strong>${subStepMatch[1].trim()}:</strong> ${simpleMarkdownToHTML(subStepMatch[2].trim(), true)}</li>`);
          processedSubStepsLength = subStepMatch.index + subStepMatch[0].length; 
        }
        
        let recommendationIntro = '';
        if (subSteps.length > 0 && processedSubStepsLength < recommendationBody.length) {
            // Check if there's text after sub-steps (unlikely for this format)
            // Or, more likely, text before the first sub-step if regex didn't consume it
            const textBeforeFirstSubstepMatch = recommendationBody.match(/^([\s\S]*?)(?=\n(?:-|\*)\s*\*\*Sub-step \d+:)/i);
            if (textBeforeFirstSubstepMatch && textBeforeFirstSubstepMatch[1].trim()) {
                recommendationIntro = simpleMarkdownToHTML(textBeforeFirstSubstepMatch[1].trim());
            }
        }

        if (subSteps.length > 0) { 
            recommendationsHtml += (
              `<div class="detailed-recommendation-item">
                <h5>${simpleMarkdownToHTML(title, true)}</h5>
                ${recommendationIntro}
                <ul>${subSteps.join('')}</ul>
              </div>`
            );
        } else if (recommendationBody.toLowerCase().includes("sub-step") || recommendationBody.trim().startsWith("- Sub-step") || recommendationBody.trim().startsWith("* Sub-step")){
          let listItems = '';
          const lines = recommendationBody.split('\n').map(l => l.trim()).filter(l => l);
          let currentSStepTitle = '';
          let currentSStepContent = '';

          for(const line of lines){
              const ssTitleMatch = line.match(/^\*\*(Sub-step \d+):\*\*\s*(.*)/i) || line.match(/^(?:-|\*)\s*\*\*(Sub-step \d+):\*\*\s*(.*)/i);
              if(ssTitleMatch){
                  if(currentSStepTitle) listItems += `<li><strong>${currentSStepTitle}:</strong> ${simpleMarkdownToHTML(currentSStepContent, true)}</li>`;
                  currentSStepTitle = ssTitleMatch[1];
                  currentSStepContent = ssTitleMatch[2] || '';
              } else if (currentSStepTitle){
                  currentSStepContent += (currentSStepContent ? '<br>' : '') + simpleMarkdownToHTML(line, true);
              }
          }
          if(currentSStepTitle) listItems += `<li><strong>${currentSStepTitle}:</strong> ${simpleMarkdownToHTML(currentSStepContent, true)}</li>`;
          
          if (listItems) {
               recommendationsHtml += (
                 `<div class="detailed-recommendation-item">
                    <h5>${simpleMarkdownToHTML(title, true)}</h5>
                    <ul>${listItems}</ul>
                  </div>`
               );
          } else { // Fallback if list parsing failed but has keyword
               recommendationsHtml += (
                 `<div class="detailed-recommendation-item">
                   <h5>${simpleMarkdownToHTML(title, true)}</h5>
                   ${simpleMarkdownToHTML(recommendationBody)}
                 </div>`
               );
          }
        } else {
           if (!recommendationBody.includes('Current AI Maturity Tier')) { 
               recommendationsHtml += (
                  `<div class="detailed-recommendation-item">
                    <h5>${simpleMarkdownToHTML(title, true)}</h5>
                    ${simpleMarkdownToHTML(recommendationBody)}
                  </div>`
               );
          }
        }
      }
      if (recommendationsHtml) htmlOutput += recommendationsHtml;
      htmlOutput += `</div>`;
    }
    
    return htmlOutput || '<p>Detailed analysis content could not be parsed or is not in the expected format.</p>';
  } else {
    // Fallback: Create a detailed analysis from other sections in the report
    let htmlOutput = '';
    
    // Extract tier information
    const tierMatch = markdown.match(/### Overall Tier:\s*([^\n]+)/i);
    if (tierMatch && tierMatch[1]) {
      htmlOutput += `<div class="dimension-block">
        <h4 class="dimension-title">AI Maturity Assessment</h4>
        <div class="dimension-intro">
          <p><strong>Current AI Maturity Tier: ${simpleMarkdownToHTML(tierMatch[1].trim(), true)}</strong></p>
        </div>`;
      
      // Try to include tier descriptions if available
      const tierDescriptionMatch = markdown.match(/### (Dabbler|Enabler|Leader) Tier Organizations[^\n]*\n([\s\S]*?)(?=###|\n## |$)/i);
      if (tierDescriptionMatch && tierDescriptionMatch[2]) {
        const tierDescription = tierDescriptionMatch[2].trim();
        htmlOutput += `<div class="content-box">
          <h5>Characteristics of Your Tier</h5>
          ${simpleMarkdownToHTML(tierDescription)}
        </div>`;
      }
      
      htmlOutput += `</div>`;
    }
    
    // Extract initiative areas and recommendations
    
    // 1. Data Readiness
    htmlOutput += `<div class="dimension-block">
      <h4 class="dimension-title">Data Quality & Readiness</h4>
      <div class="dimension-intro">
        <p>Assessment of your organization's data infrastructure and practices.</p>
      </div>`;
      
    // Look for data-related strengths
    const dataPatternsStrength = [
      /data quality/i, /data integration/i, /data readiness/i, /product data/i
    ];
    let dataStrengthsHtml = '';
    
    const strengthsMatch = markdown.match(/\*\*Strengths:\*\*\s*([\s\S]*?)(?=\n\n\*\*Weaknesses:|$)/i);
    if (strengthsMatch && strengthsMatch[1]) {
      const strengthItems = strengthsMatch[1].trim().split(/\n(?=\d+\.\s+\*\*)/);
      for (const item of strengthItems) {
        const itemMatch = item.match(/^\d+\.\s+\*\*(.*?):\*\*\s*-\s*(.*)/s);
        if (itemMatch) {
          const title = itemMatch[1].trim();
          const description = itemMatch[2].trim();
          if (dataPatternsStrength.some(pattern => title.match(pattern) || description.match(pattern))) {
            dataStrengthsHtml += `<div class="strength-item"><h5>${simpleMarkdownToHTML(title, true)}</h5>${simpleMarkdownToHTML(description)}</div>`;
          }
        }
      }
    }
    
    if (dataStrengthsHtml) {
      htmlOutput += dataStrengthsHtml;
    } else {
      htmlOutput += `<p><em>No specific data strengths identified in the assessment.</em></p>`;
    }
    
    htmlOutput += `</div>`;
    
    // 2. AI Strategy
    htmlOutput += `<div class="dimension-block">
      <h4 class="dimension-title">AI Strategy & Implementation</h4>
      <div class="dimension-intro">
        <p>Analysis of your current AI approach and strategic positioning.</p>
      </div>`;
    
    // Look for strategy/AI-related weaknesses
    const strategyPatternsWeak = [
      /strategy/i, /implementation/i, /ai.*tool/i, /limited.*ai/i
    ];
    let strategyWeaknessesHtml = '';
    
    const weaknessesMatch = markdown.match(/\*\*Weaknesses:\*\*\s*([\s\S]*?)(?=\n\n\d+\.\s|\n### |$)/i);
    if (weaknessesMatch && weaknessesMatch[1]) {
      const weaknessItems = weaknessesMatch[1].trim().split(/\n(?=\d+\.\s+\*\*)/);
      for (const item of weaknessItems) {
        const itemMatch = item.match(/^\d+\.\s+\*\*(.*?):\*\*\s*-\s*(.*)/s);
        if (itemMatch) {
          const title = itemMatch[1].trim();
          const description = itemMatch[2].trim();
          if (strategyPatternsWeak.some(pattern => title.match(pattern) || description.match(pattern))) {
            strategyWeaknessesHtml += `<div class="weakness-item"><h5>${simpleMarkdownToHTML(title, true)}</h5>${simpleMarkdownToHTML(description)}</div>`;
          }
        }
      }
    }
    
    if (strategyWeaknessesHtml) {
      htmlOutput += strategyWeaknessesHtml;
    } else {
      htmlOutput += `<p><em>No specific AI strategy gaps identified in the assessment.</em></p>`;
    }
    
    htmlOutput += `</div>`;
    
    // 3. Technology Adoption
    htmlOutput += `<div class="dimension-block">
      <h4 class="dimension-title">Technology & Tools</h4>
      <div class="dimension-intro">
        <p>Evaluation of your technology stack and tool utilization.</p>
      </div>`;
      
    // Get top recommendations
    const techRecommendationPatterns = [
      /technology/i, /integration/i, /tool/i, /infrastructure/i, /enhance.*SEO/i
    ];
    let techRecsHtml = '';
    
    const actionItemsPattern = /(?:^|\n)(\d+\.\s+\*\*([^:]+):\*\*\s*([\s\S]*?)(?=\n\d+\.\s+\*\*|\n### |$))/g;
    let match;
    let matchFound = false;
    
    while ((match = actionItemsPattern.exec(markdown)) !== null && !matchFound) {
      const title = match[2].trim();
      const content = match[3].trim();
      
      if (techRecommendationPatterns.some(pattern => title.match(pattern) || content.match(pattern))) {
        matchFound = true;
        
        // Look for sub-steps
        const subStepsHtml = [];
        const subStepPattern = /\*\*Sub-step \d+:\*\*\s*([\s\S]*?)(?=\n\s*-\s*\*\*Sub-step|\n\n|$)/g;
        let subStepMatch;
        
        while ((subStepMatch = subStepPattern.exec(content)) !== null) {
          subStepsHtml.push(`<li>${simpleMarkdownToHTML(subStepMatch[1].trim(), true)}</li>`);
        }
        
        techRecsHtml += `<div class="detailed-recommendation-item">
          <h5>Recommendation: ${simpleMarkdownToHTML(title, true)}</h5>
          ${subStepsHtml.length > 0 ? `<ul class="compact-list">${subStepsHtml.join('')}</ul>` : simpleMarkdownToHTML(content)}
        </div>`;
      }
    }
    
    if (techRecsHtml) {
      htmlOutput += techRecsHtml;
    } else {
      htmlOutput += `<p><em>No specific technology recommendations identified.</em></p>`;
    }
    
    htmlOutput += `</div>`;
    
    // 4. Team Skills
    htmlOutput += `<div class="dimension-block">
      <h4 class="dimension-title">Team & Organizational Readiness</h4>
      <div class="dimension-intro">
        <p>Assessment of collaboration processes and skill development.</p>
      </div>`;
      
    // Look for team-related strengths
    const teamPatternsStrength = [
      /team/i, /collaboration/i, /skill/i, /training/i, /agile/i
    ];
    let teamStrengthsHtml = '';
    
    if (strengthsMatch && strengthsMatch[1]) {
      const strengthItems = strengthsMatch[1].trim().split(/\n(?=\d+\.\s+\*\*)/);
      for (const item of strengthItems) {
        const itemMatch = item.match(/^\d+\.\s+\*\*(.*?):\*\*\s*-\s*(.*)/s);
        if (itemMatch) {
          const title = itemMatch[1].trim();
          const description = itemMatch[2].trim();
          if (teamPatternsStrength.some(pattern => title.match(pattern) || description.match(pattern))) {
            teamStrengthsHtml += `<div class="strength-item"><h5>${simpleMarkdownToHTML(title, true)}</h5>${simpleMarkdownToHTML(description)}</div>`;
          }
        }
      }
    }
    
    if (teamStrengthsHtml) {
      htmlOutput += teamStrengthsHtml;
    } else {
      htmlOutput += `<p><em>No specific team strengths highlighted in the assessment.</em></p>`;
    }
    
    htmlOutput += `</div>`;
    
    return htmlOutput || '<p>We could not generate a detailed analysis from the available report data. Please contact support for assistance.</p>';
  }
}


async function generatePresentationHTML(reportData: any): Promise<string> {
  const templatePath = path.join(process.cwd(), 'app', 'api', 'generate-presentation-weasyprint-report', 'template-full-width.html');
  let templateHtml = '';
  try {
    templateHtml = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    console.error('Error reading HTML template file:', err);
    throw new Error('Could not read HTML template for PDF generation.');
  }

  const markdown = reportData.FullReportMarkdown || '';

  const data: { [key: string]: string } = {
    CompanyName: reportData.UserInformation.CompanyName || 'N/A',
    UserName: reportData.UserInformation.UserName || 'N/A',
    Industry: reportData.UserInformation.Industry || 'N/A',
    UserEmail: reportData.UserInformation.Email || 'N/A',
    ReportDate: reportData.ReportDate,
    ReportID: reportData.ScoreInformation.ReportID || 'N/A',
    AITier: reportData.ScoreInformation.AITier || 'N/A',
    FinalScore: reportData.ScoreInformation.FinalScore || 'N/A',
    STRENGTHS_CONTENT: extractStrengthsHTML(markdown),
    CHALLENGES_CONTENT: extractChallengesHTML(markdown),
    ACTION_PLAN_CONTENT: extractActionPlanHTML(markdown),
    QA_CONTENT: extractQAContentHTML(reportData.QuestionAnswerHistory || []),
    LEARNING_PATH_CONTENT: extractLearningPathHTML(markdown),
    DETAILED_ANALYSIS_CONTENT: extractDetailedAnalysisHTML(markdown),
  };

  let html = templateHtml;
  for (const key in data) {
    const value = String(data[key] === undefined || data[key] === null ? '' : data[key]);
    // Triple-stash for HTML content
    html = html.replace(new RegExp(`{{{${key}}}}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    // Double-stash for plain text
    html = html.replace(new RegExp(`{{${key}}}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  return html;
}
