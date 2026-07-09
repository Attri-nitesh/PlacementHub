const Application = require('../models/Application');
const Notification = require('../models/Notification');
const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');
const { emitSocketNotification } = require('../config/socket');

// @desc    Get all applications across all placement drives
// @route   GET /api/admin/applicants
// @access  Protected (Admin)
exports.getAllApplicants = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name email')
      .populate('drive')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject student application
// @route   PUT /api/admin/applications/:id/approve
// @access  Protected (Admin)
exports.approveOrRejectApplication = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Specify approve or reject.' });
    }

    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('drive');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (action === 'approve') {
      application.status = 'Applied'; // Forwarded to recruiter
    } else {
      application.status = 'Rejected';
    }

    await application.save();

    // Create Notification for the student
    const notif = await Notification.create({
      recipient: application.student._id,
      title: `Admin Action: ${application.drive.companyName}`,
      message: `Your application registration for ${application.drive.companyName} (${application.drive.jobRole}) has been ${action === 'approve' ? 'approved by Placement Cell Admin.' : 'rejected by Placement Cell Admin.'}`,
      type: 'status_update'
    });

    // Notify Student via Socket.io
    emitSocketNotification(application.student._id, 'status_update', {
      notificationId: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      status: application.status,
      applicationId: application._id,
      driveId: application.drive._id
    });

    res.status(200).json({ success: true, message: `Application successfully ${action}d`, data: application });
  } catch (err) {
    next(err);
  }
};

// @desc    Send custom notifications to all students or specific student
// @route   POST /api/admin/notifications
// @access  Protected (Admin)
exports.sendNotification = async (req, res, next) => {
  try {
    const { recipientId, title, message } = req.body;

    const notif = await Notification.create({
      recipient: recipientId || null, // null means broadcast to all
      title,
      message,
      type: 'system'
    });

    // Real-time emit
    emitSocketNotification(recipientId || null, 'new_notification', {
      notificationId: notif._id,
      title,
      message,
      type: notif.type,
      createdAt: notif.createdAt
    });

    res.status(201).json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
};
