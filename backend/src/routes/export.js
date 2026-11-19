import { Router } from 'express';
import { stringify } from 'csv-stringify/sync';
import Lead from '../models/Lead.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.get('/leads.csv', asyncHandler(async (req,res) => {
  const filter = req.user.role === 'admin' ? { archived: false } : { archived: false, assignedTo: req.user._id };
  const leads = await Lead.find(filter).populate('assignedTo','name').sort({ createdAt: -1 }).lean();
  const csv = stringify(leads.map(l => ({
    business: l.businessName, contact: l.contactPerson, mobile: l.mobile, email: l.email,
    city: l.city, category: l.category, service: l.service, status: l.status,
    priority: l.priority, assignedTo: l.assignedTo?.name, source: l.source,
    nextFollowUpAt: l.nextFollowUpAt?.toISOString() || '', createdAt: l.createdAt?.toISOString()
  })), { header: true });
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="leadflow-leads.csv"');
  res.send(csv);
}));
export default router;
