import { Router } from 'express';
import FollowUp from '../models/FollowUp.js';
import Lead from '../models/Lead.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const filter = { status: 'pending' };
  if (req.user.role !== 'admin') filter.assignedTo = req.user._id;
  const items = await FollowUp.find(filter).populate('lead', 'businessName mobile status').populate('assignedTo', 'name email').sort({ dueAt: 1 }).limit(500);
  res.json(items);
}));

router.patch('/:id/complete', asyncHandler(async (req, res) => {
  const follow = await FollowUp.findById(req.params.id);
  if (!follow) return res.status(404).json({ message: 'Follow-up not found' });
  if (req.user.role !== 'admin' && String(follow.assignedTo) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  follow.status = 'completed'; await follow.save();
  const next = await FollowUp.findOne({ lead: follow.lead, status: 'pending' }).sort({ dueAt: 1 });
  await Lead.findByIdAndUpdate(follow.lead, { nextFollowUpAt: next?.dueAt || null });
  res.json({ message: 'Follow-up completed' });
}));

router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  const follow = await FollowUp.findById(req.params.id);
  if (!follow) return res.status(404).json({ message: 'Follow-up not found' });
  if (req.user.role !== 'admin' && String(follow.assignedTo) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  follow.status = 'cancelled'; await follow.save();
  res.json({ message: 'Follow-up cancelled' });
}));

export default router;
