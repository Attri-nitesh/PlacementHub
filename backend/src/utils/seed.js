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
      console.log('✅ Default Student account created: john@student.edu / student123password');
    } else {
      console.log('ℹ️ Student account exists: john@student.edu');
    }

    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
