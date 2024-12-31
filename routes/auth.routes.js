import express from 'express';
import {
  register,
  login,
  verifyClientEmail,
  loginWithPhone,
  logout,
  forgetPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyClientEmail);
router.post('/login', login);
router.post('/login-with-phone', loginWithPhone);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.get('/logout', logout);

export default router;
