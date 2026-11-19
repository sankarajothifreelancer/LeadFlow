import { Resend } from 'resend';

export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn(`Email not sent (provider not configured): ${subject} -> ${to}`);
    return { skipped: true };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({ from: process.env.EMAIL_FROM, to, subject, html });
  if (result.error) throw new Error(result.error.message || 'Email provider error');
  return result;
}
