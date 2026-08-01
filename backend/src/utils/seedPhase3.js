const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Offer = require('../models/Offer');
const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');

dotenv.config();

const seedPhase3 = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementhub';
    await mongoose.connect(mongoUri);
    console.log('[SeedPhase3] Connected to MongoDB...');

    // 1. Seed Companies
    await Company.deleteMany({});
    const companies = await Company.create([
      {
        name: 'Google India',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
        description: 'Global technology leader specializing in search engine, cloud computing, and AI infrastructure.',
        website: 'https://careers.google.com',
        industry: 'Cloud & AI Infrastructure',
        hrName: 'Priya Sharma',
        hrEmail: 'priya.sharma@google.com',
        hrPhone: '+91 9811223344',
        location: 'Bengaluru / Hyderabad',
        status: 'Active',
      },
      {
        name: 'Microsoft India',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        description: 'Empowering people and organizations through Azure, Windows, and enterprise SaaS solutions.',
        website: 'https://careers.microsoft.com',
        industry: 'Enterprise Software & Cloud',
        hrName: 'Rajesh Verma',
        hrEmail: 'rajesh.verma@microsoft.com',
        hrPhone: '+91 9822334455',
        location: 'Noida / Bengaluru',
        status: 'Active',
      },
      {
        name: 'Amazon Web Services',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        description: 'World leading cloud infrastructure provider driving global ecommerce and serverless architectures.',
        website: 'https://amazon.jobs',
        industry: 'Ecommerce & Cloud',
        hrName: 'Ananya Gupta',
        hrEmail: 'ananya.gupta@amazon.com',
        hrPhone: '+91 9833445566',
        location: 'Hyderabad / Chennai',
        status: 'Active',
      },
      {
        name: 'Uber India Systems',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
        description: 'Pioneering mobility, dispatch routing algorithms, and autonomous transportation platforms.',
        website: 'https://uber.com/careers',
        industry: 'Mobility & Logistics',
        hrName: 'Vikram Mehta',
        hrEmail: 'vikram.mehta@uber.com',
        hrPhone: '+91 9844556677',
        location: 'Bengaluru',
        status: 'Active',
      },
    ]);
    console.log(`✅ Seeded ${companies.length} corporate partner accounts.`);

    // 2. Find default student & placement officer
    const officer = await User.findOne({ email: 'officer@placement.edu' });
    const student = await User.findOne({ email: 'john@student.edu' });

    if (student && officer) {
      // Find or create applications
      const apps = await Application.find({ user: student._id });
      if (apps.length > 0) {
        // Seed Interview
        await Interview.deleteMany({ user: student._id });
        await Interview.create({
          application: apps[0]._id,
          user: student._id,
          companyName: 'Microsoft India',
          roleTitle: 'Software Engineer - Azure Cloud',
          round: 'Technical Interview Round 1',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          time: '02:30 PM',
          type: 'Online',
          meetLink: 'https://meet.google.com/abc-defg-hij',
          instructions: 'Prepare live coding environment in C++/Java. Test microphone and camera beforehand.',
          interviewerName: 'Rajesh Verma (Senior Azure Architect)',
          status: 'Scheduled',
        });
        console.log('✅ Seeded sample scheduled interview.');

        // Seed Activity Logs
        await ActivityLog.deleteMany({});
        await ActivityLog.create([
          {
            action: 'CREATE_DRIVE',
            performedBy: officer._id,
            details: 'Published Google SDE-1 Recruitment Drive (₹32 LPA)',
          },
          {
            action: 'SCHEDULE_INTERVIEW',
            performedBy: officer._id,
            targetUser: student._id,
            details: 'Scheduled Microsoft Azure Technical Interview Round 1 for John Doe',
          },
        ]);
        console.log('✅ Seeded system activity logs.');
      }
    }

    // 3. Seed Announcements
    await Announcement.deleteMany({});
    await Announcement.create([
      {
        title: 'Google & Microsoft Campus Drives Published!',
        content: 'Placement Cell has published active drives for Google SDE-1 (₹32 LPA) and Microsoft Azure (₹28 LPA). Eligible 7th semester students should apply before deadline.',
        priority: 'High',
        category: 'New Drive',
      },
      {
        title: 'Pre-Placement Talk Schedule',
        content: 'Uber Engineering Leadership Team will conduct a live pre-placement session at 4:00 PM in the Main Auditorium.',
        priority: 'Normal',
        category: 'Notice',
      },
    ]);
    console.log('✅ Seeded campus announcements.');

    console.log('[SeedPhase3] Completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[SeedPhase3 Error]', error);
    process.exit(1);
  }
};

seedPhase3();
