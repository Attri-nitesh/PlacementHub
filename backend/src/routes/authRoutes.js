const express = require('express');
const {
  registerStudent,
  login,
  googleLogin,
  setRole,
  logout,
  getMe,
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/set-role', setRole);
router.post('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getMe);

module.exports = router;
