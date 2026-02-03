const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  analyzeResume,
  uploadResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|txt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and TXT files are allowed'));
  }
});

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);

// Validation rules
const resumeValidation = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Resume content must be between 10 and 10,000 characters')
];

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(getResumes)
  .post(resumeValidation, createResume);

router
  .route('/:id')
  .get(getResume)
  .put(resumeValidation, updateResume)
  .delete(deleteResume);

router.post('/:id/analyze', analyzeResume);

module.exports = router;
