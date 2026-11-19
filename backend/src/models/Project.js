import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['Not Started','In Progress','On Hold','Completed'], default: 'Not Started' },
  startDate: Date,
  dueDate: Date,
  agreedAmount: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('Project', schema);
