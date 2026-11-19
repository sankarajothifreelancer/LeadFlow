import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  contactPerson: { type: String, trim: true, default: '' },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true, default: '' },
  city: { type: String, trim: true, default: '' },
  category: { type: String, trim: true, default: '' },
  service: {
    type: String,
    enum: [
      'Website',
      'Web Development',
      'Mobile App',
      'App Development',
      'CRM / SaaS',
      'Digital Marketing',
      'SEO',
      'UI/UX Design',
      'Other'
    ],
    default: 'Website'
  },
  status: { type: String, enum: ['New Lead','First Call Completed','Interested','Portfolio Sent','Proposal Sent','Follow-up Required','Negotiation','Converted','Not Interested','No Response','Lost'], default: 'New Lead' },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  source: { type: String, enum: ['Call','WhatsApp','Instagram','Email','Referral','Other'], default: 'Call' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nextFollowUpAt: Date,
  notes: { type: String, default: '' },
  portfolioSent: { type: Boolean, default: false },
  proposalSent: { type: Boolean, default: false },
  convertedAt: Date,
  archived: { type: Boolean, default: false }
}, { timestamps: true });

leadSchema.index({ mobile: 1 });
leadSchema.index({ assignedTo: 1, nextFollowUpAt: 1 });
leadSchema.index({ businessName: 'text', contactPerson: 'text', city: 'text' });

export default mongoose.model('Lead', leadSchema);
