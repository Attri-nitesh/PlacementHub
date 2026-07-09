const RecruiterProfile = require('../models/RecruiterProfile');
const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const Notification = require('../models/Notification');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { emitSocketNotification } = require('../config/socket');
const { sendEmail } = require('../config/mailer');
const { statusTemplate } = require('../utils/emailTemplates');

// @desc    Get recruiter company profile
// @route   GET /api/recruiters/profile
// @access  Protected (Recruiter)
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await RecruiterProfile.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Update recruiter company profile
// @route   PUT /api/recruiters/profile
// @access  Protected (Recruiter)
exports.updateProfile = async (req, res, next) => {
  try {
    const { companyName, website, industry, about } = req.body;
    let profile = await RecruiterProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await RecruiterProfile.create({
        user: req.user.id,
        companyName,
        website,
        industry,
        about
      });
    } else {
      profile.companyName = companyName !== undefined ? companyName : profile.companyName;
      profile.website = website !== undefined ? website : profile.website;
      profile.industry = industry !== undefined ? industry : profile.industry;
      profile.about = about !== undefined ? about : profile.about;
      await profile.save();
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applicants for recruiter's jobs
// @route   GET /api/recruiters/applicants/:driveId
// @access  Protected (Recruiter)
exports.getApplicantsForDrive = async (req, res, next) => {
  try {
    const driveId = req.params.driveId;

    // Verify drive belongs to this recruiter
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    // Admins can see all drives, recruiters can only see their own drives
    if (req.user.role !== 'admin' && drive.createdByUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this drive' });
    }

    const applicants = await Application.find({ drive: driveId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    // Join with student profiles to get CGPA and branch
    const structuredApplicants = await Promise.all(
      applicants.map(async (app) => {
        const studentProfile = await StudentProfile.findOne({ user: app.student._id });
        return {
          _id: app._id,
          student: app.student,
          drive: app.drive,
          platform: app.platform,
          applicationDate: app.applicationDate,
          status: app.status,
          resumeUrl: app.resumeUrl || (studentProfile ? studentProfile.resumeUrl : ''),
          feedback: app.feedback,
          cgpa: studentProfile ? studentProfile.cgpa : 0,
          branch: studentProfile ? studentProfile.branch : 'N/A',
          skills: studentProfile ? studentProfile.skills : []
        };
      })
    );

    res.status(200).json({ success: true, data: structuredApplicants });
  } catch (err) {
    next(err);
  }
};

// @desc    Shortlist / Update applicant status
// @route   PUT /api/recruiters/applicants/:applicationId
// @access  Protected (Recruiter)
exports.updateApplicantStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    
    const validStatuses = ['Applied', 'Online Assessment', 'Interview', 'Offer', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.applicationId)
      .populate('drive')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify drive authorization
    const drive = await PlacementDrive.findById(application.drive._id);
    if (req.user.role !== 'admin' && drive.createdByUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this application' });
    }

    application.status = status;
    if (feedback !== undefined) {
      application.feedback = feedback;
    }
    await application.save();

    // Create In-App Notification
    const notif = await Notification.create({
      recipient: application.student._id,
      title: `Application Update: ${drive.companyName}`,
      message: `Your application status for ${drive.companyName} (${drive.jobRole}) has been updated to "${status}".`,
      type: 'status_update'
    });

    // Real-time notification using Socket.io
    emitSocketNotification(application.student._id, 'status_update', {
      notificationId: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      status: status,
      applicationId: application._id,
      driveId: drive._id
    });

    // Recruiter Shortlisting specific notification
    if (status === 'Interview' || status === 'Online Assessment') {
      emitSocketNotification(application.student._id, 'shortlist_notification', {
        title: `Shortlisted!`,
        message: `Congratulations! You have been shortlisted for ${drive.companyName} - ${drive.jobRole}. Next step: ${status}.`
      });
    }

    // Send Email notification
    await sendEmail({
      to: application.student.email,
      subject: `PlacementHub Application Status: ${drive.companyName}`,
      html: statusTemplate(application.student.name, drive, status)
    });

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};
