const User = require('../models/User');
const sendTokenResponse = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register Student with Email & Password
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, rollNumber } = req.body;

    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Name, Email, Password, Roll Number).',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      rollNumber,
      role: 'student',
      authProvider: 'local',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login with Email & Password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User account not found.',
      });
    }

    // Role check if provided ('student' or 'placement')
    if (role && ['student', 'placement'].includes(role) && user.role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Account is registered as ${user.role === 'student' ? 'Student' : 'Placement Cell'}. Please switch role tab.`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Login / Register
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { idToken, accessToken, credential } = req.body;
    let email, name, googleId, profilePicture;

    const tokenToVerify = idToken || credential;

    if (tokenToVerify) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: tokenToVerify,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        googleId = payload.sub;
        profilePicture = payload.picture;
      } catch (tokenErr) {
        try {
          const resInfo = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
          email = resInfo.data.email;
          name = resInfo.data.name;
          googleId = resInfo.data.sub;
          profilePicture = resInfo.data.picture;
        } catch (axiosErr) {
          const base64Url = tokenToVerify.split('.')[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            email = decoded.email;
            name = decoded.name;
            googleId = decoded.sub;
            profilePicture = decoded.picture;
          } else {
            return res.status(400).json({ success: false, message: 'Invalid Google OAuth Token.' });
          }
        }
      }
    } else if (accessToken) {
      const resInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      email = resInfo.data.email;
      name = resInfo.data.name;
      googleId = resInfo.data.sub;
      profilePicture = resInfo.data.picture;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No Google OAuth token provided.',
      });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Could not extract email from Google token.' });
    }

    // Find existing user by googleId or email (Account Linking)
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Link Google ID and profile picture if missing
      if (!user.googleId) user.googleId = googleId;
      if (profilePicture && !user.profilePicture) user.profilePicture = profilePicture;
      await user.save();

      // If returning user already has a valid role ('student' or 'placement') -> Log in directly
      if (user.role && ['student', 'placement'].includes(user.role)) {
        return sendTokenResponse(user, 200, res);
      } else {
        // User role missing/unassigned -> Prompt for Role Selection
        return res.status(200).json({
          success: true,
          needsRoleSelection: true,
          tempUser: {
            email: user.email,
            name: user.name,
            googleId: user.googleId,
            profilePicture: user.profilePicture,
          },
        });
      }
    } else {
      // First-time Google user -> Create account with role: null
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        profilePicture,
        authProvider: 'google',
        role: null,
      });

      return res.status(200).json({
        success: true,
        needsRoleSelection: true,
        tempUser: {
          email: newUser.email,
          name: newUser.name,
          googleId: newUser.googleId,
          profilePicture: newUser.profilePicture,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Set Role on First Google Login ('student' or 'placement')
// @route   POST /api/auth/set-role
// @access  Public
const setRole = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email || !role || !['student', 'placement'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid role (Student or Placement Cell).',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Save role permanently in MongoDB
    user.role = role;

    // Generate roll number for student if missing
    if (role === 'student' && !user.rollNumber) {
      user.rollNumber = `GOOG-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User / Clear Cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  registerStudent,
  login,
  googleLogin,
  setRole,
  logout,
  getMe,
};
