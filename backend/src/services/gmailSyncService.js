const { google } = require('googleapis');
const EmailConnection = require('../models/EmailConnection');
const ProcessedEmail = require('../models/ProcessedEmail');
const Application = require('../models/Application');
const { decryptToken, encryptToken } = require('../utils/cryptoUtils');
const { getOAuth2Client } = require('./googleOAuthService');
const { normalizeGmailMessage } = require('../utils/gmailNormalizer');
const { classifyJobEmail, THRESHOLDS } = require('./jobEmailClassifier');
const {
  extractCompany,
  extractJobTitle,
  extractExternalAppId,
  calculateTitleSimilarity,
  normalizeString,
} = require('./jobEmailParser');

// In-memory concurrency lock map to prevent overlapping syncs per user
const activeSyncUsers = new Set();

// Application Stage Hierarchy / Rank for Status Progression Protection
const STAGE_RANK = {
  'Applied': 1,
  'Resume Shortlisted': 2,
  'OA': 3,
  'Interview': 4,
  'Selected': 5,
  'Offer Released': 5,
  'Rejected': 5,
};

// Terminal Application States
const TERMINAL_STAGES = new Set(['Rejected', 'Offer Released', 'Selected']);

// Event to Application Stage Mapping
const EVENT_TO_STAGE = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Resume Shortlisted',
  ONLINE_ASSESSMENT: 'OA',
  INTERVIEW: 'Interview',
  OFFER: 'Offer Released',
  REJECTED: 'Rejected',
};

/**
 * Main Gmail Automatic Job Application Sync Engine
 * @param {String} userId PlacementHub User ID
 * @param {Object} io Socket.IO Server Instance (optional)
 */
