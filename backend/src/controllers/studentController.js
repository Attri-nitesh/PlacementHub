const Profile = require('../models/Profile');
const Education = require('../models/Education');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Skill = require('../models/Skill');
const Certification = require('../models/Certification');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const JobDrive = require('../models/JobDrive');
const User = require('../models/User');
const { createAndSendNotification } = require('../services/notificationService');

// Helper to calculate Profile Completion & Placement Readiness Score
const calculateScores = async (userId) => {
  const profile = await Profile.findOne({ user: userId });
  const education = await Education.find({ user: userId });
  const projects = await Project.find({ user: userId });
  const skills = await Skill.find({ user: userId });
  const resume = await Resume.findOne({ user: userId });

  let completionPoints = 0;
  if (profile?.phone && profile?.dob && profile?.address) completionPoints += 20;
  if (profile?.cgpa && profile?.department) completionPoints += 20;
  if (profile?.codingProfiles?.github || profile?.codingProfiles?.linkedin) completionPoints += 15;
  if (education.length > 0) completionPoints += 15;
  if (projects.length > 0) completionPoints += 15;
  if (skills.length > 0) completionPoints += 10;
  if (resume) completionPoints += 5;

  const completionPercentage = Math.min(100, completionPoints);

  let readinessScore = 0;
  const weakAreas = [];
  const strongAreas = [];
  const recommendations = [];

  const cgpa = profile?.cgpa || 0;
  if (cgpa >= 8.5) {
    readinessScore += 30;
    strongAreas.push('High Academic CGPA (≥ 8.5)');
  } else if (cgpa >= 7.5) {
    readinessScore += 20;
    strongAreas.push('Solid Academic Standard (≥ 7.5 CGPA)');
  } else {
    readinessScore += 10;
    weakAreas.push('Academic CGPA below 7.5');
    recommendations.push('Aim to boost your semester GPA above 7.5 for top recruiter cutoffs.');
  }

  if (resume) {
    readinessScore += 20;
    strongAreas.push('ATS Verified Resume Uploaded');
  } else {
    weakAreas.push('No Resume Uploaded');
    recommendations.push('Upload an ATS-compliant PDF resume in the Resume Vault.');
  }

  if (projects.length >= 2) {
    readinessScore += 20;
    strongAreas.push(`Strong Project Portfolio (${projects.length} Projects)`);
  } else if (projects.length === 1) {
    readinessScore += 10;
    weakAreas.push('Only 1 Project Added');
    recommendations.push('Add at least 2 full-stack / domain projects with live URLs.');
  } else {
    weakAreas.push('No Projects Added');
    recommendations.push('Build and showcase at least 2 projects with GitHub repositories.');
  }

  if (skills.length >= 5) {
    readinessScore += 15;
    strongAreas.push(`Diverse Skill Matrix (${skills.length} Technical Skills)`);
  } else {
    weakAreas.push('Limited Skill Items');
    recommendations.push('Add core programming languages, frameworks, and databases to your profile.');
  }

  if (profile?.codingProfiles?.leetcode || profile?.codingProfiles?.github) {
    readinessScore += 15;
    strongAreas.push('Coding Profiles Linked (GitHub / LeetCode)');
  } else {
    weakAreas.push('Coding Profiles Missing');
    recommendations.push('Link your GitHub, LeetCode, or Codeforces handle for recruiter verification.');
  }

  const finalReadinessScore = Math.min(100, readinessScore);

  return {
    completionPercentage,
    readinessScore: finalReadinessScore,
    weakAreas,
    strongAreas,
    recommendations,
  };
};

// --- PROFILE ENDPOINTS ---
const getStudentProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
    }

    const scoreMetrics = await calculateScores(req.user._id);

    res.status(200).json({
      success: true,
      profile,
      user: req.user,
      metrics: scoreMetrics,
    });
  } catch (error) {
    next(error);
  }
};

const updateStudentProfile = async (req, res, next) => {
  try {
    const { name, phone, dob, gender, address, registrationNumber, department, branch, semester, cgpa, backlogs, codingProfiles, preferredRoles, preferredLocations, expectedPackage, workType } = req.body;

    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new Profile({ user: req.user._id });
    }

    if (phone !== undefined) profile.phone = phone;
    if (dob !== undefined) profile.dob = dob;
    if (gender !== undefined) profile.gender = gender;
    if (address !== undefined) profile.address = address;
    if (registrationNumber !== undefined) profile.registrationNumber = registrationNumber;
    if (department !== undefined) profile.department = department;
    if (branch !== undefined) profile.branch = branch;
    if (semester !== undefined) profile.semester = semester;
    if (cgpa !== undefined) profile.cgpa = cgpa;
    if (backlogs !== undefined) profile.backlogs = backlogs;
    if (codingProfiles !== undefined) profile.codingProfiles = codingProfiles;
    if (preferredRoles !== undefined) profile.preferredRoles = preferredRoles;
    if (preferredLocations !== undefined) profile.preferredLocations = preferredLocations;
    if (expectedPackage !== undefined) profile.expectedPackage = expectedPackage;
    if (workType !== undefined) profile.workType = workType;

    await profile.save();

    const scoreMetrics = await calculateScores(req.user._id);
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      profile,
      user: updatedUser,
      metrics: scoreMetrics,
      message: 'Profile updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// --- EDUCATION CRUD ---
const getEducation = async (req, res, next) => {
  try {
    const records = await Education.find({ user: req.user._id }).sort({ passingYear: -1 });
    res.status(200).json({ success: true, records });
  } catch (error) {
    next(error);
  }
};

const createEducation = async (req, res, next) => {
  try {
    const record = await Education.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, record, message: 'Education record added!' });
  } catch (error) {
    next(error);
  }
};

