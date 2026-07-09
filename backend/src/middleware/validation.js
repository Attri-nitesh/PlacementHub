const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const registerRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['student', 'recruiter', 'admin']).withMessage('Role must be student, recruiter, or admin')
];

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const driveRules = [
  body('companyName').notEmpty().withMessage('Company name is required').trim(),
  body('jobRole').notEmpty().withMessage('Job role is required').trim(),
  body('package').isFloat({ min: 0 }).withMessage('Package must be a valid positive number (LPA)'),
  body('location').notEmpty().withMessage('Location is required').trim(),
  body('eligibilityCgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA eligibility must be between 0 and 10'),
  body('deadline').isISO8601().toDate().withMessage('Deadline must be a valid ISO Date'),
  body('description').notEmpty().withMessage('Description is required').trim()
];

const studentProfileRules = [
  body('cgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('skills').isArray().withMessage('Skills must be an array of strings'),
  body('branch').notEmpty().withMessage('Branch is required').trim(),
  body('education').isArray().withMessage('Education details must be an array')
];

const recruiterProfileRules = [
  body('companyName').notEmpty().withMessage('Company name is required').trim(),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Website must be a valid URL')
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  driveRules,
  studentProfileRules,
  recruiterProfileRules
};
