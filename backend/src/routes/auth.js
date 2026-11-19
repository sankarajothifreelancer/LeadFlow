import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const cookieOptions = () => ({
  httpOnly: true, secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
});

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  user.lastLoginAt = new Date();
  await user.save();
  const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('lf_token', token, cookieOptions());
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}));

router.post('/logout', (req, res) => {
  res.clearCookie('lf_token', { ...cookieOptions(), maxAge: undefined });
  res.json({ message: 'Signed out' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

export default router;
