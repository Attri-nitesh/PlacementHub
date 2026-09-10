const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const JobDrive = require('../models/JobDrive');
const Notification = require('../models/Notification');
const Application = require('../models/Application');
const Skill = require('../models/Skill');
const Project = require('../models/Project');

dotenv.config();

const seedPhase2 = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementhub';
    await mongoose.connect(mongoUri);
    console.log('[SeedPhase2] Connected to MongoDB...');

    const db = mongoose.connection.db;

    // Drop legacy indexes on applications collection
    try {
      await db.collection('applications').drop();
    } catch (e) {}

    // 1. Seed Sample Job Drives
    await JobDrive.deleteMany({});
    const drives = await JobDrive.create([
      {
        companyName: 'Uber',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
        roleTitle: 'SWE',
        packageLPA: '₹38 LPA',
        location: 'Bengaluru',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        type: 'Full Time',
        eligibilityCGPA: 8.5,
        description: 'Engineering the future of autonomous ride-hailing and dispatch optimization engines.',
        skillsRequired: ['Go', 'Java', 'Distributed Systems', 'Kafka', 'Redis'],
        selectionProcess: ['CodeSignal OA', 'System Architecture Round', 'Data Structures Deep-Dive', 'Leadership Principles'],
        status: 'Published',
        publishedAt: new Date(),
        publishedBy: 'Placement Cell',
      },
      {
        companyName: 'Amazon',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        roleTitle: 'SDE Intern & FTE Hybrid Drive',
        packageLPA: '₹1.1L/mo Intern ➔ ₹29.5 LPA FTE',
        location: 'Hyderabad / Chennai',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        type: 'Both',
        eligibilityCGPA: 7.0,
        description: 'Work on Amazon AWS and Prime Video scaling infrastructure. Experience high throughput low-latency engineering.',
        skillsRequired: ['Java', 'Python', 'AWS', 'Problem Solving', 'SQL'],
        selectionProcess: ['Online Coding & Behavior Assessment', 'Technical Interview 1', 'Technical Interview 2', 'Bar Raiser Round'],
        status: 'Published',
        publishedAt: new Date(),
        publishedBy: 'Placement Cell',
      },
      {
        companyName: 'Microsoft',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        roleTitle: 'Software Engineer – Azure Cloud',
        packageLPA: '₹28 LPA',
        location: 'Noida / Bengaluru',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: 'Full Time',
        eligibilityCGPA: 7.5,
        description: 'Build microservices and enterprise cloud solutions powering Azure. Work closely with global product architecture teams.',
        skillsRequired: ['C#', '.NET', 'TypeScript', 'Azure', 'System Design'],
        selectionProcess: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'AA Round'],
        status: 'Published',
        publishedAt: new Date(),
        publishedBy: 'Placement Cell',
      },
      {
        companyName: 'Google',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
        roleTitle: 'Software Development Engineer (SDE-1)',
        packageLPA: '₹32 LPA',
        location: 'Bengaluru / Hyderabad',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        type: 'Full Time',
        eligibilityCGPA: 8.0,
        description: 'Join Google core infrastructure team. Develop high-availability distributed systems, cloud computing platforms, and high-performance ML pipelines.',
        skillsRequired: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Distributed Systems'],
        selectionProcess: ['Online Assessment', 'Technical Round 1 (Data Structures)', 'Technical Round 2 (System Design)', 'Googliness / HR Round'],
        status: 'Published',
        publishedAt: new Date(),
        publishedBy: 'Placement Cell',
      },
    ]);
    console.log(`✅ Seeded ${drives.length} active placement drives.`);

    // 2. Find default student
    const student = await User.findOne({ email: 'john@student.edu' });
    if (student) {
      // Seed Student Profile
      let profile = await Profile.findOne({ user: student._id });
      if (!profile) {
        await Profile.create({
          user: student._id,
          phone: '+91 9876543210',
          dob: new Date('2003-05-15'),
          gender: 'Male',
          address: 'Campus Hostel Block 4, Tech University',
          registrationNumber: 'REG-2022-CS001',
          department: 'Computer Science & Engineering',
          branch: 'Computer Science',
          semester: 7,
          cgpa: 8.85,
          backlogs: 0,
          codingProfiles: {
            github: 'https://github.com/john-doe',
            linkedin: 'https://linkedin.com/in/john-doe',
            leetcode: 'https://leetcode.com/john-doe',
            codechef: 'https://codechef.com/users/john-doe',
            codeforces: 'https://codeforces.com/profile/john-doe',
            portfolio: 'https://johndoe.dev',
          },
          preferredRoles: ['Software Engineer', 'Full Stack Developer', 'Backend Engineer'],
          preferredLocations: ['Bengaluru', 'Hyderabad', 'Remote'],
          expectedPackage: '15 LPA - 30 LPA',
          workType: 'Full Time',
        });
        console.log('✅ Seeded detailed student profile.');
      }

      // Seed Student Skills
      const existingSkills = await Skill.find({ user: student._id });
      if (existingSkills.length === 0) {
        await Skill.create([
          { user: student._id, name: 'C++', category: 'Programming Languages', proficiency: 90 },
          { user: student._id, name: 'JavaScript / TypeScript', category: 'Programming Languages', proficiency: 85 },
          { user: student._id, name: 'React.js & Vite', category: 'Frameworks', proficiency: 88 },
          { user: student._id, name: 'Node.js & Express', category: 'Frameworks', proficiency: 82 },
          { user: student._id, name: 'MongoDB & PostgreSQL', category: 'Databases', proficiency: 80 },
          { user: student._id, name: 'Docker & Git', category: 'Tools', proficiency: 75 },
        ]);
        console.log('✅ Seeded initial student skills.');
      }

      // Seed Student Projects
      const existingProjects = await Project.find({ user: student._id });
      if (existingProjects.length === 0) {
        await Project.create([
          {
            user: student._id,
            title: 'PlacementHub SaaS Portal',
            description: 'Full-stack placement management system with role-based routing, JWT authentication, and interactive application trackers.',
            technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
            githubLink: 'https://github.com/john-doe/placement-hub',
            liveLink: 'https://placementhub.dev',
          },
          {
            user: student._id,
            title: 'Distributed Distributed KV Store',
            description: 'High-throughput in-memory key-value cache built in Go supporting raft consensus algorithm.',
            technologies: ['Go', 'Raft', 'gRPC', 'Protobuf'],
            githubLink: 'https://github.com/john-doe/raft-kvstore',
          },
        ]);
        console.log('✅ Seeded initial student projects.');
      }

      // Seed Student Applications
      await Application.create([
        {
          user: student._id,
          jobDrive: drives[0]._id,
          companyName: drives[0].companyName,
          companyLogo: drives[0].companyLogo,
          roleTitle: drives[0].roleTitle,
          packageLPA: drives[0].packageLPA,
          location: drives[0].location,
          deadline: drives[0].deadline,
          stage: 'Applied',
        },
        {
          user: student._id,
          jobDrive: drives[1]._id,
          companyName: drives[1].companyName,
          companyLogo: drives[1].companyLogo,
          roleTitle: drives[1].roleTitle,
          packageLPA: drives[1].packageLPA,
          location: drives[1].location,
          deadline: drives[1].deadline,
          stage: 'OA',
        },
        {
          user: student._id,
          jobDrive: drives[2]._id,
          companyName: drives[2].companyName,
          companyLogo: drives[2].companyLogo,
          roleTitle: drives[2].roleTitle,
          packageLPA: drives[2].packageLPA,
          location: drives[2].location,
          deadline: drives[2].deadline,
          stage: 'Interview',
        },
      ]);
      console.log('✅ Seeded student applications for Kanban board.');

      // Seed Notifications
      await Notification.deleteMany({ user: student._id });
      await Notification.create([
        {
          user: student._id,
          title: 'Google SDE Drive Active!',
          message: 'Google SDE-1 recruitment drive is now live. Application deadline: 10 days remaining.',
          type: 'Drive',
          isRead: false,
        },
        {
          user: student._id,
          title: 'Microsoft OA Scheduled',
          message: 'Your Online Assessment for Microsoft Azure Cloud Software Engineer is scheduled for tomorrow at 4:00 PM.',
          type: 'Update',
          isRead: false,
        },
        {
          user: student._id,
          title: 'Campus Pre-Placement Talk',
          message: 'Uber Engineering Leadership Pre-Placement Talk on Friday at Main Auditorium.',
          type: 'Announcement',
          isRead: true,
        },
      ]);
      console.log('✅ Seeded student notifications.');
    }

    console.log('[SeedPhase2] Completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[SeedPhase2 Error]', error);
    process.exit(1);
  }
};

seedPhase2();
