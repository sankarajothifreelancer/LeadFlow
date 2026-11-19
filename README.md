# LeadFlow CRM

A private, responsive CRM for a three-person freelancing team. Includes role-based access, business leads, interaction history, follow-up scheduling, email reminders, client conversion, projects, payments, reporting and CSV export.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas / local MongoDB
- Authentication: JWT in HTTP-only cookies, bcrypt password hashing
- Email: Resend (optional; reminders are logged if not configured)
- Scheduler: node-cron

## Requirements
- Node.js 20+
- MongoDB database
- Optional Resend API key and verified sender domain for real email delivery

## Setup
1. Copy `backend/.env.example` to `backend/.env` and set values.
2. From the project root run `npm install`.
3. Create the first administrator:
   `npm run seed:admin -w backend`
   Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env` first.
4. Run `npm run dev`.
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

The admin creates the two member accounts from Team Members. There is no public registration.

## Production
- Deploy `frontend` to Vercel. Set `VITE_API_URL` to your backend URL (include `/api`).
- Deploy `backend` to Render or another persistent Node.js host. Set all backend environment variables.
- Set `FRONTEND_URL` to the deployed frontend origin.
- Use a persistent backend instance because the scheduler runs inside the backend process. For multiple backend replicas, move the scheduler to a single dedicated worker to avoid duplicate processing.
- Set `COOKIE_SECURE=true` in production and use HTTPS.
- Configure Resend with a verified sender domain. Without it, the app still works but cannot send actual email.
- Use MongoDB Atlas backups and restrict database network access.

## Important operational notes
- All team members can view all leads. Members can edit only leads assigned to them; admins can edit all.
- Lead assignment and access rules are enforced by backend middleware/controllers, not just the UI.
- Email reminders are sent to the assigned member. The admin can receive the daily summary.
- The scheduler checks every minute. Due reminders are idempotently claimed in MongoDB before sending.
- This is a deployable starter product, not a hosted service. You must configure hosting, database, domain and email provider before real-world use.
- Configure legal privacy notices and obtain appropriate consent before storing personal contact details.
