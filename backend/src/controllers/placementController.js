const Company = require('../models/Company');
const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Offer = require('../models/Offer');
const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const Education = require('../models/Education');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Certification = require('../models/Certification');
const { createAndSendNotification, broadcastRoleNotification } = require('../services/notificationService');
const { Parser } = require('json2csv');

// Helper to log system activity
const logActivity = async (io, action, performedBy, targetUser, details) => {
  try {
    await ActivityLog.create({ action, performedBy, targetUser, details });
    if (io) {
      io.emit('activity_logged', { action, details, timestamp: new Date() });
    }
  } catch (err) {
    console.error('Activity log error:', err);
  }
};

// --- DASHBOARD METRICS & ANALYTICS ---
const getPlacementDashboard = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCompanies = await Company.countDocuments({ status: 'Active' });

    const draftDrives = await JobDrive.countDocuments({ status: 'Draft' });
    const publishedDrives = await JobDrive.countDocuments({ status: 'Published' });
    const closedDrives = await JobDrive.countDocuments({ status: 'Closed' });
    const archivedDrives = await JobDrive.countDocuments({ status: 'Archived' });
    const activeDrives = publishedDrives;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const applicationsToday = await Application.countDocuments({ createdAt: { $gte: startOfDay } });

    const upcomingInterviews = await Interview.countDocuments({ status: 'Scheduled' });
    const offersReleased = await Application.countDocuments({ stage: { $in: ['Offer Released', 'Offer'] } });
    const rejectedApplications = await Application.countDocuments({ stage: 'Rejected' });

    const totalApplications = await Application.countDocuments();
    const applicationRate = totalStudents > 0 ? (totalApplications / totalStudents).toFixed(1) : 0;
    const hiringRate = totalApplications > 0 ? ((offersReleased / totalApplications) * 100).toFixed(1) : 0;

    const recentLogs = await ActivityLog.find()
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      metrics: {
        totalStudents,
        totalCompanies,
        activeDrives,
        draftDrives,
        publishedDrives,
        closedDrives,
        archivedDrives,
        applicationsToday,
        upcomingInterviews,
        offersReleased,
        rejectedApplications,
        applicationRate,
        hiringRate,
      },
      recentActivity: recentLogs,
    });
  } catch (error) {
    next(error);
  }
};

// --- COMPANY MANAGEMENT (SINGLE SOURCE OF TRUTH) ---
const getCompanies = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    } else if (!status && req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      // By default for non-admin requests, return only Active companies
      query.status = 'Active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { officerName: { $regex: search, $options: 'i' } },
      ];
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    const io = req.app.get('io');
    await logActivity(io, 'CREATE_COMPANY', req.user._id, null, `Onboarded company: ${company.name}`);

    if (io) {
      io.to('role:placement').emit('company_created', company);
      io.to('role:admin').emit('company_created', company);
      io.to('role:student').emit('company_created', company);
    }

    await broadcastRoleNotification(io, 'placement', {
      sender: req.user._id,
      senderRole: 'placement',
      title: `New Corporate Partner Onboarded`,
      message: `${company.name} (${company.industry}) has been added to PlacementHub.`,
      type: 'Info',
      entityType: 'drive',
      entityId: company._id.toString(),
      actionUrl: `/placement/dashboard?tab=companies&companyId=${company._id}`,
      companyName: company.name,
    });

    res.status(201).json({ success: true, company, message: 'Company onboarded successfully!' });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found in database.' });
    }

    const io = req.app.get('io');
    await logActivity(io, 'UPDATE_COMPANY', req.user._id, null, `Updated company: ${company.name}`);

    if (io) {
      io.to('role:placement').emit('company_updated', company);
      io.to('role:admin').emit('company_updated', company);
      io.to('role:student').emit('company_updated', company);
    }

    res.status(200).json({ success: true, company, message: 'Company updated successfully!' });
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found.' });
    }

    await Company.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    await logActivity(io, 'DELETE_COMPANY', req.user._id, null, `Permanently deleted company: ${company.name}`);

    if (io) {
      io.to('role:placement').emit('company_deleted', req.params.id);
      io.to('role:admin').emit('company_deleted', req.params.id);
      io.to('role:student').emit('company_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Company permanently removed from MongoDB database.' });
  } catch (error) {
    next(error);
  }
};

