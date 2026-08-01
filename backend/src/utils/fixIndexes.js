const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementhub');
    console.log('Connected to MongoDB...');
    const db = mongoose.connection.db;

    // Remove invalid documents without email
    await db.collection('students').deleteMany({ email: null });
    console.log('Cleaned up null email records.');

    await db.collection('students').dropIndexes();
    console.log('✅ Successfully dropped old student indexes.');

    const Student = require('../models/Student');
    await Student.syncIndexes();
    console.log('✅ Successfully synchronized new Student indexes (email, rollNumber, googleId).');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
