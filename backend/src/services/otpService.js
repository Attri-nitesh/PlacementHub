const crypto = require('crypto');

/**
 * Enterprise OTP Service with Twilio Verify Integration & Local Development Simulator
 */

// Helper to hash OTP with SHA-256 for secure database storage
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

// Generate 6-Digit Random Numeric OTP
const generateNumericOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Dispatch SMS OTP via Twilio Verify or Local DEV Simulator
 * @param {string} phone 
 * @returns {Promise<{ otp: string, hash: string, isTwilio: boolean }>}
 */
const sendPhoneSmsOtp = async (phone) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  const otp = generateNumericOtp();
  const hash = hashOtp(otp);

  if (accountSid && authToken && serviceSid) {
    try {
      const twilio = require('twilio')(accountSid, authToken);
      await twilio.verify.v2.services(serviceSid).verifications.create({
        to: phone.startsWith('+') ? phone : `+91${phone}`,
        channel: 'sms',
      });
      console.log(`[TWILIO SMS] Sent 6-digit verification code to ${phone}`);
      return { otp, hash, isTwilio: true };
    } catch (twilioErr) {
      console.warn('[TWILIO SMS ERROR] Falling back to DEV Simulator:', twilioErr.message);
    }
  }

  // --- LOCAL DEVELOPMENT SIMULATOR ---
  console.log('\n========================================================');
  console.log('  [DEV ONLY SMS SIMULATOR] 📱 ENTERPRISE OTP VERIFICATION  ');
  console.log(`  Target Phone Number : ${phone}`);
  console.log(`  Generated 6-Digit OTP: ${otp}`);
  console.log(`  Valid For           : 5 Minutes (Expires at ${new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString()})`);
  console.log('========================================================\n');

  return { otp, hash, isTwilio: false };
};

/**
 * Verify Entered OTP
 * @param {string} enteredOtp 
 * @param {string} storedHash 
 * @returns {boolean}
 */
const verifyOtpHash = (enteredOtp, storedHash) => {
  if (!enteredOtp || !storedHash) return false;
  const computedHash = hashOtp(enteredOtp);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
};

module.exports = {
  hashOtp,
  generateNumericOtp,
  sendPhoneSmsOtp,
  verifyOtpHash,
};
