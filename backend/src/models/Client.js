import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, unique: true },
  businessName: { type: String, required: true },
  contactPerson: String,
  mobile: String,
  email: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agreedAmount: { type: Number, default: 0 },
  notes: String
}, { timestamps: true });
export default mongoose.model('Client', schema);
