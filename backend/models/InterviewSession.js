const mongoose = require('mongoose');

const InterviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    default: 'mid-level'
  },
  questions: [{
    question: String,
    answer: String,
    feedback: String,
    score: Number,
    category: String
  }],
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema);
