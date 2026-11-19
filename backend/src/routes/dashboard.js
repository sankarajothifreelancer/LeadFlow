import { Router } from 'express';
import Lead from '../models/Lead.js';
import FollowUp from '../models/FollowUp.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const base = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
  const [total, interested, converted, pending, overdue, users, recent] = await Promise.all([
    Lead.countDocuments({ ...base, archived: false }),
    Lead.countDocuments({ ...base, archived: false, status: { $in: ['Interested','Portfolio Sent','Proposal Sent','Negotiation'] } }),
    Lead.countDocuments({ ...base, archived: false, status: 'Converted' }),
    FollowUp.countDocuments({ ...base, status: 'pending', dueAt: { $gte: new Date() } }),
    FollowUp.countDocuments({ ...base, status: 'pending', dueAt: { $lt: new Date() } }),
    req.user.role === 'admin' ? User.find().select('name email role active') : [],
    Activity.find().sort({ createdAt: -1 }).limit(8).populate('user','name').populate('lead','businessName')
  ]);
  const team = req.user.role === 'admin' ? await Promise.all(users.map(async u => ({
    id: u._id, name: u.name,
    leads: await Lead.countDocuments({ assignedTo: u._id, archived: false }),
    converted: await Lead.countDocuments({ assignedTo: u._id, status: 'Converted', archived: false })
  }))) : [];
  res.json({ total, interested, converted, pending, overdue, team, recent });
}));

router.get('/reports', asyncHandler(async (req, res) => {
  const match = req.user.role === 'admin' ? { archived: false } : { archived: false, assignedTo: req.user._id };
  const byStatus = await Lead.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  const byService = await Lead.aggregate([{ $match: match }, { $group: { _id: '$service', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  res.json({ byStatus, byService });
}));

export default router;
