# API overview

All endpoints except `/api/health` and `/api/auth/login` require authentication unless stated.

## Auth
- POST `/api/auth/login` `{ email, password }`
- POST `/api/auth/logout`
- GET `/api/auth/me`

## Team (admin only)
- GET `/api/users`
- POST `/api/users` `{ name, email, password }`
- PATCH `/api/users/:id` `{ name?, active?, password? }`

## Leads
- GET `/api/leads?q=&status=&assignedTo=&mine=`
- POST `/api/leads`
- GET `/api/leads/:id`
- PATCH `/api/leads/:id`
- DELETE `/api/leads/:id` (admin; archives)
- GET `/api/leads/:id/activities`
- POST `/api/leads/:id/activities` `{ type, summary, occurredAt? }`
- POST `/api/leads/:id/followups` `{ dueAt, note }`
- POST `/api/leads/:id/convert` `{ agreedAmount, notes }`

## Follow-ups
- GET `/api/followups`
- PATCH `/api/followups/:id/complete`
- PATCH `/api/followups/:id/cancel`

## Dashboard / reports
- GET `/api/dashboard`
- GET `/api/dashboard/reports`

## Clients
- GET `/api/clients`
- POST `/api/clients/:id/projects`
- GET `/api/clients/:id/projects`
- POST `/api/clients/:id/payments`
- GET `/api/clients/:id/payments`

## Export
- GET `/api/export/leads.csv`
