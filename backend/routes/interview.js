const express = require('express');
const {
  generateQuestions,
  getFeedback,
  startPracticeSession,
  submitAnswer
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/interview/generate-questions
// @desc    Generate interview questions based on job role
// @access  Private
router.post('/generate-questions', protect, generateQuestions);

// @route   POST /api/interview/feedback
// @desc    Get AI feedback on interview answers
// @access  Private
router.post('/feedback', protect, getFeedback);

// @route   POST /api/interview/practice-session
// @desc    Start a practice interview session
// @access  Private
router.post('/practice-session', protect, startPracticeSession);

// @route   POST /api/interview/submit-answer
// @desc    Submit answer for practice session
// @access  Private
router.post('/submit-answer', protect, submitAnswer);

module.exports = router;
