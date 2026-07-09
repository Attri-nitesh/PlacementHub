const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env configuration
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/placementhub';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected. Starting DB Seed...');

    // Clear collections
    await User.deleteMany();
    await StudentProfile.deleteMany();
    await RecruiterProfile.deleteMany();
    await PlacementDrive.deleteMany();
    await Application.deleteMany();
    await Notification.deleteMany();
    console.log('Cleared existing records.');

    // 1. Create Admin Account
    const admin = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'admin@placementhub.com',
      password: 'password123',
      role: 'admin'
    });

    // 2. Create Recruiter Accounts & Profiles
    const recruiter1 = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@google.com',
      password: 'password123',
      role: 'recruiter'
    });
    await RecruiterProfile.create({
      user: recruiter1._id,
      companyName: 'Google',
      website: 'https://careers.google.com',
      industry: 'Technology',
      about: 'Google is a global tech leader specializing in search, AI, cloud computing, and hardware.'
    });

    const recruiter2 = await User.create({
      name: 'John Doe',
      email: 'john@amazon.com',
      password: 'password123',
      role: 'recruiter'
    });
    await RecruiterProfile.create({
      user: recruiter2._id,
      companyName: 'Amazon',
      website: 'https://amazon.jobs',
      industry: 'E-Commerce & Cloud Services',
      about: 'Amazon is a global retail and cloud computing giant focused on customer-centric innovations.'
    });
    console.log('Seeded Admins and Recruiters.');

    // 3. Create Student Accounts & Profiles
    const students = [
      {
        name: 'Amit Patel',
        email: 'amit@student.com',
        cgpa: 8.7,
        branch: 'Computer Science',
        skills: ['React', 'Node.js', 'MongoDB', 'Python', 'Tailwind'],
        contact: '9876543210'
      },
      {
        name: 'Priya Sen',
        email: 'priya@student.com',
        cgpa: 7.9,
        branch: 'Information Technology',
        skills: ['Java', 'SQL', 'HTML/CSS', 'Javascript', 'React'],
        contact: '9876543211'
      },
      {
        name: 'Rohan Mehta',
        email: 'rohan@student.com',
        cgpa: 9.3,
        branch: 'Electronics',
        skills: ['C++', 'Embedded Systems', 'Python', 'MATLAB'],
        contact: '9876543212'
      },
      {
        name: 'Sneha Rao',
        email: 'sneha@student.com',
        cgpa: 6.8,
        branch: 'Computer Science',
        skills: ['Java', 'MySQL', 'Spring Boot'],
        contact: '9876543213'
      }
    ];

    const seededStudents = [];
    for (const s of students) {
      const u = await User.create({
        name: s.name,
        email: s.email,
        password: 'password123',
        role: 'student'
      });

      const profile = await StudentProfile.create({
        user: u._id,
        cgpa: s.cgpa,
        branch: s.branch,
        skills: s.skills,
        contact: s.contact,
        education: [
          { degree: 'B.Tech', institution: 'Global Technical Institute', passYear: 2026 },
          { degree: 'High School', institution: 'St. Mary School', passYear: 2022 }
        ],
        resumeUrl: `https://placementhub.com/resumes/${s.name.toLowerCase().replace(' ', '_')}_resume.pdf`
      });

      seededStudents.push({ user: u, profile });
    }
    console.log('Seeded Student users and profiles.');

    // 4. Create Placement Drives
    const googleDrive = await PlacementDrive.create({
      companyName: 'Google',
      jobRole: 'Associate Software Engineer (SWE)',
      package: 35,
      location: 'Bangalore, India',
      eligibilityCgpa: 8.0,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days ahead
      description: 'We are seeking creative, technical minds to help write clean, modular APIs and implement frontend web frameworks at scale.',
      createdByUser: recruiter1._id
    });

    const amazonDrive = await PlacementDrive.create({
      companyName: 'Amazon',
      jobRole: 'Software Development Engineer I (SDE-1)',
      package: 28,
      location: 'Hyderabad, India',
      eligibilityCgpa: 7.5,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days ahead (Reminders cron test!)
      description: 'Build robust, highly scalable ecommerce backend services and contribute to global logistics calculations.',
      createdByUser: recruiter2._id
    });

    const metaDrive = await PlacementDrive.create({
      companyName: 'Meta',
      jobRole: 'Infrastructure Engineer',
      package: 45,
      location: 'Remote, India',
      eligibilityCgpa: 8.5,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (Expired drive)
      description: 'Optimize global container delivery pipelines, monitor high load routing networks, and build low level systems.',
      status: 'expired',
      createdByUser: admin._id
    });
    console.log('Seeded Placement Drives.');

    // 5. Create Applications
    // Student 1 (Amit CGPA 8.7) - Google (Interview), Amazon (Online Assessment)
    await Application.create({
      student: seededStudents[0].user._id,
      drive: googleDrive._id,
      platform: 'PlacementHub',
      status: 'Interview',
      feedback: 'Passed screening test and screening code reviews. Interview scheduled for July 12.',
      resumeUrl: seededStudents[0].profile.resumeUrl
    });
    await Application.create({
      student: seededStudents[0].user._id,
      drive: amazonDrive._id,
      platform: 'PlacementHub',
      status: 'Online Assessment',
      resumeUrl: seededStudents[0].profile.resumeUrl
    });

    // Student 2 (Priya CGPA 7.9) - Amazon (Offer)
    await Application.create({
      student: seededStudents[1].user._id,
      drive: amazonDrive._id,
      platform: 'On-Campus',
      status: 'Offer',
      feedback: 'Offered roll! Exceptional problem solver.',
      resumeUrl: seededStudents[1].profile.resumeUrl
    });

    // Student 3 (Rohan CGPA 9.3) - Google (Offer), Amazon (Applied), Meta (Rejected)
    await Application.create({
      student: seededStudents[2].user._id,
      drive: googleDrive._id,
      platform: 'PlacementHub',
      status: 'Offer',
      feedback: 'Hired with outstanding feedback across all DSA and behavior modules.',
      resumeUrl: seededStudents[2].profile.resumeUrl
    });
    await Application.create({
      student: seededStudents[2].user._id,
      drive: amazonDrive._id,
      platform: 'Off-Campus',
      status: 'Applied',
      resumeUrl: seededStudents[2].profile.resumeUrl
    });
    await Application.create({
      student: seededStudents[2].user._id,
      drive: metaDrive._id,
      platform: 'PlacementHub',
      status: 'Rejected',
      feedback: 'Failed to clear system design interview panel.',
      resumeUrl: seededStudents[2].profile.resumeUrl
    });

    // Student 4 (Sneha CGPA 6.8) - Amazon (Rejected due to eligibility criteria review)
    await Application.create({
      student: seededStudents[3].user._id,
      drive: amazonDrive._id,
      platform: 'PlacementHub',
      status: 'Rejected',
      feedback: 'Academic GPA is below the company specified requirement.',
      resumeUrl: seededStudents[3].profile.resumeUrl
    });
    console.log('Seeded Applications.');

    // 6. Seed Notification Logs
    await Notification.create({
      recipient: null,
      title: 'Google Drive Published',
      message: 'Google has published a new drive for SWE-1. Apply before deadline!',
      type: 'drive'
    });
    await Notification.create({
      recipient: seededStudents[2].user._id,
      title: 'Offer Alert!',
      message: 'Congratulations! Google has extended an offer to you. Track details on your Kanban board.',
      type: 'status_update'
    });
    console.log('Seeded Notification history.');

    console.log('Database seeded successfully! Run npm run dev to start testing.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process failed:', err.message);
    process.exit(1);
  }
};

seedDB();
