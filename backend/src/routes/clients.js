import { Router } from 'express';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();

router.get('/', asyncHandler(async (req,res) => {
  const filter = req.user.role === 'admin' ? {} : { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] };
  res.json(await Client.find(filter).populate('assignedTo', 'name email').populate('createdBy', 'name email').sort({ createdAt: -1 }));
}));

router.post('/:id/projects', asyncHandler(async (req,res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ message: 'Client not found' });
  if (req.user.role !== 'admin' && String(client.assignedTo) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  if (!req.body.name?.trim()) return res.status(400).json({ message: 'Project name required' });
  const project = await Project.create({ client: client._id, ...req.body });
  res.status(201).json(project);
}));

router.get('/:id/projects', asyncHandler(async (req,res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ message: 'Client not found' });
  if (req.user.role !== 'admin' && String(client.assignedTo) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  res.json(await Project.find({ client: client._id }).sort({ createdAt: -1 }));
}));

router.post('/:id/payments', asyncHandler(async (req,res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ message: 'Client not found' });
  if (req.user.role !== 'admin' && String(client.assignedTo) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Enter a valid payment amount' });
  res.status(201).json(await Payment.create({ client: client._id, amount, method: req.body.method || 'Bank Transfer', reference: req.body.reference || '', notes: req.body.notes || '' }));
}));

router.get('/:id/payments', asyncHandler(async (req,res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ message: 'Client not found' });
  if (req.user.role !== 'admin' && String(client.assignedTo) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  res.json(await Payment.find({ client: client._id }).sort({ paidAt: -1 }));
}));

export default router;
