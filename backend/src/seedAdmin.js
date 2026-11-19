import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';

await connectDB();
const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 6) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (minimum 6 characters) in backend/.env');
  process.exit(1);
}
const emailLower = ADMIN_EMAIL.toLowerCase().trim();
const existing = await User.findOne({ email: emailLower });
const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

if (existing) {
  existing.passwordHash = hash;
  existing.role = 'admin';
  existing.name = ADMIN_NAME;
  existing.active = true;
  await existing.save();
  console.log(`Admin user updated with new password: ${emailLower}`);
} else {
  await User.create({ name: ADMIN_NAME, email: emailLower, role: 'admin', passwordHash: hash, active: true });
  console.log(`Admin created: ${emailLower}`);
}
process.exit(0);
