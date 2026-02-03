const express = require('express');
const { query, param } = require('express-validator');
const {
  getJobs,
  getJob,
  searchJobs,
  matchResumeToJobs,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const searchValidation = [
  query('q').optional().isString().trim(),
  query('location').optional().isString().trim(),
  query('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  query('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'executive'])
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

// Public routes
router.get('/search', searchValidation, searchJobs);
router.get('/', paginationValidation, getJobs);
router.get('/:id', getJob);

// Protected routes
router.use(protect);
router.post('/match/:resumeId', [
  param('resumeId').isMongoId().withMessage('Invalid resume ID')
], matchResumeToJobs);

// Admin routes (in production, add admin middleware)
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
