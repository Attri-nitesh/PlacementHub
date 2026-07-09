const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Check if SMTP settings are configured in environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('Nodemailer: Custom SMTP Transporter active');
  } else {
    // Generate a temporary Ethereal test account if credentials are not provided
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('Nodemailer: Configured Ethereal Test Account');
      console.log(`Mock Username: ${testAccount.user}`);
    } catch (err) {
      console.error('Failed to configure test mail account:', err.message);
    }
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const activeTransporter = await getTransporter();
    if (!activeTransporter) {
      console.error('Nodemailer not configured, email could not be sent');
      return null;
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || '"PlacementHub" <noreply@placementhub.com>',
      to,
      subject,
      html
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`Email Sent ID: ${info.messageId}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Email Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error('Email Dispatch Error:', error.message);
    return null;
  }
};

module.exports = { sendEmail };
