import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  followUp: { type: mongoose.Schema.Types.ObjectId, ref: 'FollowUp' },
  recipient: { type: String, required: true },
  kind: { type: String, required: true },
  status: { type: String, enum: ['sent','failed','skipped'], required: true },
  error: String,
  sentAt: Date
}, { timestamps: true });
export default mongoose.model('Notification', schema);
