const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePlacementCell,
} = require('../middleware/authMiddleware');
const {
  getPlacementDashboard,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getDrives,
  createDrive,
  updateDrive,
  updateDriveStatus,
  duplicateDrive,
  deleteDrive,
  getAllApplications,
  updateApplicationStage,
  getInterviews,
  scheduleInterview,
  getOffers,
  releaseOffer,
  rejectApplication,
  getAnnouncements,
  createAnnouncement,
  getStudentDirectory,
  exportPlacementReport,
  getPlacementAnalytics,
  getActivityLogs,
} = require('../controllers/placementController');

// All placement routes require authenticated 'placement' role
router.use(authenticateUser);
router.use(authorizePlacementCell);

// Dashboard
router.route('/dashboard').get(getPlacementDashboard);

// Companies CRUD
router.route('/companies').get(getCompanies).post(createCompany);
router.route('/companies/:id').put(updateCompany).delete(deleteCompany);

// Placement Drives Enterprise Lifecycle Management
router.route('/drives').get(getDrives).post(createDrive);
router.route('/drives/:id').put(updateDrive).delete(deleteDrive);
router.route('/drives/:id/status').put(updateDriveStatus);
router.route('/drives/:id/duplicate').post(duplicateDrive);

// Applications Review
router.route('/applications').get(getAllApplications);
router.route('/applications/:id/stage').put(updateApplicationStage);

// Interview Scheduler
router.route('/interviews').get(getInterviews).post(scheduleInterview);

// Offers & Rejections
router.route('/offers').get(getOffers).post(releaseOffer);
router.route('/applications/reject').post(rejectApplication);

// Announcements
router.route('/announcements').get(getAnnouncements).post(createAnnouncement);

// Student Directory & CSV Export
router.route('/students').get(getStudentDirectory);
router.route('/reports/export').get(exportPlacementReport);

// Analytics & Audit Logs
router.route('/analytics').get(getPlacementAnalytics);
router.route('/logs').get(getActivityLogs);

module.exports = router;
