const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config();

const cleanDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementhub';
    await mongoose.connect(mongoUri);
    console.log('[CleanDB] Connected to MongoDB...');

    const db = mongoose.connection.db;

    // Drop users collection to clear all legacy roles and indexes
    try {
      await db.collection('users').drop();
      console.log('✅ Dropped legacy users collection.');
    } catch (e) {
      // Collection might not exist
    }

    try {
      await db.collection('students').drop();
    } catch (e) {}

    try {
      await db.collection('placementcells').drop();
    } catch (e) {}

    // Synchronize Mongoose User indexes
    await User.syncIndexes();
    console.log('✅ Synchronized clean User model indexes (enum: [student, placement]).');

    // Re-seed Placement Cell Officer Account
    await User.create({
      name: 'Head of Placement Cell',
      email: 'officer@placement.edu',
      password: 'placement123password',
      role: 'placement',
      authProvider: 'local',
    });
    console.log('✅ Created Placement Cell Account: officer@placement.edu / placement123password');

    // Re-seed Student Account
    await User.create({
      name: 'John Doe',
      email: 'john@student.edu',
      password: 'student123password',
      rollNumber: 'CS2026001',
      role: 'student',
      authProvider: 'local',
    });
    console.log('✅ Created Student Account: john@student.edu / student123password');

    console.log('[CleanDB] Database cleanup & seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[CleanDB Error]', error);
    process.exit(1);
  }
};

cleanDatabase();
