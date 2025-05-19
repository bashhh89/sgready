import { NextResponse, NextRequest } from 'next/server';
// Adjust the import path if your lib folder is structured differently
import { generateScorecardHTMLv5 } from '../../../lib/html-generation/scorecard-html-v5'; 

// --- SCORECARD_DEBUG_DATA ---
const SCORECARD_DEBUG_DATA = {
    UserInformation: { Industry: "Property/Real Estate", UserName: "Ahmad Basheer", CompanyName: "QanDu.io", Email: "ahmadbasheerr@gmail.com" },
    ScoreInformation: { AITier: "Enabler", FinalScore: null, ReportID: "4zrPq2Jmh53iSEjGPImk" },
    QuestionAnswerHistory: [
        { 
            "reasoningText": "The response indicates a moderate level of AI integration in CRM systems, which suggests there's room for improvement in using AI for client interaction and management.",
            "phaseName": "Implementation & Adoption",
            "answerType": "scale",
            "options": ["1", "2", "3", "4", "5"],
            "question": "On a scale of 1-5, how would you rate the AI maturity level in your CRM systems?",
            "answer": "3",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "The agency is primarily focused on listings management and client matching, suggesting a strategic focus on core real estate operations where AI can provide immediate value.",
            "phaseName": "Strategy & Goals",
            "answerType": "checkbox",
            "options": ["Listings management", "Client matching", "Market analysis", "Property valuation", "Back-office automation"],
            "question": "Which areas of your real estate business are you primarily focusing on for AI integration?",
            "answer": "Listings management|Client matching",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Having multiple team members trained in AI tools indicates a decent level of adoption and capacity building within the organization.",
            "phaseName": "Capability & Skills",
            "answerType": "radio",
            "options": ["No dedicated team members", "One team member with basic training", "Multiple team members trained in AI tools", "Dedicated AI specialist", "Specialized AI team"],
            "question": "What AI capabilities does your team currently have?",
            "answer": "Multiple team members trained in AI tools",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Regular data evaluation practices ensure that the data infrastructure supporting AI initiatives remains current and effective.",
            "phaseName": "Data & Infrastructure",
            "answerType": "radio",
            "options": ["No regular evaluation", "Annual evaluation", "Quarterly evaluation", "Monthly evaluation", "Continuous evaluation"],
            "question": "How often do you evaluate and update your data management practices?",
            "answer": "Quarterly evaluation",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "The challenges identified suggest that while the agency recognizes the potential value of AI in back-office operations, there are significant hurdles to implementation.",
            "phaseName": "Implementation & Adoption",
            "answerType": "checkbox",
            "options": ["Cost", "Integration with existing systems", "Lack of skilled personnel", "Data privacy concerns", "Regulatory compliance"],
            "question": "What challenges are you facing in implementing AI for back-office operations?",
            "answer": "Cost|Integration with existing systems|Lack of skilled personnel|Data privacy concerns",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Using AI for predictive maintenance, tenant communication, and leasing decisions shows a diverse application of AI across property management functions.",
            "phaseName": "Implementation & Adoption",
            "answerType": "checkbox",
            "options": ["Predictive maintenance", "Tenant communication", "Leasing decisions", "Building security", "Energy management"],
            "question": "How is your agency using AI in property management?",
            "answer": "Predictive maintenance|Tenant communication|Leasing decisions",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Multiple AI tools are being used across different functions, indicating a reasonable level of AI adoption in the organization.",
            "phaseName": "Implementation & Adoption",
            "answerType": "checkbox",
            "options": ["Marketing automation", "Client relationship management", "Virtual property tours", "Chatbots", "Business analytics"],
            "question": "Which AI tools are currently being used in your agency?",
            "answer": "Marketing automation|Client relationship management|Business analytics",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Formal AI training programs demonstrate a commitment to building AI capabilities within the organization.",
            "phaseName": "Capability & Skills",
            "answerType": "radio",
            "options": ["No training", "Informal self-learning", "Occasional workshops", "Regular training sessions", "Formal AI training programs"],
            "question": "What training do you provide for staff to use AI tools?",
            "answer": "Formal AI training programs",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "A medium-term vision suggests strategic thinking about AI's role in the organization, but perhaps not yet a fully developed long-term strategy.",
            "phaseName": "Strategy & Goals",
            "answerType": "radio",
            "options": ["No vision", "Short-term tactical use", "Medium-term vision", "Long-term strategic plan", "Transformative vision"],
            "question": "What is your vision for AI in your real estate agency?",
            "answer": "Medium-term vision",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Having clear guidelines on AI usage indicates awareness of ethical considerations and corporate responsibility in AI deployment.",
            "phaseName": "Governance & Ethics",
            "answerType": "radio",
            "options": ["No guidelines", "Informal discussions only", "Basic written guidelines", "Comprehensive policies", "Regular policy reviews and updates"],
            "question": "What ethical guidelines do you have for AI usage?",
            "answer": "Comprehensive policies",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Regular reviews and specific metrics show a structured approach to evaluating AI effectiveness, which is important for continuous improvement.",
            "phaseName": "Monitoring & Optimization",
            "answerType": "radio",
            "options": ["No measurement", "Anecdotal feedback only", "Basic performance tracking", "Regular reviews with specific metrics", "Comprehensive ROI analysis"],
            "question": "How do you measure the impact of AI on your business?",
            "answer": "Regular reviews with specific metrics",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Planning for moderate increase in AI investment indicates continued commitment to developing AI capabilities without dramatic scaling up.",
            "phaseName": "Strategy & Goals",
            "answerType": "radio",
            "options": ["No planned investment", "Maintaining current level", "Moderate increase", "Significant increase", "Major strategic investment"],
            "question": "What are your plans for AI investment in the next fiscal year?",
            "answer": "Moderate increase",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Having a centralized data warehouse indicates relatively sophisticated data infrastructure to support AI initiatives.",
            "phaseName": "Data & Infrastructure",
            "answerType": "radio",
            "options": ["Mostly paper records", "Spread across different digital systems", "Basic central database", "Centralized data warehouse", "Advanced data lake architecture"],
            "question": "How is your property and client data currently stored?",
            "answer": "Centralized data warehouse",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Using AI to identify market opportunities shows strategic application of AI for business growth and competitive advantage.",
            "phaseName": "Strategy & Goals",
            "answerType": "checkbox",
            "options": ["Cost reduction", "Customer experience improvement", "Process efficiency", "Market opportunity identification", "Risk management"],
            "question": "What are your primary objectives for using AI?",
            "answer": "Customer experience improvement|Process efficiency|Market opportunity identification",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Using a combination of in-house and vendor support provides a balanced approach to AI solution development.",
            "phaseName": "Implementation & Adoption",
            "answerType": "radio",
            "options": ["No development", "Exclusively vendor solutions", "Primarily vendor with some customization", "Combination of in-house and vendor", "Primarily in-house development"],
            "question": "How are AI solutions developed in your organization?",
            "answer": "Combination of in-house and vendor",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Occasional cross-departmental collaboration indicates emerging integration of AI across the organization, but not yet fully systematic.",
            "phaseName": "Implementation & Adoption",
            "answerType": "radio",
            "options": ["Isolated in IT", "Limited to specific departments", "Occasional cross-departmental collaboration", "Systematic integration across departments", "Organization-wide AI-first approach"],
            "question": "How is AI integrated across different functions in your agency?",
            "answer": "Occasional cross-departmental collaboration",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Regular small-scale pilot projects suggest an incremental, test-and-learn approach to AI implementation.",
            "phaseName": "Implementation & Adoption",
            "answerType": "radio",
            "options": ["No experimentation", "Ad-hoc trials", "Regular small-scale pilot projects", "Systematic innovation program", "Advanced AI R&D initiatives"],
            "question": "How do you approach experimenting with new AI technologies?",
            "answer": "Regular small-scale pilot projects",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Lead conversion rate improvements suggest AI is helping to qualify and convert prospects more effectively, a key metric for marketing success.",
            "phaseName": "Monitoring & Optimization",
            "answerType": "checkbox",
            "options": ["Lead conversion rates", "Revenue growth", "Cost reduction", "Customer satisfaction", "Employee productivity"],
            "question": "Which KPIs have shown improvement since implementing AI in your marketing?",
            "answer": "Lead conversion rates|Customer satisfaction|Employee productivity",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Moderate satisfaction with business analytics tools indicates they're providing value but may have limitations or areas for improvement.",
            "phaseName": "Monitoring & Optimization",
            "answerType": "scale",
            "options": ["1", "2", "3", "4", "5"],
            "question": "On a scale of 1-5, how satisfied are you with your AI-powered business analytics tools?",
            "answer": "3",
            "answerSource": "User Input"
        },
        { 
            "reasoningText": "Tracking campaign ROI and client engagement metrics indicates a focus on measuring AI's impact on marketing effectiveness and client relationships.",
            "phaseName": "Monitoring & Optimization",
            "answerType": "checkbox",
            "options": ["Campaign ROI", "Client engagement metrics", "Time savings", "Error reduction", "New business opportunities"],
            "question": "Which metrics do you use to measure the effectiveness of AI in your marketing operations?",
            "answer": "Campaign ROI|Client engagement metrics|New business opportunities",
            "answerSource": "User Input"
        },
        {
            "reasoningText": "Sample reasoning text for the final question",
            "phaseName": "Strategy & Goals",
            "answerType": "scale",
            "options": ["1", "2", "3", "4", "5"],
            "question": "How effectively is your real estate agency utilizing AI tools to enhance marketing and lead generation efforts?",
            "answer": "4",
            "answerSource": "Pollinations Fallback"
        }
    ],
    FullReportMarkdown: `# AI Efficiency Scorecard for Ahmad Basheer, Marketing Manager in Property/Real Estate
## Overall Tier: Enabler
## Key Findings
**Strengths:**
1. **Proactive AI Integration in Property Management:** Your agency is actively working on integrating AI for predictive maintenance, tenant communication, and leasing decisions. These efforts are essential for improving operational efficiency and tenant satisfaction, key aspects in the real estate industry.
2. **Diverse AI Application Across Operations:** AI tools are utilized in marketing, client relationship management, and business analytics, showcasing a broad and strategic approach to AI adoption, which enhances various business functions.
3. **Regular Data Management Practices:** Evaluating and updating data management practices quarterly ensures that the data infrastructure is robust and up-to-date, which is critical for accurate AI model training and decision-making.
4. **Established Training Programs:** Implementing regular AI-focused training sessions and encouraging certifications improve team readiness and adaptability, crucial for effective AI tool utilization in a competitive market.
5. **Comprehensive KPI Tracking:** Monitoring KPIs such as lead conversion rates and campaign ROI provides insights into AI's effectiveness in marketing and helps refine strategies for better outcomes.
**Weaknesses:**
1. **Challenges in AI Back-Office Integration:** Difficulties with cost, integration, skilled personnel, and data privacy may hinder the full potential of AI-driven automation, impacting efficiency gains.
2. **Data Quality and Integration Issues:** Consistency and integration challenges across multiple sources can impede data readiness for advanced AI applications, affecting decision-making accuracy.
3. **Limited AI Maturity in CRM Systems:** A moderate maturity level in AI-driven CRM systems suggests opportunities for enhancing client interaction and retention strategies.
4. **AI Governance Framework Needs Development:** The governance framework, while developing, requires optimization to ensure consistent and accurate measurement of AI's impact on efficiency and satisfaction.
5. **AI Tool Satisfaction Levels:** Moderate satisfaction with business analytics tools indicates potential areas for improvement to better meet strategic needs.
## Strategic Action Plan
1. **Enhance Back-Office AI Integration:**
    - Conduct a cost-benefit analysis to prioritize AI investments based on potential ROI and operational impact.
    - Develop a phased integration plan with clear milestones to systematically address system compatibility issues.
    - Invest in training programs to upskill existing staff and recruit skilled professionals to address personnel gaps.
2. **Improve Data Quality and Integration:**
    - Standardize data collection and management processes across the agency to ensure consistency.
    - Implement advanced data integration solutions to unify disparate data sources into a centralized platform.
    - Regularly audit data systems and processes to identify and rectify quality issues promptly.
3. **Advance CRM System Maturity:**
    - Explore AI enhancements in CRM systems to provide personalized client interactions and improve retention strategies.
    - Integrate AI-driven analytics to gain deeper insights into client behavior and preferences.
    - Conduct user feedback sessions to tailor CRM features and improve user adoption rates.
4. **Optimize AI Governance Framework:**
    - Establish a dedicated AI oversight committee to regularly review governance policies and ensure alignment with industry standards.
    - Develop a comprehensive set of metrics to evaluate AI's impact on operational efficiency and client satisfaction consistently.
    - Foster a culture of transparency and ethical AI use through regular training and communication.
5. **Increase Satisfaction with Analytics Tools:**
    - Engage with stakeholders to identify specific gaps and desired improvements in current analytics tools.
    - Evaluate alternative AI platforms that offer enhanced features and better align with strategic objectives.
    - Conduct pilot programs to test new solutions and gather feedback before full-scale implementation.
## Getting Started & Resources
### Sample AI Goal-Setting Meeting Agenda
1. **Introduction to Current AI Usage and Goals:**
    - Review existing AI applications and their outcomes.
    - Set clear objectives for AI integration in the upcoming quarter.
2. **Identify Key AI Opportunities in Property Management:**
    - Discuss potential AI applications for enhancing tenant services and property efficiency.
    - Set measurable goals for pilot projects.
3. **Data Management and Integration Review:**
    - Evaluate current data practices and identify integration challenges.
    - Plan steps for standardization and quality improvement.
4. **AI Governance and Measurement Enhancement:**
    - Review current governance policies and measurement metrics.
    - Set next steps for framework optimization and compliance assurance.
### Example Prompts for Property/Real Estate Marketing Managers
- **PROMPT:** "Generate a targeted marketing campaign strategy for luxury real estate properties in urban areas."
  - **USE CASE:** To create effective marketing campaigns that appeal to high-net-worth individuals looking for luxury properties.
- **PROMPT:** "Analyze current market trends affecting property prices in suburban areas."
  - **USE CASE:** To provide insights that inform pricing strategies and investment decisions.
- **PROMPT:** "Develop a chatbot script for first-time homebuyer inquiries."
  - **USE CASE:** To enhance client interaction and provide timely, accurate information to potential buyers.
### Basic AI Data Audit Process Outline
1. **Data Inventory Assessment:**
    - Catalog all existing data sources and assess their relevance and current use.
2. **Data Quality Evaluation:**
    - Conduct checks on data accuracy, consistency, and completeness.
3. **Data Integration Review:**
    - Analyze current integration processes and identify bottlenecks or gaps.
4. **Compliance and Security Check:**
    - Ensure all data management practices meet privacy and industry regulations.
## Illustrative Benchmarks
### Dabbler Tier Organizations in Property/Real Estate
- Typically allocate only 5-10% of their IT budget to AI initiatives.
- Commonly start with basic AI applications like automated email marketing and property listing optimizations.
- Often lack formalized AI governance structures, with only about 20% having dedicated AI roles or committees.
### Enabler Tier Organizations in Property/Real Estate
- See 15-25% improvement in operational efficiency through AI-driven property management and client engagement.
- Typically have integrated AI into core business processes, with 60% using AI for detailed market analyses and tenant management.
- Use comprehensive data integration practices that allow for scalable AI use, setting them apart from Dabblers.
### Leader Tier Organizations in Property/Real Estate
- Achieve 30-50% higher revenue growth through advanced AI applications like predictive analytics for market trends and personalized client experiences.
- Over 80% embed AI in executive decision-making, leveraging real-time insights for strategic planning.
- Lead in innovative practices such as AI-driven virtual tours and automated investment analysis, creating significant competitive advantages.
### Current Tier Contextualization
As an Enabler, your agency stands out by using AI in diverse applications and regular data management practices. To reach Leader status, focus on enhancing CRM maturity, optimizing governance frameworks, and increasing satisfaction with analytics tools. Target a 30-50% revenue growth through advanced AI and integrate AI in strategic decision-making to maintain a competitive edge.
## Your Personalized AI Learning Path
1. **Advanced AI Data Integration Techniques:**
    - Explore advanced data integration methods to enhance data consistency and accessibility across systems.
    - This will be vital for improving AI-driven insights and operational decision-making.
2. **AI-Driven CRM Enhancement Strategies:**
    - Study best practices in AI-driven CRM to elevate client interaction and retention.
    - Focus on personalization and predictive analytics to anticipate client needs and enhance experiences.
3. **AI Governance Framework Development:**
    - Delve into establishing robust governance frameworks that ensure ethical and compliant AI use.
    - Prioritize developing comprehensive measurement metrics for continuous improvement.
This report concludes here.`
};
// --- END OF SCORECARD_DEBUG_DATA ---

export async function GET(request: NextRequest) {
    try {
        if (!SCORECARD_DEBUG_DATA || !SCORECARD_DEBUG_DATA.FullReportMarkdown) { // Basic check
             return new NextResponse("Error: SCORECARD_DEBUG_DATA is not fully defined in the API route.", { status: 500, headers: { 'Content-Type': 'text/html' } });
        }
        const htmlString = generateScorecardHTMLv5(SCORECARD_DEBUG_DATA);
        return new NextResponse(htmlString, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });
    } catch (error: any) {
        console.error("Error generating HTML for preview:", error);
        return new NextResponse(`<html><body><h1>Error Generating HTML Preview</h1><pre>${error.message}</pre><pre>${error.stack}</pre></body></html>`, { status: 500, headers: { 'Content-Type': 'text/html' } });
    }
} 