const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'placementhub_jwt_super_secret_key_2026_phase1'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or invalid session.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token failed or expired.',
    });
  }
};

const authorizeStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Access restricted to Students only.',
  });
};

const authorizePlacementCell = (req, res, next) => {
  if (req.user && req.user.role === 'placement') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Access restricted to Placement Cell only.',
  });
};

module.exports = {
  authenticateUser,
  authorizeStudent,
  authorizePlacementCell,
};