const updateEducation = async (req, res, next) => {
  try {
    const record = await Education.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, record, message: 'Education record updated!' });
  } catch (error) {
    next(error);
  }
};

const deleteEducation = async (req, res, next) => {
  try {
    await Education.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Education record deleted' });
  } catch (error) {
    next(error);
  }
};

// --- PROJECT CRUD ---
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, project, message: 'Project added successfully!' });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, project, message: 'Project updated successfully!' });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

// --- EXPERIENCE CRUD ---
const getExperiences = async (req, res, next) => {
  try {
    const experiences = await Experience.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, experiences });
  } catch (error) {
    next(error);
  }
};

const createExperience = async (req, res, next) => {
  try {
    const experience = await Experience.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, experience, message: 'Experience added!' });
  } catch (error) {
    next(error);
  }
};

const updateExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!experience) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, experience, message: 'Experience updated!' });
  } catch (error) {
    next(error);
  }
};

const deleteExperience = async (req, res, next) => {
  try {
    await Experience.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Experience deleted' });
  } catch (error) {
    next(error);
  }
};

// --- SKILLS CRUD ---
const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user._id }).sort({ category: 1 });
    res.status(200).json({ success: true, skills });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, skill, message: 'Skill added!' });
  } catch (error) {
    next(error);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.status(200).json({ success: true, skill, message: 'Skill updated!' });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    await Skill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    next(error);
  }
};

// --- CERTIFICATIONS CRUD ---
const getCertifications = async (req, res, next) => {
  try {
    const certifications = await Certification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, certifications });
  } catch (error) {
    next(error);
  }
};

const createCertification = async (req, res, next) => {
  try {
    const certification = await Certification.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, certification, message: 'Certification added!' });
  } catch (error) {
    next(error);
  }
};

const deleteCertification = async (req, res, next) => {
  try {
    await Certification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Certification deleted' });
  } catch (error) {
    next(error);
  }
};

// --- RESUME MANAGEMENT ---
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    res.status(200).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a valid PDF resume file.' });
    }

    const fileUrl = `/uploads/resumes/${req.file.filename}`;

    let resume = await Resume.findOne({ user: req.user._id });
    if (resume) {
      resume.fileName = req.file.originalname;
      resume.fileUrl = fileUrl;
      resume.fileSize = req.file.size;
      resume.mimeType = req.file.mimetype;
      resume.status = 'Verified';
      await resume.save();
    } else {
      resume = await Resume.create({
        user: req.user._id,
        fileName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: 'Verified',
      });
    }

    const io = req.app.get('io');
    const placementOfficers = await User.find({ role: 'placement' }).select('_id');
    for (const officer of placementOfficers) {
      await createAndSendNotification(io, {
        recipient: officer._id,
        recipientRole: 'placement',
        sender: req.user._id,
        senderRole: 'student',
        title: 'Resume Uploaded',
        message: `${req.user.name} uploaded a new ATS resume (${req.file.originalname}).`,
        type: 'Info',
        entityType: 'profile',
        entityId: req.user._id.toString(),
        actionUrl: `/placement/dashboard?tab=applications&search=${encodeURIComponent(req.user.name)}`,
      });
    }

    res.status(200).json({ success: true, resume, message: 'Resume uploaded successfully!' });
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    await Resume.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// --- STUDENT APPLICATIONS ---
const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user._id }).sort({ appliedDate: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const { jobDriveId, companyName, companyLogo, roleTitle, packageLPA, location, deadline } = req.body;

    if (jobDriveId) {
      const drive = await JobDrive.findById(jobDriveId);
      if (drive && drive.status !== 'Published') {
        return res.status(400).json({ success: false, message: 'Applications for this drive are closed.' });
      }
    }

    const existing = await Application.findOne({ user: req.user._id, companyName, roleTitle });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this position.' });
    }

    const application = await Application.create({
      user: req.user._id,
      jobDrive: jobDriveId || null,
      companyName,
      companyLogo,
      roleTitle,
      packageLPA,
      location,
      deadline,
      stage: 'Applied',
      timeline: [
        {
          stage: 'Applied',
          remarks: 'Application submitted successfully.',
          date: new Date(),
          updatedBy: 'Student',
        },
      ],
    });

    const io = req.app.get('io');

    await createAndSendNotification(io, {
      recipient: req.user._id,
      recipientRole: 'student',
      senderRole: 'system',
      title: `Application Submitted`,
      message: `Your application for ${roleTitle} at ${companyName} has been submitted successfully.`,
      type: 'Success',
      entityType: 'application',
      entityId: application._id.toString(),
      companyName,
      application: application._id,
      actionUrl: `/student/dashboard?tab=applications&appId=${application._id}`,
    });

    const placementOfficers = await User.find({ role: 'placement' }).select('_id');
    for (const officer of placementOfficers) {
      await createAndSendNotification(io, {
        recipient: officer._id,
        recipientRole: 'placement',
        sender: req.user._id,
        senderRole: 'student',
        title: `New Student Application`,
        message: `${req.user.name} applied for ${roleTitle} at ${companyName}.`,
        type: 'Application',
        priority: 'High',
        entityType: 'application',
        entityId: application._id.toString(),
        companyName,
        application: application._id,
        actionUrl: `/placement/dashboard?tab=applications&appId=${application._id}`,
      });
    }

    res.status(201).json({ success: true, application, message: 'Application submitted successfully!' });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

    if (app.stage !== 'Applied') {
      return res.status(400).json({ success: false, message: 'Cannot withdraw application once recruitment processing has started.' });
    }

    await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Application withdrawn.' });
  } catch (error) {
    next(error);
  }
};

