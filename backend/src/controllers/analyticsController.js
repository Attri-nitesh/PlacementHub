const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const mongoose = require('mongoose');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Protected
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Filter queries based on roles
    let query = {};
    if (role === 'student') {
      query.student = new mongoose.Types.ObjectId(userId);
    } else if (role === 'recruiter') {
      // Find drives created by this recruiter
      const recruiterDrives = await PlacementDrive.find({ createdByUser: userId }).select('_id');
      const driveIds = recruiterDrives.map(d => d._id);
      query.drive = { $in: driveIds };
    }

    const totalApps = await Application.countDocuments(query);

    // Calculate rates
    const offerCount = await Application.countDocuments({ ...query, status: 'Offer' });
    const interviewCount = await Application.countDocuments({ ...query, status: 'Interview' });
    const rejectionCount = await Application.countDocuments({ ...query, status: 'Rejected' });

    const offerRate = totalApps > 0 ? Math.round((offerCount / totalApps) * 100) : 0;
    const interviewRate = totalApps > 0 ? Math.round((interviewCount / totalApps) * 100) : 0;
    const rejectionRate = totalApps > 0 ? Math.round((rejectionCount / totalApps) * 100) : 0;

    // Platform-wise counts and success rates
    const platformStats = await Application.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$platform',
          total: { $sum: 1 },
          offers: {
            $sum: { $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0] }
          }
        }
      }
    ]);

    const formattedPlatformStats = platformStats.map(stat => ({
      platform: stat._id || 'PlacementHub',
      total: stat.total,
      offers: stat.offers,
      successRate: stat.total > 0 ? Math.round((stat.offers / stat.total) * 100) : 0
    }));

    // Most Applied Companies
    const mostAppliedDrives = await Application.aggregate([
      { $match: query },
      { $group: { _id: '$drive', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const structuredCompanies = await Promise.all(
      mostAppliedDrives.map(async (item) => {
        const drive = await PlacementDrive.findById(item._id);
        return {
          companyName: drive ? drive.companyName : 'Unknown',
          role: drive ? drive.jobRole : 'N/A',
          count: item.count
        };
      })
    );

    // Average Package (LPA)
    let averagePackage = 0;
    if (role === 'student') {
      const studentApps = await Application.find({ student: userId }).populate('drive');
      const packages = studentApps.map(app => app.drive ? app.drive.package : 0).filter(p => p > 0);
      averagePackage = packages.length > 0 ? parseFloat((packages.reduce((sum, p) => sum + p, 0) / packages.length).toFixed(2)) : 0;
    } else if (role === 'recruiter') {
      const recruiterDrives = await PlacementDrive.find({ createdByUser: userId });
      const packages = recruiterDrives.map(d => d.package).filter(p => p > 0);
      averagePackage = packages.length > 0 ? parseFloat((packages.reduce((sum, p) => sum + p, 0) / packages.length).toFixed(2)) : 0;
    } else {
      const allDrives = await PlacementDrive.find();
      const packages = allDrives.map(d => d.package).filter(p => p > 0);
      averagePackage = packages.length > 0 ? parseFloat((packages.reduce((sum, p) => sum + p, 0) / packages.length).toFixed(2)) : 0;
    }

    // Monthly Application Trends (for Recharts)
    const monthlyTrends = await Application.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrends = monthlyTrends.map(trend => {
      const monthIdx = trend._id.month - 1;
      return {
        month: `${monthNames[monthIdx]} ${trend._id.year}`,
        applications: trend.count
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalApps,
        offerRate,
        interviewRate,
        rejectionRate,
        platformStats: formattedPlatformStats.length > 0 ? formattedPlatformStats : [{ platform: 'PlacementHub', total: 0, offers: 0, successRate: 0 }],
        mostAppliedCompanies: structuredCompanies,
        averagePackage,
        monthlyTrends: formattedTrends.length > 0 ? formattedTrends : [{ month: 'Current Month', applications: totalApps }]
      }
    });
  } catch (err) {
    next(err);
  }
};
