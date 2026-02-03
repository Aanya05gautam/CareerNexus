const Resume = require('../models/Resume');
const Job = require('../models/Job');
const InterviewSession = require('../models/InterviewSession');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;

    // Fetch counts
    const resumesCount = await Resume.countDocuments({ user: userId });
    const interviewsCount = await InterviewSession.countDocuments({ user: userId });
    
    // Recent activity (Last 5 items across models)
    const recentResumes = await Resume.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3);
      
    const recentInterviews = await InterviewSession.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3);

    // Combine and sort activities
    const activities = [
      ...recentResumes.map(r => ({
        type: 'resume',
        title: `Resume: ${r.title || 'Untitled'}`,
        time: r.createdAt,
        id: r._id
      })),
      ...recentInterviews.map(i => ({
        type: 'interview',
        title: `Mock Interview: ${i.jobRole}`,
        time: i.createdAt,
        id: i._id
      }))
    ].sort((a, b) => b.time - a.time).slice(0, 5);

    // Monthly trend data (mocked based on actual total counts for now)
    const chartData = [
      { name: 'Sep', resumes: 0, interviews: 0 },
      { name: 'Oct', resumes: Math.max(0, resumesCount - 2), interviews: Math.max(0, interviewsCount - 5) },
      { name: 'Nov', resumes: Math.max(0, resumesCount - 1), interviews: Math.max(0, interviewsCount - 2) },
      { name: 'Dec', resumes: resumesCount, interviews: interviewsCount },
    ];

    // Skill status (mocked based on user profile if available, or static for demo)
    const skillStats = [
      { subject: 'Technical', A: 85, fullMark: 100 },
      { subject: 'Communication', A: 70, fullMark: 100 },
      { subject: 'Strategy', A: 90, fullMark: 100 },
      { subject: 'Experience', A: 65, fullMark: 100 },
      { subject: 'ATS Score', A: 80, fullMark: 100 },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          resumesCreated: resumesCount,
          interviewsPracticed: interviewsCount,
          jobsApplied: 0,
          profileCompleteness: 85
        },
        chartData,
        skillStats,
        recentActivity: activities
      }
    });
  } catch (error) {
    next(error);
  }
};
