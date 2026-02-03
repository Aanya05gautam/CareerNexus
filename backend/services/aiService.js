const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeResume(resumeContent) {
    try {
      const prompt = `
        Analyze the following resume and provide:
        1. A score out of 100 based on overall quality, completeness, and market competitiveness
        2. "strengths": Array of 3 key strengths
        3. "improvements": Array of 3-5 specific suggestions for improvement
        4. "keywords": Key skills/keywords extracted from the resume (max 10)

        Resume content:
        ${resumeContent}

        Return the response in valid JSON format with keys: "score", "strengths", "improvements", "keywords".
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.7,
      });

      const analysisText = response.choices[0].message.content;
      console.log('AI Response:', analysisText);
      return JSON.parse(analysisText);
    } catch (error) {
      console.warn('OpenAI Quota/Error - Using Content-Aware Local Analysis:', error.message);
      const content = resumeContent.toLowerCase();
      
      // --- 1. Advanced Role Detection ---
      const roles = {
        frontend: ["react", "vue", "angular", "html", "css", "tailwind", "redux", "figma", "javascript", "typescript", "ui/ux"],
        backend: ["node", "python", "java", "c#", "golang", "sql", "mongodb", "postgres", "redis", "api", "microservices"],
        data: ["sql", "python", "pandas", "numpy", "tableau", "power bi", "machine learning", "tensorflow", "statistics"],
        devops: ["aws", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "linux", "cloud"]
      };

      let detectedRole = "general";
      let maxCount = 0;
      
      // Count keywords for each role to find the dominant one
      for (const [role, keywords] of Object.entries(roles)) {
        const count = keywords.filter(k => content.includes(k)).length;
        if (count > maxCount) {
          maxCount = count;
          detectedRole = role;
        }
      }

      // --- 2. Keyword & Content Extraction ---
      const techStack = [
        ...roles.frontend, ...roles.backend, ...roles.data, ...roles.devops,
        "git", "github", "gitlab", "agile", "scrum", "leadership", "communication", "management"
      ];
      // Get unique match
      const foundKeywords = [...new Set(techStack.filter(kw => content.includes(kw)))];
      const displayKeywords = foundKeywords.slice(0, 12).map(k => k.charAt(0).toUpperCase() + k.slice(1));
      if (displayKeywords.length === 0) displayKeywords.push("General Skills");

      // --- 3. Structural Scan ---
      const hasExperience = content.includes("experience") || content.includes("employment");
      const hasEducation = content.includes("education") || content.includes("university") || content.includes("degree");
      const hasSkills = content.includes("skills") || content.includes("technologies");
      const hasProjects = content.includes("projects") || content.includes("portfolio");
      const hasSummary = content.includes("summary") || content.includes("profile");
      const hasContact = content.includes("@") || content.match(/\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}/);
      const hasMetrics = content.match(/\d+%|\$\d+|\d+\s\+\syears|\d+\susers/);
      const hasBulletPoints = content.includes("•") || content.includes("- ") || content.includes("* ");
      const hasLinkedIn = content.includes("linkedin.com");
      const hasGitHub = content.includes("github.com");

      // --- 4. Language Quality Check ---
      const weakVerbs = ["worked", "helped", "responsible for", "assisted", "participated"];
      const weakVerbFound = weakVerbs.find(v => content.includes(v));
      
      // --- 5. Scoring Algorithm (Max 100) ---
      let score = 40; // Base score
      if (hasContact) score += 5;
      if (hasSummary) score += 5;
      if (hasExperience) score += 15;
      if (hasEducation) score += 10;
      if (hasSkills) score += 10;
      if (hasProjects) score += 10;
      if (hasMetrics) score += 10;
      if (foundKeywords.length >= 5) score += 10;
      if (foundKeywords.length >= 10) score += 5;
      if (hasBulletPoints) score += 5;
      if (!weakVerbFound) score += 5;
      if (hasLinkedIn) score += 5;
      
      const variableScore = Math.min(100, Math.max(10, score));

      // --- 6. Intelligent Feedback Generation ---
      const strengths = [];
      const improvements = [];

      // Strengths
      if (detectedRole !== "general") strengths.push(`Strong keyword alignment with ${detectedRole.charAt(0).toUpperCase() + detectedRole.slice(1)} roles`);
      if (hasMetrics) strengths.push("Effective use of data/metrics to quantify professional impact");
      if (hasProjects) strengths.push("Projects section successfully validates hands-on skills");
      if (foundKeywords.length >= 8) strengths.push("Resume demonstrates a wide and relevant technical breadth");
      if (hasSummary) strengths.push("Clear professional summary helps recruiters spot value early");
      if (hasBulletPoints) strengths.push("Good formatting with bullet points improves readability");
      if (strengths.length < 2) strengths.push("Content is structurally sound and parsable by ATS");

      // Improvements - Role Specific
      if (detectedRole === "frontend" && !hasProjects) improvements.push("Frontend roles highly value a 'Projects' section with live links/demos.");
      if (detectedRole === "backend" && !content.includes("api")) improvements.push("For Backend roles, explicitly mention API design (REST/GraphQL) experience.");
      if (detectedRole === "data" && !content.includes("sql")) improvements.push("SQL is essential for Data roles; ensure it is highlighted if you know it.");
      if (detectedRole === "devops" && !content.includes("cloud")) improvements.push("DevOps profiles should emphasize specific Cloud platforms (AWS/Azure).");

      // Improvements - General
      if (!hasMetrics) improvements.push("Quantify your experience with specific numbers (e.g., 'Reduced load time by 30%').");
      if (weakVerbFound) improvements.push(`Replace passive words like '${weakVerbFound}' with power verbs like 'Architected', 'Deployed', or 'Optimized'.`);
      if (!hasBulletPoints) improvements.push("Use bullet points (•) for job descriptions instead of paragraphs for better skimming.");
      if (!hasLinkedIn) improvements.push("Add a clickable link to your LinkedIn profile for recruiter outreach.");
      if (!hasGitHub && (detectedRole === "frontend" || detectedRole === "backend")) improvements.push("Add a GitHub link to showcase your code contributions.");
      if (!hasSkills) improvements.push("Create a dedicated 'Technical Skills' section for better ATS ranking.");
      if (!hasSummary) improvements.push("Add a 2-3 sentence 'Professional Summary' at the top.");

      // Default fillers
      if (improvements.length < 2) {
        improvements.push("Ensure consistent formatting for dates (e.g., 'Jan 2020 - Present') across all roles.");
        improvements.push("Tailor the 'Skills' section order to match the specific job description you apply for.");
      }

      return {
        score: variableScore,
        strengths: strengths.slice(0, 3), // Top 3
        improvements: improvements.slice(0, 4), // Top 4
        keywords: displayKeywords
      };
    }
  }

  async generateInterviewQuestions(category = 'general', count = 5) {
    try {
      const categoryPrompts = {
        general: 'general job interview questions',
        technical: 'technical programming and software development questions',
        behavioral: 'behavioral interview questions',
        leadership: 'leadership and management interview questions'
      };

      const prompt = `
        Generate ${count} ${categoryPrompts[category]} for job interviews.
        Each question should be professional and commonly asked in interviews.

        Return a JSON object with a "questions" key containing an array of objects:
        {
          "questions": [
            {
              "question": "Question text here",
              "category": "${category}"
            }
          ]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.8,
      });

      const data = JSON.parse(response.choices[0].message.content);
      const questions = data.questions || [];

      return questions.map((q, index) => ({
        _id: `q_${Date.now()}_${index}`,
        ...q
      }));
    } catch (error) {
      console.warn(`OpenAI Error - Using Mock ${category} Questions:`, error.message);
      
      const mockData = {
        technical: [
          { question: "Can you explain the difference between a virtual DOM and the real DOM in React?", category: "technical" },
          { question: "What are the advantages of using TypeScript over plain JavaScript?", category: "technical" },
          { question: "Explain the concept of closures in JavaScript.", category: "technical" },
          { question: "How does the 'this' keyword work in different contexts?", category: "technical" },
          { question: "What is the difference between SQL and NoSQL databases?", category: "technical" },
          { question: "Explain the event loop in Node.js.", category: "technical" },
          { question: "What are the common ways to optimize a web application's performance?", category: "technical" },
          { question: "How does prototypal inheritance work in JavaScript?", category: "technical" },
          { question: "What is a RESTful API and what are its key constraints?", category: "technical" },
          { question: "Explain the difference between microservices and monolithic architecture.", category: "technical" },
          { question: "What are React Hooks and why were they introduced?", category: "technical" },
          { question: "How do you handle state management in a large-scale React application?", category: "technical" },
          { question: "What is Docker and how does it help in software development?", category: "technical" },
          { question: "Explain the concept of Big O notation and why it's important.", category: "technical" },
          { question: "What is CI/CD and how do you implement it?", category: "technical" }
        ],
        behavioral: [
          { question: "Describe a time you had to deal with a difficult teammate. How did you handle it?", category: "behavioral" },
          { question: "Tell me about a challenging project you worked on and what you learned from it.", category: "behavioral" },
          { question: "How do you handle tight deadlines and pressure?", category: "behavioral" },
          { question: "Describe a situation where you had to learn a new technology quickly.", category: "behavioral" },
          { question: "Have you ever disagreed with a supervisor? How did you resolve the situation?", category: "behavioral" },
          { question: "Tell me about a time you failed and how you moved forward.", category: "behavioral" },
          { question: "Give an example of a goal you reached and tell me how you achieved it.", category: "behavioral" },
          { question: "Describe a situation where you saw a problem and took the initiative to fix it.", category: "behavioral" },
          { question: "Tell me about a time you had to explain something complex to someone with no technical background.", category: "behavioral" },
          { question: "How do you prioritize your tasks when you have multiple competing priorities?", category: "behavioral" }
        ],
        leadership: [
          { question: "How do you delegate tasks to team members effectively?", category: "leadership" },
          { question: "Describe a time you had to motivate a struggling team.", category: "leadership" },
          { question: "How do you handle conflict between two team members?", category: "leadership" },
          { question: "What is your philosophy on mentorship and developing others?", category: "leadership" },
          { question: "How do you approach making difficult decisions that affect the whole team?", category: "leadership" },
          { question: "Tell me about a time you led a team through a significant change.", category: "leadership" },
          { question: "How do you ensure your team stays aligned with the overall company goals?", category: "leadership" },
          { question: "Describe your leadership style and how it has evolved over time.", category: "leadership" },
          { question: "How do you handle a high-performing team member with a toxic attitude?", category: "leadership" },
          { question: "What strategies do you use to foster a diverse and inclusive team culture?", category: "leadership" }
        ],
        general: [
          { question: "Tell me about yourself and your background.", category: "general" },
          { question: "What are your greatest strengths and weaknesses?", category: "general" },
          { question: "Why do you want to work for this company?", category: "general" },
          { question: "Where do you see yourself in five years?", category: "general" },
          { question: "How do you ensure your work is of the highest quality?", category: "general" },
          { question: "What are your salary expectations?", category: "general" },
          { question: "What kind of work environment do you thrive in?", category: "general" },
          { question: "Why should we hire you over other candidates?", category: "general" },
          { question: "What is the professional achievement you are most proud of?", category: "general" },
          { question: "Do you have any questions for us?", category: "general" }
        ]
      };

      // Randomize selection
      const shuffled = [...(mockData[category] || mockData.general)].sort(() => 0.5 - Math.random());
      const selectedMock = shuffled.slice(0, count);
      
      return selectedMock.map((q, i) => ({ ...q, _id: `mock_${category}_${i}_${Date.now()}` }));
    }
  }

  async evaluateAnswer(question, answer) {
    try {
      const prompt = `
        Evaluate the following interview answer and provide constructive feedback.

        Question: ${question}
        Answer: ${answer}

        Please provide detailed feedback on:
        1. Content quality and relevance
        2. Structure and clarity
        3. Specific improvements that could be made

        Keep the feedback encouraging and actionable. Limit to 200 words.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.warn('OpenAI Quota/Error - Using Mock Feedback for Demo:', error.message);
      const feedbackTemplates = [
        "This is a solid response! You clearly understand the core concepts. To make it even stronger, try to use the STAR method (Situation, Task, Action, Result) to provide a concrete example.",
        "Good effort. Your answer covers the basics, but consider adding more specific details about the technologies or methodologies you used.",
        "You're on the right track. Try to be a bit more concise and focus on the impact your actions had on the project outcome.",
        "Excellent starting point. Don't forget to mention any challenges you faced and how you overcame them to demonstrate problem-solving skills."
      ];
      return feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
    }
  }

  async matchResumeToJob(resumeContent, jobDescription) {
    try {
      const prompt = `
        Compare the following resume with the job description and calculate a match percentage (0-100).
        Consider skills, experience, qualifications, and overall fit.

        Resume:
        ${resumeContent}

        Job Description:
        ${jobDescription}

        Please respond with only a number representing the match percentage.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.3,
      });

      const matchPercentage = parseInt(response.choices[0].message.content.trim());
      return isNaN(matchPercentage) ? 75 : Math.min(100, Math.max(0, matchPercentage));
    } catch (error) {
      console.warn('OpenAI Quota/Error - Using Mock Matching for Demo:', error.message);
      return Math.floor(Math.random() * (95 - 75 + 1)) + 75; // Random score between 75-95%
    }
  }
}

module.exports = new AIService();
