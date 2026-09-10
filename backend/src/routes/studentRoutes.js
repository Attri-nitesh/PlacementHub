const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizeStudent,
} = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getStudentProfile,
  updateStudentProfile,
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getCertifications,
  createCertification,
  deleteCertification,
  getResume,
  uploadResume,
  deleteResume,
  getApplications,
  createApplication,
  deleteApplication,
  getJobDrives,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  getStudentAnalytics,
  sendPhoneOtp,
  verifyPhoneOtp,
  getPhoneStatus,
} = require('../controllers/studentController');

// All routes require authenticated student role
router.use(authenticateUser);
router.use(authorizeStudent);

// Profile & Phone Verification
router.route('/profile').get(getStudentProfile).put(updateStudentProfile);
router.route('/send-phone-otp').post(sendPhoneOtp);
router.route('/verify-phone-otp').post(verifyPhoneOtp);
router.route('/phone-status').get(getPhoneStatus);

// Education
router.route('/education').get(getEducation).post(createEducation);
router.route('/education/:id').put(updateEducation).delete(deleteEducation);

// Projects
router.route('/projects').get(getProjects).post(createProject);
router.route('/projects/:id').put(updateProject).delete(deleteProject);

// Experiences
router.route('/experience').get(getExperiences).post(createExperience);
router.route('/experience/:id').put(updateExperience).delete(deleteExperience);

// Skills
router.route('/skills').get(getSkills).post(createSkill);
router.route('/skills/:id').put(updateSkill).delete(deleteSkill);

// Certifications
router.route('/certifications').get(getCertifications).post(createCertification);
router.route('/certifications/:id').delete(deleteCertification);

// Resume Management
router
  .route('/resume')
  .get(getResume)
  .post(upload.single('resume'), uploadResume)
  .delete(deleteResume);

// Applications (READ ONLY & SUBMIT ONLY - No stage update allowed for students)
router.route('/applications').get(getApplications).post(createApplication);
router.route('/applications/:id').delete(deleteApplication);

// Job Drives & Search
router.route('/drives').get(getJobDrives);

// Notifications
router.route('/notifications').get(getNotifications);
router.route('/notifications/read-all').put(markNotificationRead);
router.route('/notifications/:id').delete(deleteNotification);

// Analytics
router.route('/analytics').get(getStudentAnalytics);

module.exports = router;
