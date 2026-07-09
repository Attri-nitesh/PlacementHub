const welcomeTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px 20px; color: #334155; line-height: 1.6; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to PlacementHub</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for creating an account on <strong>PlacementHub</strong>. Your registration is complete.</p>
      <p>You can now log in, build your profile, add skills, track your applications on the Kanban board, and apply to upcoming placement drives.</p>
      <p>Best of luck with your career search!</p>
    </div>
    <div class="footer">
      &copy; 2026 PlacementHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const resetTemplate = (name, url) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background: #ef4444; color: #ffffff; padding: 35px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px 20px; color: #334155; line-height: 1.6; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #ef4444; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>You are receiving this email because we received a password reset request for your account.</p>
      <p>To proceed with changing your password, please click the button below:</p>
      <a href="${url}" class="btn" target="_blank">Reset Password</a>
      <p>If you did not request this reset, you can safely ignore this email. This link is valid for 10 minutes.</p>
    </div>
    <div class="footer">
      &copy; 2026 PlacementHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const newDriveTemplate = (name, drive) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background: #10b981; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px 20px; color: #334155; line-height: 1.6; }
    .detail-box { background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 15px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Placement Drive Alert!</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>A new placement drive has been announced on PlacementHub. Check the details below to see if you qualify:</p>
      <div class="detail-box">
        <strong>Company:</strong> ${drive.companyName}<br>
        <strong>Job Role:</strong> ${drive.jobRole}<br>
        <strong>Package:</strong> ${drive.package} LPA<br>
        <strong>Location:</strong> ${drive.location}<br>
        <strong>Minimum CGPA Required:</strong> ${drive.eligibilityCgpa}<br>
        <strong>Deadline:</strong> ${new Date(drive.deadline).toLocaleDateString()}<br>
      </div>
      <p>If you meet the requirements, please log in and apply before the deadline!</p>
    </div>
    <div class="footer">
      &copy; 2026 PlacementHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const deadlineTemplate = (name, drive) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background: #f59e0b; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px 20px; color: #334155; line-height: 1.6; }
    .detail-box { background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 15px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reminder: Application Deadline Approaching!</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>This is a friendly reminder that the deadline to apply for the placement drive below is only 3 days away.</p>
      <div class="detail-box">
        <strong>Company:</strong> ${drive.companyName}<br>
        <strong>Job Role:</strong> ${drive.jobRole}<br>
        <strong>Package:</strong> ${drive.package} LPA<br>
        <strong>Deadline:</strong> ${new Date(drive.deadline).toLocaleDateString()}<br>
      </div>
      <p>Don't miss out on this opportunity. Log in to your portal and submit your application today!</p>
    </div>
    <div class="footer">
      &copy; 2026 PlacementHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const statusTemplate = (name, drive, status) => {
  let themeColor = '#3b82f6'; // default blue
  if (status === 'Offer') themeColor = '#10b981'; // green
  if (status === 'Rejected') themeColor = '#ef4444'; // red
  if (status === 'Interview') themeColor = '#8b5cf6'; // purple

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background: ${themeColor}; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 30px 20px; color: #334155; line-height: 1.6; }
    .detail-box { background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 15px 0; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Status Updated</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your application status has been updated for the following job drive:</p>
      <div class="detail-box">
        <strong>Company:</strong> ${drive.companyName}<br>
        <strong>Job Role:</strong> ${drive.jobRole}<br>
        <strong>New Status:</strong> <span style="color: ${themeColor}; font-weight: bold;">${status}</span><br>
      </div>
      <p>Please log in to your dashboard for further details or to track your hiring process.</p>
    </div>
    <div class="footer">
      &copy; 2026 PlacementHub. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
};

module.exports = {
  welcomeTemplate,
  resetTemplate,
  newDriveTemplate,
  deadlineTemplate,
  statusTemplate
};
