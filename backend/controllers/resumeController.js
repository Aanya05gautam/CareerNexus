const Resume = require('../models/Resume');
const aiService = require('../services/aiService');
const pdf = require('pdf-parse');
const fs = require('fs');

// @desc    Upload resume file and extract text
// @route   POST /api/resumes/upload
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const filePath = req.file.path;
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else {
      // Handle txt files
      extractedText = fs.readFileSync(filePath, 'utf8');
    }

    // Clean up temporary file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      data: {
        content: extractedText,
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    next(error);
  }
};

// @desc    Get all resumes for logged in user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resume'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
exports.createResume = async (req, res, next) => {
  try {
    const resumeData = {
      ...req.body,
      user: req.user.id
    };

    const resume = await Resume.create(resumeData);

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this resume'
      });
    }

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this resume'
      });
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Modularized AI analysis logic
const performAIAnalysis = async (resumeContent) => {
  try {
    return await aiService.analyzeResume(resumeContent);
  } catch (error) {
    console.error('Inner AI Analysis Error:', error);
    throw error; // Preserve the specific error message
  }
};

// @desc    Analyze resume with AI
// @route   POST /api/resumes/:id/analyze
// @access  Private
exports.analyzeResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Ensure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to analyze this resume'
      });
    }

    // Perform AI analysis
    const analysis = await performAIAnalysis(resume.content);

    // Update resume with analysis
    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      { aiAnalysis: analysis },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        analysis
      }
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getResumes: exports.getResumes,
  getResume: exports.getResume,
  createResume: exports.createResume,
  updateResume: exports.updateResume,
  deleteResume: exports.deleteResume,
  analyzeResume: exports.analyzeResume,
  uploadResume: exports.uploadResume
};
