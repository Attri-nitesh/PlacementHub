const cron = require('node-cron');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { emitSocketNotification } = require('../config/socket');
const { sendEmail } = require('../config/mailer');
const { deadlineTemplate } = require('../utils/emailTemplates');

const initCronJobs = () => {
  // Execute job daily at midnight: '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('node-cron: Running daily application deadline checks...');
    try {
      const today = new Date();
      
      // Calculate date boundary for exactly 3 days from now
      const threeDaysAheadStart = new Date(today);
      threeDaysAheadStart.setDate(today.getDate() + 3);
      threeDaysAheadStart.setHours(0, 0, 0, 0);

      const threeDaysAheadEnd = new Date(today);
      threeDaysAheadEnd.setDate(today.getDate() + 3);
      threeDaysAheadEnd.setHours(23, 59, 59, 999);

      // Find active drives closing in exactly 3 days
      const closingDrives = await PlacementDrive.find({
        status: 'active',
        deadline: { $gte: threeDaysAheadStart, $lte: threeDaysAheadEnd }
      });

      console.log(`node-cron: Found ${closingDrives.length} drives closing in 3 days.`);

      for (const drive of closingDrives) {
        // Fetch all registered student accounts
        const students = await User.find({ role: 'student' });

        for (const student of students) {
          // Check if this student has already submitted an application
          const applied = await Application.findOne({
            student: student._id,
            drive: drive._id
          });

          // Send warning if they have not applied yet
          if (!applied) {
            // Save in-app notification
            const notif = await Notification.create({
              recipient: student._id,
              title: `Deadline Approaching: ${drive.companyName}`,
              message: `The deadline to apply for ${drive.companyName} (${drive.jobRole}) is in 3 days. Apply now!`,
              type: 'reminder'
            });

            // Emit live Socket notification
            emitSocketNotification(student._id, 'deadline_reminder', {
              notificationId: notif._id,
              title: notif.title,
              message: notif.message,
              type: notif.type,
              driveId: drive._id
            });

            // Send Reminder Email
            await sendEmail({
              to: student.email,
              subject: `PlacementHub Reminder: Apply for ${drive.companyName} by ${new Date(drive.deadline).toLocaleDateString()}`,
              html: deadlineTemplate(student.name, drive)
            });
          }
        }
      }
    } catch (err) {
      console.error('node-cron: Error running application checks:', err.message);
    }
  });
};

module.exports = { initCronJobs };
