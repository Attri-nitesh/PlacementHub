const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitSocketNotification } = require('../config/socket');
const { sendEmail } = require('../config/mailer');
const { newDriveTemplate } = require('../utils/emailTemplates');

// @desc    Create a new placement drive
// @route   POST /api/drives
// @access  Protected (Admin / Recruiter)
exports.createDrive = async (req, res, next) => {
  try {
    const { companyName, jobRole, package, location, eligibilityCgpa, deadline, description } = req.body;

    const drive = await PlacementDrive.create({
      companyName,
      jobRole,
      package,
      location,
      eligibilityCgpa,
      deadline,
      description,
      createdByUser: req.user.id
    });

    // Create In-App Notification (broadcast)
    const notif = await Notification.create({
      recipient: null, // null means global broadcast
      title: `New Placement Drive: ${companyName}`,
      message: `${companyName} is visiting campus for ${jobRole} with a package of ${package} LPA. Eligibility: Min CGPA ${eligibilityCgpa}.`,
      type: 'drive'
    });

    // Real-time broadcast to students
    emitSocketNotification(null, 'new_drive', {
      notificationId: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      driveId: drive._id,
      createdAt: notif.createdAt
    });

    // Nodemailer: Send Placement Drive Alert to all students
    const students = await User.find({ role: 'student' });
    for (const student of students) {
      sendEmail({
        to: student.email,
        subject: `Placement Drive Alert: ${companyName} is hiring!`,
        html: newDriveTemplate(student.name, drive)
      }).catch(err => console.error(`Failed to send drive alert email to ${student.email}:`, err.message));
    }

    res.status(201).json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all placement drives
// @route   GET /api/drives
// @access  Protected
exports.getDrives = async (req, res, next) => {
  try {
    // Sort drives so that upcoming deadlines show first
    const drives = await PlacementDrive.find().sort({ deadline: 1 });
    res.status(200).json({ success: true, data: drives });
  } catch (err) {
    next(err);
  }
};

// @desc    Get details of a single drive
// @route   GET /api/drives/:id
// @access  Protected
exports.getDriveById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }
    res.status(200).json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
};

// @desc    Update placement drive details
// @route   PUT /api/drives/:id
// @access  Protected (Admin / Recruiter Owner)
exports.updateDrive = async (req, res, next) => {
  try {
    let drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && drive.createdByUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this placement drive' });
    }

    drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel/delete placement drive
// @route   DELETE /api/drives/:id
// @access  Protected (Admin / Recruiter Owner)
exports.deleteDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && drive.createdByUser.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this placement drive' });
    }

    // Mark as cancelled instead of hard deleting
    drive.status = 'cancelled';
    await drive.save();

    res.status(200).json({ success: true, message: 'Placement drive successfully cancelled' });
  } catch (err) {
    next(err);
  }
};

// @desc    Student apply to a placement drive
// @route   POST /api/drives/:id/apply
// @access  Protected (Student)
exports.applyToDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    if (drive.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This placement drive is no longer active' });
    }

    // 1. Check application deadline
    if (new Date() > new Date(drive.deadline)) {
      return res.status(400).json({ success: false, message: 'The application deadline has passed' });
    }

    // 2. Fetch student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(400).json({ success: false, message: 'Please build your student profile before applying' });
    }

    // 3. Verify CGPA eligibility
    if (studentProfile.cgpa < drive.eligibilityCgpa) {
      return res.status(400).json({
        success: false,
        message: `Eligibility mismatch. Minimum CGPA required is ${drive.eligibilityCgpa}, but your profile CGPA is ${studentProfile.cgpa}.`
      });
    }

    // 4. Check for existing applications
    const existingApplication = await Application.findOne({
      student: req.user.id,
      drive: drive._id
    });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied to this drive' });
    }

    // 5. Create application record
    const application = await Application.create({
      student: req.user.id,
      drive: drive._id,
      resumeUrl: studentProfile.resumeUrl || ''
    });

    res.status(201).json({
      success: true,
      message: 'Successfully applied to the placement drive',
      data: application
    });
  } catch (err) {
    next(err);
  }
};
