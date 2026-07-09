const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const Notification = require('../models/Notification');
const { emitSocketNotification } = require('../config/socket');
const { sendEmail } = require('../config/mailer');
const { statusTemplate } = require('../utils/emailTemplates');

// @desc    Update application status (used by Kanban drag-and-drop or Recruiter panel)
// @route   PUT /api/applications/:id/status
// @access  Protected
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const validStatuses = ['Applied', 'Online Assessment', 'Interview', 'Offer', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status value' });
    }

    const application = await Application.findById(req.params.id)
      .populate('drive')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const drive = await PlacementDrive.findById(application.drive._id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Associated drive not found' });
    }

    // Auth verification: Student owner, drive recruiter owner, or admin
    const isStudentOwner = application.student._id.toString() === req.user.id;
    const isRecruiterOwner = drive.createdByUser.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isRecruiterOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update status for this application' });
    }

    application.status = status;
    if (feedback !== undefined) {
      application.feedback = feedback;
    }
    await application.save();

    // If updated by Recruiter or Admin, trigger notifications to the Student
    if (!isStudentOwner) {
      const notif = await Notification.create({
        recipient: application.student._id,
        title: `Status Changed: ${drive.companyName}`,
        message: `Your application status for ${drive.companyName} (${drive.jobRole}) has been updated to "${status}".`,
        type: 'status_update'
      });

      // Send Socket alert
      emitSocketNotification(application.student._id, 'status_update', {
        notificationId: notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        status: status,
        applicationId: application._id,
        driveId: drive._id
      });

      // Send status update email
      await sendEmail({
        to: application.student.email,
        subject: `PlacementHub status update for ${drive.companyName}`,
        html: statusTemplate(application.student.name, drive, status)
      });
    }

    res.status(200).json({ success: true, message: 'Application status updated successfully', data: application });
  } catch (err) {
    next(err);
  }
};