// --- ENTERPRISE PLACEMENT DRIVE LIFECYCLE MANAGEMENT ---
const getDrives = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Automatic Deadline Expiry Check
    const expiredDrives = await JobDrive.find({ status: 'Published', deadline: { $lt: new Date() } });
    if (expiredDrives.length > 0) {
      const io = req.app.get('io');
      for (const d of expiredDrives) {
        d.status = 'Closed';
        d.closedAt = new Date();
        d.closedBy = 'System Expiry Engine';
        d.closeReason = 'Application Deadline Passed';
        await d.save();

        if (io) {
          io.to('role:student').emit('drive_closed', d);
          io.to('role:placement').emit('drive_closed', d);
        }

        await broadcastRoleNotification(io, 'student', {
          sender: req.user._id || 'System',
          senderRole: 'placement',
          title: `Applications Closed: ${d.companyName}`,
          message: `Applications for ${d.roleTitle} at ${d.companyName} have automatically closed as the deadline passed.`,
          type: 'Warning',
          priority: 'Normal',
          entityType: 'drive',
          entityId: d._id.toString(),
          actionUrl: `/student/dashboard?tab=drives&driveId=${d._id}`,
          companyName: d.companyName,
        });
      }
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const drives = await JobDrive.find(query).populate('company').sort({ createdAt: -1 });

    const enrichedDrives = await Promise.all(
      drives.map(async (drive) => {
        const appsCount = await Application.countDocuments({ companyName: drive.companyName, roleTitle: drive.roleTitle });
        return {
          ...drive.toObject(),
          applicationsCount: appsCount,
        };
      })
    );

    res.status(200).json({ success: true, drives: enrichedDrives });
  } catch (error) {
    next(error);
  }
};

const createDrive = async (req, res, next) => {
  try {
    const { company: companyId, roleTitle, packageLPA, location, deadline, description, status = 'Draft' } = req.body;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Please select a valid corporate partner.' });
    }
    if (!roleTitle) {
      return res.status(400).json({ success: false, message: 'Job Role Title is required.' });
    }
    if (!packageLPA) {
      return res.status(400).json({ success: false, message: 'Package / CTC is required.' });
    }
    if (!location) {
      return res.status(400).json({ success: false, message: 'Job Location is required.' });
    }
    if (!deadline || isNaN(new Date(deadline).getTime())) {
      return res.status(400).json({ success: false, message: 'A valid Application Deadline date is required.' });
    }
    if (!description) {
      return res.status(400).json({ success: false, message: 'Job Description is required.' });
    }

    let companyDoc = null;
    if (companyId) {
      companyDoc = await Company.findById(companyId);
    }

    const isPublished = status === 'Published';

    const driveData = {
      ...req.body,
      company: companyId || companyDoc?._id,
      companyName: req.body.companyName || companyDoc?.name || 'Partner Company',
      companyLogo: req.body.companyLogo || companyDoc?.logo || '',
      deadline: new Date(deadline),
      status: isPublished ? 'Published' : 'Draft',
      publishedAt: isPublished ? new Date() : null,
      publishedBy: req.user?.name || 'Placement Cell Officer',
    };

    const drive = await JobDrive.create(driveData);
    const populatedDrive = await JobDrive.findById(drive._id).populate('company');
    const io = req.app.get('io');

    await logActivity(io, 'CREATE_DRIVE', req.user._id, null, `Created drive (${status}): ${drive.roleTitle} at ${drive.companyName}`);

    if (isPublished) {
      if (io) {
        io.to('role:student').emit('drive_published', populatedDrive);
        io.to('role:placement').emit('drive_published', populatedDrive);
      }

      await broadcastRoleNotification(io, 'student', {
        sender: req.user._id,
        senderRole: 'placement',
        title: `New Placement Drive: ${drive.companyName}`,
        message: `${drive.roleTitle} (${drive.packageLPA}) recruitment drive is now active. Check eligibility & apply!`,
        type: 'Drive',
        priority: 'High',
        entityType: 'drive',
        entityId: drive._id.toString(),
        actionUrl: `/student/dashboard?tab=drives&driveId=${drive._id}`,
        companyName: drive.companyName,
      });
    } else {
      if (io) {
        io.to('role:placement').emit('drive_created', populatedDrive);
      }
    }

    res.status(201).json({
      success: true,
      drive: populatedDrive,
      message: isPublished ? 'Placement drive published live!' : 'Placement drive saved as Draft!',
    });
  } catch (error) {
    next(error);
  }
};

