import { Router } from 'express';
import Lead from '../models/Lead.js';
import FollowUp from '../models/FollowUp.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const myFilter = { assignedTo: req.user._id, archived: false };

  const [workspaceTotal, interested, converted, pending, overdue, myLeadsCount, users, recent] = await Promise.all([
    Lead.countDocuments({ archived: false }),
    Lead.countDocuments({ archived: false, status: { $in: ['Interested','Portfolio Sent','Proposal Sent','Negotiation'] } }),
    Lead.countDocuments({ archived: false, status: 'Converted' }),
    FollowUp.countDocuments({ ...(isAdmin ? {} : { assignedTo: req.user._id }), status: 'pending', dueAt: { $gte: new Date() } }),
    FollowUp.countDocuments({ ...(isAdmin ? {} : { assignedTo: req.user._id }), status: 'pending', dueAt: { $lt: new Date() } }),
    Lead.countDocuments(myFilter),
    isAdmin ? User.find().select('name email role active') : [],
    Activity.find().sort({ createdAt: -1 }).limit(8).populate('user','name').populate('lead','businessName')
  ]);

  const team = isAdmin ? await Promise.all(users.map(async u => ({
    id: u._id, name: u.name,
    leads: await Lead.countDocuments({ assignedTo: u._id, archived: false }),
    converted: await Lead.countDocuments({ assignedTo: u._id, status: 'Converted', archived: false })
  }))) : [];

  res.json({ total: workspaceTotal, myLeads: myLeadsCount, interested, converted, pending, overdue, team, recent });
}));

router.get('/reports', asyncHandler(async (req, res) => {
  const match = { archived: false };
  const byStatus = await Lead.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  const byService = await Lead.aggregate([{ $match: match }, { $group: { _id: '$service', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  res.json({ byStatus, byService });
}));

export default router;