// --- ENTERPRISE JOB DRIVES (STUDENT VIEW) ---
const getJobDrives = async (req, res, next) => {
  try {
    const { search, location, jobType, filterTab } = req.query;

    // Automatic Deadline Expiry Check
    const expiredDrives = await JobDrive.find({ status: 'Published', deadline: { $lt: new Date() } });
    if (expiredDrives.length > 0) {
      for (const d of expiredDrives) {
        d.status = 'Closed';
        d.closedAt = new Date();
        d.closedBy = 'System Expiry Engine';
        d.closeReason = 'Application Deadline Passed';
        await d.save();
      }
    }

    // Students only see Published and Closed drives (Draft & Archived are hidden)
    let query = { status: { $in: ['Published', 'Closed'] } };

    if (filterTab === 'Open') {
      query.status = 'Published';
    } else if (filterTab === 'Closed') {
      query.status = 'Closed';
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } },
        { skillsRequired: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType && jobType !== 'All') {
      query.type = jobType;
    }

    const drives = await JobDrive.find(query).populate('company').sort({ createdAt: -1 });

    const studentProfile = await Profile.findOne({ user: req.user._id });
    const studentCGPA = studentProfile?.cgpa || 0;

    const userApps = await Application.find({ user: req.user._id });
    const appliedDriveIds = new Set(userApps.map((a) => a.jobDrive?.toString()).filter(Boolean));

    let enrichedDrives = drives.map((drive) => ({
      ...drive.toObject(),
      isApplied: appliedDriveIds.has(drive._id.toString()),
      isEligible: studentCGPA >= (drive.eligibilityCGPA || 0),
    }));

    if (filterTab === 'Applied') {
      enrichedDrives = enrichedDrives.filter((d) => d.isApplied);
    }

    res.status(200).json({ success: true, drives: enrichedDrives });
  } catch (error) {
    next(error);
  }
};

// --- NOTIFICATIONS ---
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'Notifications marked read' });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// --- ANALYTICS ---
const getStudentAnalytics = async (req, res, next) => {
  try {
    const apps = await Application.find({ user: req.user._id });
    const totalApplied = apps.length;
    const totalOffers = apps.filter((a) => a.stage === 'Offer Released' || a.stage === 'Offer').length;
    const totalRejected = apps.filter((a) => a.stage === 'Rejected').length;
    const totalInterviews = apps.filter((a) => a.stage === 'Interview' || a.stage === 'Selected').length;

    const successRate = totalApplied > 0 ? Math.round((totalOffers / totalApplied) * 100) : 0;

    const stageBreakdown = {
      Applied: apps.filter((a) => a.stage === 'Applied').length,
      'Resume Shortlisted': apps.filter((a) => a.stage === 'Resume Shortlisted').length,
      OA: apps.filter((a) => a.stage === 'OA').length,
      Interview: totalInterviews,
      'Offer Released': totalOffers,
      Rejected: totalRejected,
    };

    res.status(200).json({
      success: true,
      analytics: {
        totalApplied,
        totalOffers,
        totalRejected,
        totalInterviews,
        successRate,
        stageBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