const updateDrive = async (req, res, next) => {
  try {
    const drive = await JobDrive.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('company');
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

    const io = req.app.get('io');
    if (io) {
      io.to('role:student').emit('drive_updated', drive);
      io.to('role:placement').emit('drive_updated', drive);
    }

    res.status(200).json({ success: true, drive, message: 'Placement drive updated successfully!' });
  } catch (error) {
    next(error);
  }
};

const updateDriveStatus = async (req, res, next) => {
  try {
    const { status, closeReason } = req.body;
    const drive = await JobDrive.findById(req.params.id).populate('company');
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

    const prevStatus = drive.status;
    drive.status = status;

    if (status === 'Published') {
      drive.publishedAt = new Date();
      drive.publishedBy = req.user?.name || 'Placement Cell Officer';
    } else if (status === 'Closed') {
      drive.closedAt = new Date();
      drive.closedBy = req.user?.name || 'Placement Cell Officer';
      drive.closeReason = closeReason || 'Recruiter Closed Applications';
    } else if (status === 'Archived') {
      drive.archivedAt = new Date();
      drive.archivedBy = req.user?.name || 'Placement Cell Officer';
    } else if (status === 'Draft') {
      drive.publishedAt = null;
    }

    await drive.save();

    const io = req.app.get('io');
    await logActivity(io, 'DRIVE_STATUS_CHANGE', req.user._id, null, `Drive ${drive.companyName} (${drive.roleTitle}) changed from ${prevStatus} -> ${status}`);

    if (io) {
      io.to('role:student').emit('drive_status_updated', drive);
      io.to('role:placement').emit('drive_status_updated', drive);
    }

    if (status === 'Published') {
      await broadcastRoleNotification(io, 'student', {
        sender: req.user._id,
        senderRole: 'placement',
        title: `Placement Drive Published: ${drive.companyName}`,
        message: `${drive.roleTitle} drive is now active. Submit your applications!`,
        type: 'Drive',
        priority: 'High',
        entityType: 'drive',
        entityId: drive._id.toString(),
        actionUrl: `/student/dashboard?tab=drives&driveId=${drive._id}`,
        companyName: drive.companyName,
      });
    } else if (status === 'Closed') {
      await broadcastRoleNotification(io, 'student', {
        sender: req.user._id,
        senderRole: 'placement',
        title: `Applications Closed: ${drive.companyName}`,
        message: `Applications for ${drive.roleTitle} at ${drive.companyName} have closed. Reason: ${drive.closeReason}`,
        type: 'Warning',
        priority: 'Normal',
        entityType: 'drive',
        entityId: drive._id.toString(),
        actionUrl: `/student/dashboard?tab=drives&driveId=${drive._id}`,
        companyName: drive.companyName,
      });
    }

    res.status(200).json({ success: true, drive, message: `Drive status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

const duplicateDrive = async (req, res, next) => {
  try {
    const originalDrive = await JobDrive.findById(req.params.id);
    if (!originalDrive) return res.status(404).json({ success: false, message: 'Drive not found' });

    const clonedData = {
      ...originalDrive.toObject(),
      _id: undefined,
      roleTitle: `${originalDrive.roleTitle} (Copy)`,
      status: 'Draft',
      publishedAt: null,
      closedAt: null,
      archivedAt: null,
      createdAt: undefined,
      updatedAt: undefined,
    };

    const newDrive = await JobDrive.create(clonedData);
    const populated = await JobDrive.findById(newDrive._id).populate('company');

    const io = req.app.get('io');
    if (io) io.to('role:placement').emit('drive_created', populated);

    res.status(201).json({ success: true, drive: populated, message: 'Drive duplicated as a Draft!' });
  } catch (error) {
    next(error);
  }
};

const deleteDrive = async (req, res, next) => {
  try {
    const drive = await JobDrive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

    await JobDrive.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.to('role:student').emit('drive_deleted', req.params.id);
      io.to('role:placement').emit('drive_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Placement drive permanently deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- APPLICATIONS REVIEW ---
const getAllApplications = async (req, res, next) => {
  try {
    const { stage, company, search, category } = req.query;
    let query = {};

    if (category === 'screening') {
      query.stage = { $in: ['Applied', 'Resume Shortlisted', 'OA'] };
    } else if (category === 'interviews') {
      query.stage = 'Interview';
    } else if (category === 'offers') {
      query.stage = { $in: ['Offer Released', 'Offer'] };
    } else if (category === 'rejected') {
      query.stage = 'Rejected';
    } else if (stage && stage !== 'All') {
      query.stage = stage;
    }

    if (company && company !== 'All') query.companyName = company;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await Application.find(query)
      .populate({
        path: 'user',
        select: 'name email profilePicture rollNumber',
      })
      .sort({ appliedDate: -1 });

    const enrichedApps = await Promise.all(
      applications.map(async (app) => {
        if (!app.user) return app.toObject();
        const profile = await Profile.findOne({ user: app.user._id });
        const resume = await Resume.findOne({ user: app.user._id });
        const education = await Education.find({ user: app.user._id });
        const projects = await Project.find({ user: app.user._id });
        const skills = await Skill.find({ user: app.user._id });
        const certifications = await Certification.find({ user: app.user._id });

        return {
          ...app.toObject(),
          studentProfile: {
            profile,
            resume,
            education,
            projects,
            skills,
            certifications,
          },
        };
      })
    );

    res.status(200).json({ success: true, applications: enrichedApps });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStage = async (req, res, next) => {
  try {
    const { stage, remarks } = req.body;
    const application = await Application.findById(req.params.id).populate('user', 'name email');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.stage = stage;
    application.timeline.push({
      stage,
      remarks: remarks || `Recruiter updated stage to: ${stage}`,
      date: new Date(),
      updatedBy: 'Placement Cell Officer',
    });

    await application.save();

    const io = req.app.get('io');
    await logActivity(io, 'STAGE_CHANGE', req.user._id, application.user._id, `Application for ${application.companyName} updated to: ${stage}`);

    if (io) {
      io.to(`user:${application.user._id.toString()}`).emit('application_updated', application);
      io.to('role:placement').emit('application_updated', application);
    }

    let notifTitle = `Application Stage Updated`;
    let notifMessage = `Your application for ${application.roleTitle} at ${application.companyName} moved to: ${stage}.`;
    let notifType = 'Application';
    let notifPriority = 'Normal';
    let modalParam = 'timeline';

    if (stage === 'Resume Shortlisted') {
      notifTitle = `Resume Shortlisted by ${application.companyName}`;
      notifMessage = `Congratulations! You have been shortlisted for ${application.roleTitle} at ${application.companyName}.`;
      notifType = 'Success';
      notifPriority = 'High';
      modalParam = 'shortlisted';
    } else if (stage === 'OA') {
      notifTitle = `Online Assessment Scheduled: ${application.companyName}`;
      notifMessage = `Your Online Assessment (OA) for ${application.roleTitle} is now scheduled. Check dashboard for details.`;
      notifType = 'Interview';
      notifPriority = 'High';
      modalParam = 'oa';
    }

    await createAndSendNotification(io, {
      recipient: application.user._id,
      recipientRole: 'student',
      sender: req.user._id,
      senderRole: 'placement',
      title: notifTitle,
      message: notifMessage,
      type: notifType,
      priority: notifPriority,
      entityType: 'application',
      entityId: application._id.toString(),
      companyName: application.companyName,
      application: application._id,
      actionUrl: `/student/dashboard?tab=applications&applicationId=${application._id}&modal=${modalParam}`,
    });

    res.status(200).json({ success: true, application, message: `Application stage updated to ${stage}` });
  } catch (error) {
    next(error);
  }
};

// --- INTERVIEW SCHEDULER ---
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find()
      .populate('user', 'name email rollNumber')
      .sort({ date: 1 });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, userId, companyName, roleTitle, round, date, time, type, meetLink, venue, instructions, interviewerName } = req.body;

    const interview = await Interview.create({
      application: applicationId,
      user: userId,
      companyName,
      roleTitle,
      round,
      date,
      time,
      type,
      meetLink,
      venue,
      instructions,
      interviewerName,
      status: 'Scheduled',
    });

    const application = await Application.findById(applicationId);
    if (application) {
      application.stage = 'Interview';
      application.timeline.push({
        stage: 'Interview',
        remarks: `Interview Scheduled (${round}) on ${new Date(date).toLocaleDateString()} at ${time}`,
        date: new Date(),
        updatedBy: 'Placement Cell Officer',
      });
      await application.save();
    }

    const io = req.app.get('io');
    await logActivity(io, 'SCHEDULE_INTERVIEW', req.user._id, userId, `Scheduled ${round} for ${companyName}`);

    if (io) {
      if (application) io.to(`user:${userId.toString()}`).emit('application_updated', application);
      io.to('role:placement').emit('application_updated', application);
      io.to('role:placement').emit('interview_scheduled', interview);
    }

    await createAndSendNotification(io, {
      recipient: userId,
      recipientRole: 'student',
      sender: req.user._id,
      senderRole: 'placement',
      title: `Interview Scheduled: ${companyName}`,
      message: `${round} for ${roleTitle} scheduled on ${new Date(date).toLocaleDateString()} at ${time}. Venue: ${type === 'Online' ? 'Google Meet Video Link' : venue}.`,
      type: 'Interview',
      priority: 'Urgent',
      entityType: 'interview',
      entityId: interview._id.toString(),
      companyName,
      interview: interview._id,
      application: applicationId,
      actionUrl: `/student/dashboard?tab=applications&applicationId=${applicationId}&interviewId=${interview._id}&modal=interview`,
    });

    res.status(201).json({ success: true, interview, message: 'Interview scheduled & candidate moved to Interviews tab!' });
  } catch (error) {
    next(error);
  }
};

// --- OFFER MANAGEMENT ---
const getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find()
      .populate('user', 'name email rollNumber')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, offers });
  } catch (error) {
    next(error);
  }
};

const releaseOffer = async (req, res, next) => {
  try {
    const { applicationId, userId, companyName, roleTitle, packageLPA, joiningDate, offerLetterMessage } = req.body;

    const offer = await Offer.create({
      application: applicationId,
      user: userId,
      companyName,
      roleTitle,
      packageLPA,
      joiningDate,
      offerLetterMessage,
      status: 'Pending',
    });

    const application = await Application.findById(applicationId);
    if (application) {
      application.stage = 'Offer Released';
      application.timeline.push({
        stage: 'Offer Released',
        remarks: `Formal placement offer letter released (${packageLPA})`,
        date: new Date(),
        updatedBy: 'Placement Cell Officer',
      });
      await application.save();
    }

    const io = req.app.get('io');
    await logActivity(io, 'RELEASE_OFFER', req.user._id, userId, `Released Offer from ${companyName} (${packageLPA})`);

    if (io) {
      if (application) io.to(`user:${userId.toString()}`).emit('application_updated', application);
      io.to('role:placement').emit('application_updated', application);
      io.to('role:placement').emit('offer_released', offer);
    }

    await createAndSendNotification(io, {
      recipient: userId,
      recipientRole: 'student',
      sender: req.user._id,
      senderRole: 'placement',
      title: `🎉 Offer Letter Released by ${companyName}`,
      message: `Congratulations! You received a formal offer for ${roleTitle} (${packageLPA})!`,
      type: 'Offer',
      priority: 'Urgent',
      entityType: 'offer',
      entityId: offer._id.toString(),
      companyName,
      offer: offer._id,
      application: applicationId,
      actionUrl: `/student/dashboard?tab=applications&applicationId=${applicationId}&offerId=${offer._id}&modal=offer`,
    });

    res.status(201).json({ success: true, offer, message: 'Offer letter released & candidate moved to Offers tab!' });
  } catch (error) {
    next(error);
  }
};

// --- REJECTION FEEDBACK ---
const rejectApplication = async (req, res, next) => {
  try {
    const { applicationId, reason, feedback } = req.body;
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.stage = 'Rejected';
    application.rejectionReason = reason;
    application.rejectionFeedback = feedback;
    application.timeline.push({
      stage: 'Rejected',
      remarks: `Application Rejected: ${reason}`,
      date: new Date(),
      updatedBy: 'Placement Cell Officer',
    });
    await application.save();

    const io = req.app.get('io');
    await logActivity(io, 'REJECT_APPLICATION', req.user._id, application.user, `Application for ${application.companyName} rejected. Reason: ${reason}`);

    if (io) {
      io.to(`user:${application.user.toString()}`).emit('application_updated', application);
      io.to('role:placement').emit('application_updated', application);
    }

    await createAndSendNotification(io, {
      recipient: application.user,
      recipientRole: 'student',
      sender: req.user._id,
      senderRole: 'placement',
      title: `Application Status Update: ${application.companyName}`,
      message: `We appreciate your interest. Your application for ${application.roleTitle} was not selected. Reason: ${reason}.`,
      type: 'Warning',
      priority: 'High',
      entityType: 'application',
      entityId: application._id.toString(),
      companyName: application.companyName,
      application: application._id,
      actionUrl: `/student/dashboard?tab=applications&applicationId=${application._id}&modal=rejected`,
    });

    res.status(200).json({ success: true, message: 'Rejection feedback sent.' });
  } catch (error) {
    next(error);
  }
};

// --- ANNOUNCEMENTS ---
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create({ ...req.body, author: req.user._id });
    const io = req.app.get('io');

    await logActivity(io, 'POST_ANNOUNCEMENT', req.user._id, null, `Posted Announcement: ${announcement.title}`);

    await broadcastRoleNotification(io, 'student', {
      sender: req.user._id,
      senderRole: 'placement',
      title: `📢 Campus Announcement: ${announcement.title}`,
      message: announcement.content,
      type: 'Announcement',
      priority: announcement.priority || 'Normal',
      entityType: 'announcement',
      entityId: announcement._id.toString(),
      actionUrl: `/student/dashboard?tab=notifications&announcementId=${announcement._id}`,
    });

    res.status(201).json({ success: true, announcement, message: 'Campus announcement published!' });
  } catch (error) {
    next(error);
  }
};

// --- STUDENT DIRECTORY & CSV REPORT EXPORTER ---
const getStudentDirectory = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });

    const enrichedStudents = await Promise.all(
      students.map(async (st) => {
        const profile = await Profile.findOne({ user: st._id });
        const resume = await Resume.findOne({ user: st._id });
        const applications = await Application.find({ user: st._id });
        return {
          ...st.toObject(),
          profile,
          resume,
          applicationsCount: applications.length,
          offersCount: applications.filter((a) => a.stage === 'Offer Released' || a.stage === 'Offer').length,
        };
      })
    );

    res.status(200).json({ success: true, students: enrichedStudents });
  } catch (error) {
    next(error);
  }
};

const exportPlacementReport = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('user', 'name email rollNumber')
      .sort({ appliedDate: -1 });

    const reportData = await Promise.all(
      applications.map(async (app) => {
        const profile = await Profile.findOne({ user: app.user?._id });
        return {
          'Student Name': app.user?.name || 'N/A',
          'Email': app.user?.email || 'N/A',
          'Roll Number': app.user?.rollNumber || 'N/A',
          'Department': profile?.department || 'N/A',
          'CGPA': profile?.cgpa || 'N/A',
          'Company Name': app.companyName,
          'Role Title': app.roleTitle,
          'Package (CTC)': app.packageLPA,
          'Current Stage': app.stage,
          'Applied Date': new Date(app.appliedDate).toLocaleDateString(),
        };
      })
    );

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(reportData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`PlacementHub_Report_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

// --- ANALYTICS & ACTIVITY LOGS ---
const getPlacementAnalytics = async (req, res, next) => {
  try {
    const applications = await Application.find();

    const companyStats = {};
    applications.forEach((app) => {
      if (!companyStats[app.companyName]) {
        companyStats[app.companyName] = { total: 0, offers: 0 };
      }
      companyStats[app.companyName].total += 1;
      if (app.stage === 'Offer Released' || app.stage === 'Offer') companyStats[app.companyName].offers += 1;
    });

    res.status(200).json({
      success: true,
      analytics: {
        companyStats,
        totalApplications: applications.length,
        totalOffers: applications.filter((a) => a.stage === 'Offer Released' || a.stage === 'Offer').length,
        totalRejections: applications.filter((a) => a.stage === 'Rejected').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('performedBy', 'name email')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
