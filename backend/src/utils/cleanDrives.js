const dotenv = require('dotenv');
const mongoose = require('mongoose');
const JobDrive = require('../models/JobDrive');
const Company = require('../models/Company');

dotenv.config();

const cleanDrives = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementhub';
    await mongoose.connect(mongoUri);
    console.log('[CleanDrives] Connected to MongoDB...');

    // 1. Ensure Companies exist in Company collection
    let uberComp = await Company.findOne({ name: /Uber/i });
    if (!uberComp) {
      uberComp = await Company.create({
        name: 'Uber',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
        description: 'Pioneering mobility, dispatch routing algorithms, and autonomous transportation platforms.',
        website: 'https://uber.com/careers',
        industry: 'Mobility & Logistics',
        location: 'Bengaluru',
        status: 'Active',
      });
    }

    let amazonComp = await Company.findOne({ name: /Amazon/i });
    if (!amazonComp) {
      amazonComp = await Company.create({
        name: 'Amazon',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        description: 'World leading cloud infrastructure provider driving global ecommerce and serverless architectures.',
        website: 'https://amazon.jobs',
        industry: 'Ecommerce & Cloud',
        location: 'Hyderabad / Chennai',
        status: 'Active',
      });
    }

    let msftComp = await Company.findOne({ name: /Microsoft/i });
    if (!msftComp) {
      msftComp = await Company.create({
        name: 'Microsoft',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        description: 'Empowering people and organizations through Azure, Windows, and enterprise SaaS solutions.',
        website: 'https://careers.microsoft.com',
        industry: 'Enterprise Software & Cloud',
        location: 'Noida / Bengaluru',
        status: 'Active',
      });
    }

    let googleComp = await Company.findOne({ name: /Google/i });
    if (!googleComp) {
      googleComp = await Company.create({
        name: 'Google',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
        description: 'Global technology leader specializing in search engine, cloud computing, and AI infrastructure.',
        website: 'https://careers.google.com',
        industry: 'Cloud & AI Infrastructure',
        location: 'Bengaluru / Hyderabad',
        status: 'Active',
      });
    }

    // 2. Define the exact 4 demo placement drives required
    const targetDrives = [
      {
        company: uberComp._id,
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
        company: amazonComp._id,
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
        company: msftComp._id,
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
        company: googleComp._id,
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
    ];

    // Delete all current demo drives and re-seed the exact 4
    await JobDrive.deleteMany({});
    const created = await JobDrive.create(targetDrives);
    console.log(`✅ [CleanDrives] Successfully updated database. Current demo placement drives count: ${created.length}`);
    created.forEach((d, idx) => {
      console.log(`   ${idx + 1}. ${d.companyName} — Role: "${d.roleTitle}" (${d.packageLPA}) [Status: ${d.status}]`);
    });

    process.exit(0);
  } catch (err) {
    console.error('[CleanDrives Error]', err);
    process.exit(1);
  }
};

cleanDrives();
