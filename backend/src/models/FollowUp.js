import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueAt: { type: Date, required: true },
  note: { type: String, default: '' },
  status: { type: String, enum: ['pending','completed','cancelled'], default: 'pending' },
  reminderDaySentAt: Date,
  reminderDueSentAt: Date,
  overdueLastSentAt: Date
}, { timestamps: true });

followUpSchema.index({ status: 1, dueAt: 1 });
export default mongoose.model('FollowUp', followUpSchema);
