/**
 * Automatic Gmail Application Synchronization Scheduler
 * Runs periodically (default every 10 minutes in production, every 1 minute in dev) to check connected Gmail accounts for job updates.
 */

const cron = require('node-cron');
const EmailConnection = require('../models/EmailConnection');
const { syncUserGmail } = require('../services/gmailSyncService');

let cronScheduledTask = null;

/**
 * Runs a single sync pass across all active connected Gmail accounts.
 * Safe for background execution, manual triggers, and testing.
 * @param {Object} io Socket.IO Server Instance (optional)
 */
const runGmailSyncOnce = async (io = null) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[Gmail Auto Sync] Cron triggered at ${timestamp}`);

  try {
    // 1. Query connected users with active Gmail integration
    const activeConnections = await EmailConnection.find({ connected: true }).select('user connected email');

    console.log(`[Gmail Auto Sync] Connected users found: ${activeConnections ? activeConnections.length : 0}`);

    if (!activeConnections || activeConnections.length === 0) {
      console.log('[Gmail Auto Sync] No connected Gmail accounts found. Skipping run.\n');
      return { totalUsers: 0, syncedUsers: 0 };
    }

    let syncedUsers = 0;
    let totalCreated = 0;
    let totalUpdated = 0;

    // 2. Process users independently with error isolation
    for (const conn of activeConnections) {
      const userId = conn.user;
      console.log(`[Gmail Auto Sync] Starting sync for user ${userId} (${conn.email || 'N/A'})`);

      try {
        const result = await syncUserGmail(userId, io);

        syncedUsers++;
        totalCreated += result.applicationsCreated || 0;
        totalUpdated += result.applicationsUpdated || 0;

        console.log(`[Gmail Auto Sync] User ${userId}: scanned=${result.scanned}, jobEmailsDetected=${result.jobEmailsDetected}, applicationsCreated=${result.applicationsCreated}, applicationsUpdated=${result.applicationsUpdated}, duplicatesSkipped=${result.ignored}`);
      } catch (userErr) {
        // Error isolation: One user's failure must NOT stop synchronization for other users
        console.error(`[Gmail Auto Sync] ERROR syncing user ${userId}:`, userErr.message);
      }
    }

    console.log(`[Gmail Auto Sync] Completed sync pass at ${new Date().toISOString()}. Total created: ${totalCreated}, updated: ${totalUpdated}\n`);

    return {
      totalUsers: activeConnections.length,
      syncedUsers,
      totalCreated,
      totalUpdated,
    };
  } catch (err) {
    console.error(`[Gmail Auto Sync] ERROR: ${err.message}`);
    return { totalUsers: 0, syncedUsers: 0, error: err.message };
  }
};

/**
 * Initializes the cron scheduler exactly once.
 * Configurable via environment variables:
 * - GMAIL_AUTO_SYNC_ENABLED (default: 'true')
 * - GMAIL_AUTO_SYNC_INTERVAL (default: 1 min in dev, 10 mins in prod)
 * @param {Object} io Socket.IO Server Instance (optional)
 */
const initGmailSyncJob = (io = null) => {
  const isEnabled = process.env.GMAIL_AUTO_SYNC_ENABLED !== 'false';
  // Default to 1 minute in development mode for fast testing, 10 minutes in production
  const defaultInterval = process.env.NODE_ENV === 'production' ? '*/10 * * * *' : '*/1 * * * *';
  const cronExpression = process.env.GMAIL_AUTO_SYNC_INTERVAL || defaultInterval;

  if (!isEnabled) {
    console.log('[Gmail Auto Sync] Scheduler DISABLED');
    console.log('[Gmail Auto Sync] Reason: GMAIL_AUTO_SYNC_ENABLED is set to false');
    return null;
  }

  if (cronScheduledTask) {
    console.log('[Gmail Auto Sync] Scheduler already initialized.');
    return cronScheduledTask;
  }

  if (!cron.validate(cronExpression)) {
    console.error(`[Gmail Auto Sync] Invalid cron expression: "${cronExpression}". Scheduler NOT started.`);
    return null;
  }

  console.log('[Gmail Auto Sync] Scheduler started');
  console.log(`[Gmail Auto Sync] Schedule: ${cronExpression}`);

  cronScheduledTask = cron.schedule(cronExpression, async () => {
    try {
      await runGmailSyncOnce(io);
    } catch (cronErr) {
      console.error('[Gmail Auto Sync] Unhandled cron execution error:', cronErr.message);
    }
  });

  return cronScheduledTask;
};

/**
 * Stops the running cron job (useful for graceful shutdown or automated tests)
 */
const stopGmailSyncJob = () => {
  if (cronScheduledTask) {
    cronScheduledTask.stop();
    cronScheduledTask = null;
    console.log('[Gmail Auto Sync] Scheduler stopped cleanly.');
  }
};

module.exports = {
  initGmailSyncJob,
  stopGmailSyncJob,
  runGmailSyncOnce,
};
