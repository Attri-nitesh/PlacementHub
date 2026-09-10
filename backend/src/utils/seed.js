const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementhub';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB...');

    // 1. Placement Cell Account
    const existingPlacement = await User.findOne({ email: 'officer@placement.edu' });
    if (!existingPlacement) {
      await User.create({
        name: 'Head of Placement Cell',
        email: 'officer@placement.edu',
        password: 'placement123password',
        role: 'placement',
        authProvider: 'local',
      });
      console.log('✅ Default Placement Cell account created: officer@placement.edu / placement123password');
    } else {
      console.log('ℹ️ Placement Cell account exists: officer@placement.edu');
    }

    // 2. Student Demo Account
    const existingStudent = await User.findOne({ email: 'john@student.edu' });
    if (!existingStudent) {
      await User.create({
        name: 'John Doe',
        email: 'john@student.edu',
        password: 'student123password',
        rollNumber: 'CS2026001',
        role: 'student',
        authProvider: 'local',
      });
      console.log('ℹ️ Student account exists: john@student.edu');
    }

    // 3. Super Admin Demo Account
    const existingAdminCom = await User.findOne({ email: 'admin@placementhub.com' });
    if (!existingAdminCom) {
      await User.create({
        name: 'Super Administrator',
        email: 'admin@placementhub.com',
        password: 'Admin@123',
        role: 'admin',
        authProvider: 'local',
      });
      console.log('✅ Default Super Admin account created: admin@placementhub.com / Admin@123');
    }

    const existingAdmin = await User.findOne({ email: 'admin@placementhub.edu' });
    if (!existingAdmin) {
      await User.create({
        name: 'Super System Administrator',
        email: 'admin@placementhub.edu',
        password: 'admin123password',
        role: 'admin',
        authProvider: 'local',
      });
      console.log('✅ Default Super Admin account created: admin@placementhub.edu / admin123password');
    }

    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
