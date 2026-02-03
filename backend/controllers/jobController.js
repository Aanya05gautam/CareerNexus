const Job = require('../models/Job');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Job.countDocuments({ isActive: true });
    const jobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    res.status(200).json({
      success: true,
      count: jobs.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || !job.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search jobs
// @route   GET /api/jobs/search
// @access  Public
exports.searchJobs = async (req, res, next) => {
  try {
    const { q, location, jobType, experienceLevel } = req.query;

    let searchQuery = { isActive: true };

    // Text search
    if (q) {
      searchQuery.$text = { $search: q };
    }

    // Location filter
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (jobType) {
      searchQuery.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      searchQuery.experienceLevel = experienceLevel;
    }

    const jobs = await Job.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// Modularized job matching logic
const calculateMatchScores = async (resumeContent, jobs) => {
  const matchPromises = jobs.map(async (job) => {
    try {
      const matchScore = await aiService.matchResumeToJob(
        resumeContent,
        `${job.title} ${job.description} ${job.requirements.join(' ')}`
      );

      return {
        job: job.toObject(),
        matchScore
      };
    } catch (error) {
      console.error(`Error matching job ${job._id}:`, error);
      return {
        job: job.toObject(),
        matchScore: 0
      };
    }
  });

  return Promise.all(matchPromises);
};

// @desc    Match resume to jobs
// @route   POST /api/jobs/match/:resumeId
// @access  Private
exports.matchResumeToJobs = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Ensure user owns the resume
    if (resume.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resume'
      });
    }

    // Get all active jobs
    const jobs = await Job.find({ isActive: true }).limit(20);

    // Calculate match scores for each job
    const matches = await calculateMatchScores(resume.content, jobs);

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job (admin only - in production)
// @route   POST /api/jobs
// @access  Private/Admin
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job (admin only - in production)
// @route   PUT /api/jobs/:id
// @access  Private/Admin
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job (admin only - in production)
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Soft delete
    job.isActive = false;
    await job.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