const syncUserGmail = async (userId, io = null) => {
  if (activeSyncUsers.has(userId.toString())) {
    return {
      success: false,
      skipped: true,
      reason: 'Sync already in progress for this account.',
      scanned: 0,
      jobEmailsDetected: 0,
      applicationsCreated: 0,
      applicationsUpdated: 0,
      ignored: 0,
    };
  }

  activeSyncUsers.add(userId.toString());

  try {
    // 1. Find user's EmailConnection
    const connection = await EmailConnection.findOne({ user: userId, connected: true });
    if (!connection) {
      throw new Error('No active Gmail connection found for this user.');
    }

    // 2. Decrypt OAuth Credentials
    const accessToken = decryptToken(connection.accessToken);
    const refreshToken = decryptToken(connection.refreshToken);

    if (!accessToken && !refreshToken) {
      throw new Error('OAuth credentials missing or corrupted. Please reconnect Gmail.');
    }

    // 3. Initialize Google OAuth2 Client & credentials
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Refresh access token if expired
    if (connection.tokenExpiry && new Date() > new Date(connection.tokenExpiry)) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        if (credentials.access_token) {
          connection.accessToken = encryptToken(credentials.access_token);
          if (credentials.expiry_date) {
            connection.tokenExpiry = new Date(credentials.expiry_date);
          }
          await connection.save();
        }
      } catch (refreshErr) {
        console.error(`[Gmail Sync] Failed to refresh token for user ${userId}:`, refreshErr.message);
        const isAuthRevoked =
          refreshErr.message &&
          (refreshErr.message.includes('invalid_grant') || refreshErr.message.includes('unauthorized'));

        if (isAuthRevoked) {
          connection.connected = false;
          await connection.save().catch(() => {});
          throw new Error('Gmail authorization expired. Please reconnect Gmail in Settings.');
        }
        // For temporary network/SSL proxy errors, do NOT disconnect account in DB
        throw refreshErr;
      }
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 4. Construct Gmail Search Query (Includes Inbox & Spam, excludes Trash, scans recent 7 days)
    const searchQuery = '( "thank you for applying" OR "application received" OR "application status" OR "online assessment" OR "coding assessment" OR "interview" OR "offer letter" OR "unfortunately" OR "shortlisted" ) -in:trash newer_than:7d';

    // Fetch candidate messages from INBOX and SPAM (includeSpamTrash: true + -in:trash query)
    let listRes;
    try {
      listRes = await gmail.users.messages.list({
        userId: 'me',
        q: searchQuery,
        includeSpamTrash: true, // Enables scanning SPAM folder while excluding Trash via query
        maxResults: 25,
      });
    } catch (apiErr) {
      const isAuthRevoked =
        apiErr.code === 401 ||
        (apiErr.message && (apiErr.message.includes('invalid_grant') || apiErr.message.includes('unauthorized')));

      if (isAuthRevoked) {
        connection.connected = false;
        await connection.save().catch(() => {});
        throw new Error('Gmail authorization revoked or expired. Please reconnect Gmail.');
      }
      throw apiErr;
    }

    const messages = listRes.data.messages || [];

    let scannedCount = messages.length;
    let jobEmailsDetected = 0;
    let applicationsCreated = 0;
    let applicationsUpdated = 0;
    let duplicatesReconciled = 0;
    let pendingReview = 0;
    let ignored = 0;

    // 5. Process each candidate message through the exact same classification & matching pipeline
    for (const msgRef of messages) {
      const messageId = msgRef.id;

      // Check if already processed
      const existingRecord = await ProcessedEmail.findOne({ user: userId, gmailMessageId: messageId });
      if (existingRecord) {
        continue; // Skip duplicate processing (Idempotency guarantee)
      }

      // Retrieve full message payload
      let rawMessage;
      try {
        const msgGetRes = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: 'full',
        });
        rawMessage = msgGetRes.data;
      } catch (fetchErr) {
        console.warn(`[Gmail Sync] Failed to fetch message ${messageId}:`, fetchErr.message);
        continue;
      }

      // Normalize message headers, body, and label IDs (INBOX vs SPAM)
      const normalized = normalizeGmailMessage(rawMessage);

      // Classify email event & calculate confidence
      const classification = classifyJobEmail(normalized);

      // Extract Company, Role Title, and External Application ID
      const company = extractCompany(normalized);
      const jobTitle = extractJobTitle(normalized);
      const externalAppId = extractExternalAppId(normalized);

      // Safe Development Debug Logging
      console.log('\n============================================================');
      console.log(`[EMAIL SYNC] messageId: ${messageId}`);
      console.log(`[EMAIL SYNC] Gmail source/label: ${normalized.gmailSource} (labels: ${normalized.labelIds.join(', ')})`);
      console.log(`[EMAIL SYNC] subject: "${normalized.subject}"`);
      console.log(`[EMAIL SYNC] sender: ${normalized.sender} <${normalized.senderEmail}>`);
      console.log(`[CLASSIFIER] isJobEmail: ${classification.isJobEmail} | eventType: ${classification.eventType} | confidence: ${classification.confidence}`);
      console.log(`[CLASSIFIER] matchedSignals:`, classification.matchedSignals);
      console.log(`[PARSER] company: "${company}" | jobTitle: "${jobTitle}" | externalJobId: ${externalAppId || 'N/A'}`);

      if (!classification.isJobEmail || classification.confidence < THRESHOLDS.LOW) {
        console.log(`[ACTION] IGNORED (Not a job email or confidence < ${THRESHOLDS.LOW})`);
        console.log('============================================================\n');

        await ProcessedEmail.create({
          user: userId,
          emailConnection: connection._id,
          gmailMessageId: messageId,
          gmailThreadId: normalized.gmailThreadId,
          sender: normalized.sender,
          senderEmail: normalized.senderEmail,
          subject: normalized.subject,
          receivedAt: normalized.receivedAt,
          eventType: 'UNKNOWN',
          confidence: classification.confidence,
          company,
          jobTitle,
          action: 'IGNORED',
        });
        ignored++;
        continue;
      }

      jobEmailsDetected++;

      // Medium Confidence -> PENDING_REVIEW (Do not touch Kanban)
      if (classification.confidence < THRESHOLDS.HIGH) {
        console.log(`[ACTION] PENDING_REVIEW (Confidence ${classification.confidence} < ${THRESHOLDS.HIGH})`);
        console.log('============================================================\n');

        await ProcessedEmail.create({
          user: userId,
          emailConnection: connection._id,
          gmailMessageId: messageId,
          gmailThreadId: normalized.gmailThreadId,
          sender: normalized.sender,
          senderEmail: normalized.senderEmail,
          subject: normalized.subject,
          receivedAt: normalized.receivedAt,
          eventType: classification.eventType,
          confidence: classification.confidence,
          company,
          jobTitle,
          action: 'PENDING_REVIEW',
        });
        pendingReview++;
        continue;
      }

      // High Confidence (>= 0.85) -> Match or Create Application
      const mappedStage = EVENT_TO_STAGE[classification.eventType] || 'Applied';
      const isStatusUpdateEmail = ['REJECTED', 'INTERVIEW', 'ONLINE_ASSESSMENT', 'SHORTLISTED', 'OFFER'].includes(
        classification.eventType
      );

      // MULTI-CANDIDATE EVALUATION & RECONCILIATION ENGINE
      let matchedApp = null;
      let matchReason = 'NONE';
      let matchScore = 0;

      const companyRegex = new RegExp(`^${company.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      const companyApps = await Application.find({ user: userId, companyName: companyRegex });

      console.log(`[MATCHING] Found ${companyApps.length} candidate application(s) for company "${company}":`);
      companyApps.forEach((app) => {
        console.log(`   └─ ID: ${app._id} | Role: "${app.roleTitle}" | Stage: ${app.stage} | autoTracked: ${Boolean(app.autoTracked)} | hasDrive: ${Boolean(app.jobDrive)}`);
      });

      // Find all matching candidates with title similarity >= 0.70 (with acronym expansion)
      const candidateMatches = [];

      for (const candApp of companyApps) {
        let sim = calculateTitleSimilarity(jobTitle, candApp.roleTitle);
        if (externalAppId && candApp.externalAppId === externalAppId) {
          sim = 1.0;
        }
        if (sim >= 0.70) {
          candidateMatches.push({ app: candApp, sim });
        }
      }

      if (candidateMatches.length > 0) {
        // Sort candidate matches to select the canonical original application
        candidateMatches.sort((a, b) => {
          // Priority 1: Manual / Placement Cell Drive application (autoTracked === false or jobDrive present) over autoTracked
          const manualA = a.app.autoTracked === false || Boolean(a.app.jobDrive);
          const manualB = b.app.autoTracked === false || Boolean(b.app.jobDrive);
          if (manualA !== manualB) return manualA ? -1 : 1;

          // Priority 2: Active non-terminal state over terminal state
          const termA = TERMINAL_STAGES.has(a.app.stage);
          const termB = TERMINAL_STAGES.has(b.app.stage);
          if (termA !== termB) return termA ? 1 : -1;

          // Priority 3: Higher role title similarity score
          if (b.sim !== a.sim) return b.sim - a.sim;

          // Priority 4: Earliest creation date
          return new Date(a.app.createdAt) - new Date(b.app.createdAt);
        });

        matchedApp = candidateMatches[0].app;
        matchScore = candidateMatches[0].sim;
        matchReason = 'MULTI_CANDIDATE_CANONICAL_MATCH';

        // HISTORICAL DUPLICATE RECONCILIATION: Merge & remove accidental duplicate applications created earlier
        if (candidateMatches.length > 1) {
          console.log(`[RECONCILIATION] Reconciling ${candidateMatches.length - 1} accidental duplicate application(s)...`);
          for (let i = 1; i < candidateMatches.length; i++) {
            const dupApp = candidateMatches[i].app;
            console.log(`[RECONCILIATION] Merging and deleting duplicate application ${dupApp._id} ("${dupApp.roleTitle}", stage: ${dupApp.stage})`);

            // Merge timeline history into canonical application
            if (dupApp.timeline && Array.isArray(dupApp.timeline)) {
              for (const entry of dupApp.timeline) {
                const exists = matchedApp.timeline.some(
                  (t) => t.stage === entry.stage && new Date(t.date).getTime() === new Date(entry.date).getTime()
                );
                if (!exists) {
                  matchedApp.timeline.push(entry);
                }
              }
            }

            // Merge external App ID if missing
            if (!matchedApp.externalAppId && dupApp.externalAppId) {
              matchedApp.externalAppId = dupApp.externalAppId;
            }

            // Safely delete duplicate application record
            await dupApp.deleteOne();
            duplicatesReconciled++;
          }
        }
      } else if (isStatusUpdateEmail && companyApps.length > 0) {
        // Fallback for status updates when no candidate exceeded 0.70 similarity
        let bestCandidate = null;
        let maxSim = -1;
        for (const candApp of companyApps) {
          const sim = calculateTitleSimilarity(jobTitle, candApp.roleTitle);
          if (sim > maxSim) {
            maxSim = sim;
            bestCandidate = candApp;
          }
        }

        if (companyApps.length === 1 || maxSim >= 0.40) {
          matchedApp = bestCandidate || companyApps[0];
          matchReason = 'STATUS_UPDATE_COMPANY_FALLBACK';
          matchScore = maxSim > 0 ? maxSim : 0.5;
        }
      }

      console.log(`[MATCHING] selectedCanonicalApplicationId: ${matchedApp ? matchedApp._id : 'NONE'}`);
      console.log(`[MATCHING] matchReason: ${matchReason} | matchScore: ${matchScore}`);
      console.log(`[MATCHING] duplicatesReconciled: ${duplicatesReconciled}`);

      if (matchedApp) {
        // UPDATE EXISTING APPLICATION WITH TERMINAL STATE & PROGRESSION PROTECTION
        const currentRank = STAGE_RANK[matchedApp.stage] || 1;
        const newRank = STAGE_RANK[mappedStage] || 1;
        const oldStatus = matchedApp.stage;

        let shouldUpdateStage = false;

        if (TERMINAL_STAGES.has(oldStatus)) {
          if (TERMINAL_STAGES.has(mappedStage)) {
            shouldUpdateStage = true;
          } else {
            console.log(`[ACTION] Terminal safety protected: preserved terminal state ${oldStatus} over incoming stage ${mappedStage}`);
          }
        } else {
          if (mappedStage === 'Rejected' || newRank >= currentRank) {
            shouldUpdateStage = true;
          }
        }

        if (shouldUpdateStage && oldStatus !== mappedStage) {
          matchedApp.stage = mappedStage;
          matchedApp.timeline.push({
            stage: mappedStage,
            date: normalized.receivedAt,
            remarks: `Auto-updated via Gmail ${normalized.gmailSource} (${classification.eventType})`,
            updatedBy: 'Gmail Integration',
          });
          await matchedApp.save();

          console.log(`[ACTION] UPDATED_APPLICATION: ${matchedApp._id} stage changed from ${oldStatus} -> ${mappedStage}`);

          if (io) {
            io.to(`user:${userId}`).emit('application_updated', {
              applicationId: matchedApp._id,
              companyName: matchedApp.companyName,
              roleTitle: matchedApp.roleTitle,
              newStage: mappedStage,
            });
          }
        } else {
          // Even if stage remains the same, save any merged timeline/metadata updates from duplicate reconciliation
          await matchedApp.save();
          console.log(`[ACTION] UPDATED_APPLICATION: Preserved status ${oldStatus} for ${matchedApp._id}`);
          if (io) {
            io.to(`user:${userId}`).emit('application_updated', {
              applicationId: matchedApp._id,
            });
          }
        }

        await ProcessedEmail.create({
          user: userId,
          emailConnection: connection._id,
          gmailMessageId: messageId,
          gmailThreadId: normalized.gmailThreadId,
          sender: normalized.sender,
          senderEmail: normalized.senderEmail,
          subject: normalized.subject,
          receivedAt: normalized.receivedAt,
          eventType: classification.eventType,
          confidence: classification.confidence,
          company,
          jobTitle,
          application: matchedApp._id,
          action: 'UPDATED_APPLICATION',
        });

        applicationsUpdated++;
      } else {
        // DEDUPLICATION CHECK BEFORE CREATING A NEW APPLICATION
        const companyRegex = new RegExp(`^${company.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
        const existingDuplicate = await Application.findOne({
          user: userId,
          companyName: companyRegex,
        });

        if (existingDuplicate && isStatusUpdateEmail) {
          existingDuplicate.stage = mappedStage;
          existingDuplicate.timeline.push({
            stage: mappedStage,
            date: normalized.receivedAt,
            remarks: `Auto-updated via Gmail ${normalized.gmailSource} (${classification.eventType})`,
            updatedBy: 'Gmail Integration',
          });
          await existingDuplicate.save();

          console.log(`[ACTION] DUP_PREVENTED -> UPDATED_APPLICATION: ${existingDuplicate.companyName} stage updated to ${mappedStage}`);

          await ProcessedEmail.create({
            user: userId,
            emailConnection: connection._id,
            gmailMessageId: messageId,
            gmailThreadId: normalized.gmailThreadId,
            sender: normalized.sender,
            senderEmail: normalized.senderEmail,
            subject: normalized.subject,
            receivedAt: normalized.receivedAt,
            eventType: classification.eventType,
            confidence: classification.confidence,
            company,
            jobTitle,
            application: existingDuplicate._id,
            action: 'UPDATED_APPLICATION',
          });

          if (io) {
            io.to(`user:${userId}`).emit('application_updated', {
              applicationId: existingDuplicate._id,
            });
          }

          applicationsUpdated++;
        } else {
          // CREATE NEW APPLICATION
          console.log(`[ACTION] CREATED_APPLICATION: "${company}" | "${jobTitle}" | stage: "${mappedStage}"`);

          const newApp = await Application.create({
            user: userId,
            companyName: company,
            roleTitle: jobTitle,
            packageLPA: 'N/A',
            location: 'Remote / Flexible',
            appliedDate: normalized.receivedAt,
            stage: mappedStage,
            autoTracked: true,
            trackingSource: 'gmail',
            externalAppId,
            timeline: [
              {
                stage: mappedStage,
                date: normalized.receivedAt,
                remarks: `Auto-created via Gmail ${normalized.gmailSource} (${classification.eventType})`,
                updatedBy: 'Gmail Integration',
              },
            ],
          });

          await ProcessedEmail.create({
            user: userId,
            emailConnection: connection._id,
            gmailMessageId: messageId,
            gmailThreadId: normalized.gmailThreadId,
            sender: normalized.sender,
            senderEmail: normalized.senderEmail,
            subject: normalized.subject,
            receivedAt: normalized.receivedAt,
            eventType: classification.eventType,
            confidence: classification.confidence,
            company,
            jobTitle,
            application: newApp._id,
            action: 'CREATED_APPLICATION',
          });

          // Emit Socket.IO Events strictly to this user's room
          if (io) {
            io.to(`user:${userId}`).emit('application_created', {
              applicationId: newApp._id,
              companyName: newApp.companyName,
              roleTitle: newApp.roleTitle,
              stage: mappedStage,
            });
            io.to(`user:${userId}`).emit('application_updated', {
              applicationId: newApp._id,
            });
          }

          applicationsCreated++;
        }
      }

      console.log('============================================================\n');
    }

    // Update lastSyncedAt on successful sync
    connection.lastSyncedAt = new Date();
    await connection.save();

    return {
      success: true,
      scanned: scannedCount,
      jobEmailsDetected,
      applicationsCreated,
      applicationsUpdated,
      duplicatesReconciled,
      pendingReview,
      ignored,
      lastSyncedAt: connection.lastSyncedAt,
    };
  } finally {
    // Release concurrency lock safely in finally block
    activeSyncUsers.delete(userId.toString());
  }
};

module.exports = {
  syncUserGmail,
  STAGE_RANK,
  EVENT_TO_STAGE,
};
