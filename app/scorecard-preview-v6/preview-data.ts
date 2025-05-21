/**
 * Sample data for testing the scorecard template
 */

export const sampleScoreCardData = {
  UserInformation: {
    Industry: "Technology",
    UserName: "John Smith",
    CompanyName: "Acme Technologies",
    Email: "john.smith@acmetech.com"
  },
  ScoreInformation: {
    AITier: "Leader",
    FinalScore: 85,
    ReportID: "SCR-2023-12345"
  },
  QuestionAnswerHistory: [
    {
      question: "What is your organization's primary industry?",
      answer: "Technology",
      phaseName: "Company Profile",
      answerType: "select",
      options: ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Other"]
    },
    {
      question: "How many employees work at your organization?",
      answer: "100-500",
      phaseName: "Company Profile",
      answerType: "radio",
      options: ["1-10", "11-50", "51-100", "100-500", "500+"]
    },
    {
      question: "Which AI technologies are currently in use at your organization?",
      answer: "Machine Learning|Natural Language Processing|Computer Vision",
      phaseName: "AI Implementation",
      reasoningText: "The company has implemented multiple AI technologies across different departments.",
      answerType: "checkbox",
      options: ["Machine Learning", "Natural Language Processing", "Computer Vision", "Robotics", "None"]
    },
    {
      question: "How would you rate your organization's AI maturity?",
      answer: "Advanced - AI is integrated into core business processes",
      phaseName: "AI Implementation",
      reasoningText: "Based on the implementation of multiple AI systems and integration with business processes.",
      answerType: "radio",
      options: ["Beginner - Just starting to explore AI", "Intermediate - Some AI projects implemented", "Advanced - AI is integrated into core business processes", "Expert - AI-driven organization"]
    },
    {
      question: "What are your organization's primary goals for AI implementation?",
      answer: "Increasing operational efficiency and reducing costs are the main drivers for our AI initiatives. We're also looking to improve customer experience through personalization.",
      phaseName: "Strategy",
      reasoningText: "The focus on efficiency and customer experience aligns with industry trends.",
      answerType: "text"
    },
    {
      question: "Does your organization have a dedicated AI team or department?",
      answer: "Yes",
      phaseName: "Resources",
      answerType: "radio",
      options: ["Yes", "No", "In development"]
    },
    {
      question: "What challenges has your organization faced with AI implementation?",
      answer: "Data quality issues|Integration with existing systems|Talent acquisition",
      phaseName: "Challenges",
      reasoningText: "These are common challenges in the technology sector, particularly for mid-sized companies.",
      answerType: "checkbox",
      options: ["Data quality issues", "Integration with existing systems", "Talent acquisition", "Budget constraints", "Regulatory compliance", "Change management"]
    }
  ],
  FullReportMarkdown: `# AI Efficiency Scorecard for Acme Technologies

Based on our comprehensive assessment, Acme Technologies demonstrates strong AI capabilities and strategic implementation across multiple business areas. As a technology company, you're positioned well in the "Leader" tier with significant opportunities to further leverage AI for competitive advantage.

## Key Findings

**Strengths:**

- Strong technical foundation with multiple AI technologies already implemented
- Clear strategic alignment between AI initiatives and business objectives
- Dedicated AI team with specialized expertise
- Advanced data infrastructure supporting AI operations
- Executive leadership support for AI initiatives

**Weaknesses:**

- Data quality issues affecting model performance
- Integration challenges with legacy systems
- Talent acquisition and retention in competitive market
- Limited standardization of AI development processes
- Incomplete ROI measurement framework for AI projects

## Strategic Action Plan

### Short-term Actions (0-6 months)

1. Implement a data quality framework focused on addressing the identified issues in customer and operational datasets
2. Develop standardized documentation for AI model development, testing, and deployment
3. Create an AI skills development program for existing technical staff
4. Establish clear KPIs for measuring AI project success aligned with business outcomes

### Medium-term Actions (6-12 months)

1. Develop an API-first strategy for AI integration with existing systems
2. Implement a centralized model monitoring system for all production AI applications
3. Create a cross-functional AI governance committee with representatives from IT, legal, and business units
4. Expand AI capabilities to include predictive analytics for customer behavior

### Long-term Actions (12-24 months)

1. Develop an AI innovation lab to explore emerging technologies
2. Implement organization-wide AI literacy program
3. Explore strategic partnerships with AI research institutions
4. Develop a comprehensive ethical AI framework

## Technology Infrastructure Assessment

Your current technology stack provides a solid foundation for AI implementation. The cloud-based infrastructure offers the necessary scalability, while your data lake architecture supports the diverse data needs of advanced AI applications.

Key recommendations:
- Enhance real-time data processing capabilities
- Implement automated ML pipeline monitoring
- Upgrade data governance tools to address quality issues
- Consider containerization for improved model deployment

## Getting Started & Resources

To begin implementing the strategic action plan, we recommend:

1. **Data Quality Initiative**: Start with the [Data Quality Framework Template](https://example.com/resources/dq-framework) to assess and address your most critical data issues.

2. **AI Documentation**: Use our [AI Project Documentation Standards](https://example.com/resources/ai-docs) to create consistent processes.

3. **Skills Development**: Access the [AI Skills Matrix](https://example.com/resources/skills-matrix) to identify gaps and training opportunities.

4. **KPI Development**: Review the [AI ROI Measurement Guide](https://example.com/resources/ai-roi) to establish appropriate metrics.

Our team is available for implementation support and quarterly progress reviews.`
};

export default sampleScoreCardData; 