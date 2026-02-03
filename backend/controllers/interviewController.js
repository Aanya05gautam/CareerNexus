const aiService = require('../services/aiService');

// @desc    Generate interview questions
// @route   POST /api/interview/generate-questions
// @access  Private
const generateQuestions = async (req, res) => {
  try {
    const { jobRole, experienceLevel, questionCount = 5 } = req.body;

    if (!jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required'
      });
    }

    const questions = await aiService.generateInterviewQuestions(jobRole, experienceLevel);

    // Return requested number of questions
    const selectedQuestions = questions.slice(0, questionCount);

    res.json({
      success: true,
      data: {
        questions: selectedQuestions,
        jobRole,
        experienceLevel: experienceLevel || 'mid-level',
        count: selectedQuestions.length
      }
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate interview questions'
    });
  }
};

// @desc    Get feedback on interview answer
// @route   POST /api/interview/feedback
// @access  Private
const getFeedback = async (req, res) => {
  try {
    const { question, answer, jobRole } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    const feedback = await aiService.evaluateAnswer(question, answer, jobRole);

    res.json({
      success: true,
      data: {
        feedback,
        question,
        answer,
        jobRole
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview feedback'
    });
  }
};

const InterviewSession = require('../models/InterviewSession');

// @desc    Start practice interview session
// @route   POST /api/interview/practice-session
// @access  Private
const startPracticeSession = async (req, res) => {
  try {
    const { jobRole, experienceLevel, questionCount = 5 } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required'
      });
    }

    const questions = await aiService.generateInterviewQuestions(jobRole, experienceLevel);
    const selectedQuestions = questions.slice(0, questionCount);

    // Save to database
    const session = await InterviewSession.create({
      user: userId,
      jobRole,
      experienceLevel: experienceLevel || 'mid-level',
      questions: selectedQuestions.map(q => ({
        question: q.question,
        category: q.category
      })),
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        jobRole,
        experienceLevel: session.experienceLevel,
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length,
        currentQuestion: 0,
        startedAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Start practice session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start practice session'
    });
  }
};

// @desc    Submit answer for practice session
// @route   POST /api/interview/submit-answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, answer, question } = req.body;

    if (!sessionId || questionIndex === undefined || !answer || !question) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, question index, answer, and question are required'
      });
    }

    const feedback = await aiService.evaluateAnswer(question, answer);
    
    // Mock score calculation (should ideally be done by AI)
    const score = Math.floor(Math.random() * (95 - 60 + 1)) + 60;

    // Update session in database
    await InterviewSession.findOneAndUpdate(
      { _id: sessionId, "questions.question": question }, // Simple match by question text
      { 
        $set: { 
          "questions.$.answer": answer,
          "questions.$.feedback": feedback,
          "questions.$.score": score
        } 
      }
    );

    res.json({
      success: true,
      data: {
        sessionId,
        questionIndex,
        answer,
        feedback,
        score,
        submittedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer'
    });
  }
};

module.exports = {
  generateQuestions,
  getFeedback,
  startPracticeSession,
  submitAnswer,
};
