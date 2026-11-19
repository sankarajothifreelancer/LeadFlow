import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.use(requireAdmin);

router.get('/', asyncHandler(async (_req, res) => {
  const users = await User.find().select('name email role active lastLoginAt createdAt').sort({ createdAt: 1 });
  res.json(users);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Name, email and a password of at least 6 characters are required' });
  }
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(400).json({ message: 'A team member with this email already exists' });
  }
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: await bcrypt.hash(password, 12),
    role: 'member',
    active: true
  });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, active: user.active });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const update = {};
  if (typeof req.body.name === 'string') update.name = req.body.name.trim();
  if (typeof req.body.active === 'boolean') update.active = req.body.active;
  if (req.body.password) {
    if (req.body.password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    update.passwordHash = await bcrypt.hash(req.body.password, 12);
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('name email role active');
  if (!user) return res.status(404).json({ message: 'Member not found' });
  res.json(user);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete your own Super Admin account' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Member not found' });

  // Safely reassign any active leads and clients belonging to this member to the current Super Admin
  await Lead.updateMany({ assignedTo: user._id }, { assignedTo: req.user._id });
  await Client.updateMany({ assignedTo: user._id }, { assignedTo: req.user._id });

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: `Member ${user.name} was permanently removed. Any assigned deals were safely reassigned to you.` });
}));

export default router;
