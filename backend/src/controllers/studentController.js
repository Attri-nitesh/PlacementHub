const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Protected (Student)
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update student profile
// @route   PUT /api/students/profile
// @access  Protected (Student)
exports.updateProfile = async (req, res, next) => {
  try {
    const { cgpa, skills, education, resumeUrl, contact, branch } = req.body;
    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user.id,
        cgpa,
        skills,
        education,
        resumeUrl,
        contact,
        branch
      });
    } else {
      profile.cgpa = cgpa !== undefined ? cgpa : profile.cgpa;
      profile.skills = skills !== undefined ? skills : profile.skills;
      profile.education = education !== undefined ? education : profile.education;
      profile.resumeUrl = resumeUrl !== undefined ? resumeUrl : profile.resumeUrl;
      profile.contact = contact !== undefined ? contact : profile.contact;
      profile.branch = branch !== undefined ? branch : profile.branch;
      await profile.save();
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student applications
// @route   GET /api/students/applications
// @access  Protected (Student)
exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('drive')
      .populate('student', 'name email');
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};
