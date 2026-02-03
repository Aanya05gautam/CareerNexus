const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  company: { // Inferring company might be needed, adding just in case or optional
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [5000, 'Description can not be more than 5000 characters']
  },
  requirements: {
    type: [String],
    required: [true, 'Please add requirements']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    default: 'entry'
  },
  salary: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for search
JobSchema.index({ title: 'text', description: 'text', requirements: 'text', location: 'text' });

module.exports = mongoose.model('Job', JobSchema);
