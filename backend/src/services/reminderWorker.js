import cron from 'node-cron';
import FollowUp from '../models/FollowUp.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import { sendEmail } from './email.js';

const esc = value => String(value ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

async function notify(follow, kind, field, subject, intro) {
  const claimed = await FollowUp.findOneAndUpdate(
    { _id: follow._id, status: 'pending', [field]: { $exists: false } },
    { $set: { [field]: new Date() } },
    { new: true }
  );
  if (!claimed) return;
  const [user, lead] = await Promise.all([
    User.findById(follow.assignedTo),
    Lead.findById(follow.lead)
  ]);
  if (!user?.active || !lead) return;
  try {
    const result = await sendEmail({
      to: user.email,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px"><h2>${esc(subject)}</h2><p>${esc(intro)}</p><p><b>Business:</b> ${esc(lead.businessName)}</p><p><b>Contact:</b> ${esc(lead.contactPerson)} (${esc(lead.mobile)})</p><p><b>Due:</b> ${new Date(follow.dueAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</p><p><b>Previous note:</b> ${esc(follow.note || lead.notes || 'No note added')}</p><p>Sign in to LeadFlow CRM to update this follow-up.</p></div>`
    });
    await Notification.create({ followUp: follow._id, recipient: user.email, kind, status: result.skipped ? 'skipped' : 'sent', sentAt: result.skipped ? undefined : new Date() });
  } catch (error) {
    await FollowUp.updateOne({ _id: follow._id }, { $unset: { [field]: 1 } });
    await Notification.create({ followUp: follow._id, recipient: user.email, kind, status: 'failed', error: error.message });
    console.error('Reminder email failed:', error.message);
  }
}

export function startReminderWorker() {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const dayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const dayDue = await FollowUp.find({
        status: 'pending', dueAt: { $gt: now, $lte: dayAhead }, reminderDaySentAt: { $exists: false }
      }).limit(100);
      for (const f of dayDue) await notify(f, 'one-day-before', 'reminderDaySentAt', 'Follow-up tomorrow', 'You have a business follow-up scheduled for tomorrow.');

      const due = await FollowUp.find({
        status: 'pending', dueAt: { $lte: now }, reminderDueSentAt: { $exists: false }
      }).limit(100);
      for (const f of due) await notify(f, 'due', 'reminderDueSentAt', 'Follow-up due now', 'Your scheduled business follow-up is due now.');

      const overdue = await FollowUp.find({
        status: 'pending',
        dueAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        $or: [
          { overdueLastSentAt: { $exists: false } },
          { overdueLastSentAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        ]
      }).limit(100);
      for (const f of overdue) {
        const claimed = await FollowUp.findOneAndUpdate(
          { _id: f._id, status: 'pending', $or: [{ overdueLastSentAt: { $exists: false } }, { overdueLastSentAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }] },
          { $set: { overdueLastSentAt: now } }, { new: true }
        );
        if (!claimed) continue;
        const [user, lead] = await Promise.all([User.findById(f.assignedTo), Lead.findById(f.lead)]);
        if (!user?.active || !lead) continue;
        try {
          const result = await sendEmail({ to: user.email, subject: 'Overdue follow-up', html: `<p>Your follow-up for <b>${esc(lead.businessName)}</b> is overdue.</p><p>${esc(f.note)}</p>` });
          await Notification.create({ followUp: f._id, recipient: user.email, kind: 'overdue', status: result.skipped ? 'skipped' : 'sent', sentAt: result.skipped ? undefined : now });
        } catch (e) {
          await Notification.create({ followUp: f._id, recipient: user.email, kind: 'overdue', status: 'failed', error: e.message });
        }
      }
    } catch (error) { console.error('Reminder worker error:', error); }
  }, { timezone: 'Asia/Kolkata' });
}
