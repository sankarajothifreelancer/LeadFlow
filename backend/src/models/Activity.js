import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Call','WhatsApp','Email','Portfolio Sent','Proposal Sent','Note','Status Change','Assignment','Other'], default: 'Note' },
  summary: { type: String, required: true, trim: true },
  occurredAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
