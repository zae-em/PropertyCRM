# Property Dealer CRM

Full-stack CRM for property dealers built with Next.js 14, MongoDB, NextAuth, Tailwind CSS.

## Features
- Role-based auth (Admin / Agent) with JWT via NextAuth
- Lead CRUD with auto scoring (High/Medium/Low by budget)
- Lead assignment & reassignment with email notifications
- Activity timeline (audit trail) per lead
- Real-time updates via 15s polling
- Smart follow-up reminders (overdue + stale leads)
- WhatsApp click-to-chat integration
- Analytics dashboard with charts
- Export leads to Excel
- Rate limiting (agents: 50 req/min, admins: unlimited)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in:
- `MONGODB_URI` – your MongoDB Atlas connection string
- `NEXTAUTH_SECRET` – any random 32+ char string
- `NEXTAUTH_URL` – `http://localhost:3000` for local dev
- `JWT_SECRET` – any random string
- `EMAIL_*` – Gmail SMTP (use App Password, not your account password)

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. First time setup
1. Go to `/signup` and create an **Admin** account
2. Create additional **Agent** accounts via `/signup`
3. Login as admin at `/login`

## Deployment (Vercel)
```bash
npm run build
```
Push to GitHub → import in Vercel → add all env vars in Vercel dashboard.

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/         # NextAuth + signup
│   │   ├── leads/        # CRUD + export
│   │   ├── agents/       # Agent listing
│   │   ├── analytics/    # Admin stats
│   │   └── reminders/    # Follow-up detection
│   ├── dashboard/        # Main dashboard
│   ├── leads/            # Lead list + detail
│   ├── agents/           # Agents page
│   ├── login/
│   └── signup/
├── components/
│   └── layout/Navbar.tsx
├── lib/
│   ├── db.ts             # MongoDB connection
│   ├── auth.ts           # NextAuth config
│   ├── email.ts          # Nodemailer
│   ├── scoring.ts        # Budget → priority logic
│   └── rateLimit.ts      # In-memory rate limiter
└── models/
    ├── User.ts
    ├── Lead.ts
    └── Activity.ts
```

## Lead Scoring Logic
| Budget | Priority |
|--------|----------|
| > 20M PKR | 🔴 High |
| 10M–20M PKR | 🟡 Medium |
| < 10M PKR | 🟢 Low |

## WhatsApp Integration
Phone numbers stored without country code. Click 💬 button formats as:
`https://wa.me/92<number>` (Pakistan format)

## Email Notifications
Emails sent on:
- New lead created → Admin notified
- Lead assigned to agent → Agent notified

Requires valid Gmail SMTP with App Password enabled.
