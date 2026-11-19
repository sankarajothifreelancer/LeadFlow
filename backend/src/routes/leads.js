import { Router } from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import FollowUp from '../models/FollowUp.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const canEdit = (lead, user) => user.role === 'admin' || String(lead.assignedTo) === String(user._id);
const populate = q => q.populate('assignedTo', 'name email').populate('createdBy', 'name email');

router.get('/', asyncHandler(async (req, res) => {
  const { q, status, assignedTo, mine, createdBy } = req.query;
  const filter = { archived: false };
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (mine === 'true') filter.assignedTo = req.user._id;
  if (createdBy === 'me') filter.createdBy = req.user._id;
  else if (createdBy) filter.createdBy = createdBy;
  if (q) filter.$or = [
    { businessName: { $regex: q, $options: 'i' } },
    { mobile: { $regex: q, $options: 'i' } },
    { city: { $regex: q, $options: 'i' } },
    { contactPerson: { $regex: q, $options: 'i' } }
  ];
  res.json(await populate(Lead.find(filter).sort({ updatedAt: -1 }).limit(500)));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { businessName, mobile } = req.body;
  if (!businessName?.trim() || !mobile?.trim()) return res.status(400).json({ message: 'Business name and mobile number are required' });
  const duplicate = await Lead.findOne({ mobile: mobile.trim(), archived: false });
  if (duplicate) return res.status(409).json({ message: 'A lead with this mobile number already exists', leadId: duplicate._id });
  const assignedTo = req.user.role === 'admin' && req.body.assignedTo ? req.body.assignedTo : req.user._id;
  if (!(await User.exists({ _id: assignedTo, active: true }))) return res.status(400).json({ message: 'Assigned member is invalid' });
  const lead = await Lead.create({ ...req.body, businessName: businessName.trim(), mobile: mobile.trim(), assignedTo, createdBy: req.user._id });
  await Activity.create({ lead: lead._id, user: req.user._id, type: 'Note', summary: 'Lead created' });
  res.status(201).json(await populate(Lead.findById(lead._id)));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const lead = await populate(Lead.findById(req.params.id));
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json(lead);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  if (!canEdit(lead, req.user)) return res.status(403).json({ message: 'You can only edit leads assigned to you' });
  const allowed = ['businessName','contactPerson','mobile','email','city','category','service','status','priority','source','nextFollowUpAt','notes','portfolioSent','proposalSent'];
  for (const key of allowed) if (req.body[key] !== undefined) lead[key] = req.body[key];
  if (req.user.role === 'admin' && req.body.assignedTo) {
    if (!(await User.exists({ _id: req.body.assignedTo, active: true }))) return res.status(400).json({ message: 'Assigned member is invalid' });
    lead.assignedTo = req.body.assignedTo;
  }
  if (lead.status === 'Converted' && !lead.convertedAt) lead.convertedAt = new Date();
  await lead.save();
  await Activity.create({ lead: lead._id, user: req.user._id, type: 'Status Change', summary: 'Lead details updated' });
  res.json(await populate(Lead.findById(lead._id)));
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  await FollowUp.updateMany({ lead: lead._id, status: 'pending' }, { status: 'cancelled' });
  res.json({ message: 'Lead archived' });
}));

router.get('/:id/activities', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json(await Activity.find({ lead: lead._id }).populate('user', 'name').sort({ occurredAt: -1 }));
}));

router.post('/:id/activities', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  if (!canEdit(lead, req.user)) return res.status(403).json({ message: 'You can only update assigned leads' });
  if (!req.body.summary?.trim()) return res.status(400).json({ message: 'Activity summary is required' });
  const activity = await Activity.create({ lead: lead._id, user: req.user._id, type: req.body.type || 'Note', summary: req.body.summary.trim(), occurredAt: req.body.occurredAt || new Date() });
  res.status(201).json(activity);
}));

router.post('/:id/followups', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  if (!canEdit(lead, req.user)) return res.status(403).json({ message: 'You can only schedule follow-ups for assigned leads' });
  const dueAt = new Date(req.body.dueAt);
  if (!req.body.dueAt || Number.isNaN(dueAt.getTime()) || dueAt <= new Date()) return res.status(400).json({ message: 'Choose a valid future follow-up date and time' });
  const follow = await FollowUp.create({ lead: lead._id, assignedTo: lead.assignedTo, createdBy: req.user._id, dueAt, note: req.body.note || '' });
  lead.nextFollowUpAt = dueAt;
  lead.status = 'Follow-up Required';
  await lead.save();
  await Activity.create({ lead: lead._id, user: req.user._id, type: 'Note', summary: `Follow-up scheduled for ${dueAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}` });
  res.status(201).json(follow);
}));

router.post('/:id/convert', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  if (!canEdit(lead, req.user)) return res.status(403).json({ message: 'You can only convert assigned leads' });
  const client = await Client.findOneAndUpdate(
    { lead: lead._id },
    { $setOnInsert: { lead: lead._id, businessName: lead.businessName, contactPerson: lead.contactPerson, mobile: lead.mobile, email: lead.email, assignedTo: lead.assignedTo, createdBy: lead.createdBy || req.user._id, agreedAmount: Number(req.body.agreedAmount || 0), notes: req.body.notes || '' } },
    { upsert: true, new: true }
  );
  lead.status = 'Converted'; lead.convertedAt = new Date(); await lead.save();
  res.status(201).json(client);
}));

export default router;
