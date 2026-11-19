import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  amount: { type: Number, required: true, min: 0 },
  paidAt: { type: Date, default: Date.now },
  method: { type: String, default: 'Bank Transfer' },
  reference: String,
  notes: String
}, { timestamps: true });
export default mongoose.model('Payment', schema);
