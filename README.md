# EarnCoin — Online Rewards Platform

A modern rewards platform where users earn points by watching videos, completing tasks, joining events, playing games, taking quizzes, and inviting friends. Businesses can promote their products and services.

## Quick Start (Run Locally)

### Prerequisites
- Node.js 18+ or Bun
- npm or bun package manager

### Installation

```bash
# 1. Install dependencies
npm install
# OR if using bun:
bun install

# 2. Create the database
npx prisma db push
# OR: bunx prisma db push

# 3. Seed the database with initial data
npx prisma db seed
# OR: bunx tsx prisma/seed.ts

# 4. Start the development server
npm run dev
# OR: bun run dev
```

### Open in Browser
Visit `http://localhost:3000`

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| User | demo@earncoin.com | demo123 |
| Admin | admin@earncoin.com | admin123 |
| Business | business@earncoin.com | business123 |

## Features

### User Dashboard
- **Stats Overview** — Points, diamonds, dollar balance, referral stats
- **Watch Videos** — Watch promotional videos in new tab, timer-based rewards
- **Tasks** — 8 task types (watch, visit, survey, social, telegram, discord, etc.)
- **Events** — Daily, weekly, monthly, special, festival events with leaderboards
- **Rooms** — 5 levels (Local→VIP) with increasing seats (5/7/10/15/20)
  - 🔒 Admin can lock rooms — users must complete X tasks before joining
- **Games** — Free games (Tic-Tac-Toe, Memory) + Coin games (Math, Reaction, Number Hunt)
- **Quizzes (NEW)** — MCQ quizzes with timer, pass score, and reward points
- **Withdrawals** — Multiple payment methods (PayPal, Binance, Paytm, JazzCash, EasyPaisa)
- **Buy Coins** — Purchase coins via JazzCash, EasyPaisa, PayPal, Binance
- **Referral System** — Unique referral codes, official links from admin
- **Email System** — Automated emails for registration, withdrawals, referrals
- **Dark/Light Mode** — Toggle in navbar
- **Customer Service** — Floating WhatsApp support button (+971 50 932 7341)

### Admin Panel (14 sections)
- Overview, Analytics, Reports
- Users, Official Links
- Videos, Tasks, Events, Rooms, Games, **Quizzes**
- Withdrawals, Emails, Businesses, Settings

### Business Dashboard
- Campaign management with budget, views, clicks tracking

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase) — production-ready, serverless-compatible
- **Email**: Nodemailer + Gmail SMTP (real OTP emails)
- **Animations**: Framer Motion
- **State**: Zustand with localStorage persistence

## Quiz System (New)

Admin can create quizzes with:
- Title, description, category
- Reward points (e.g. 30 points for passing)
- Pass score percentage (e.g. 60%)
- Time limit (e.g. 5 minutes)
- Unlimited MCQ questions (4 options each, mark the correct one)

Users take quizzes from the dashboard:
- Timer counts down, turns red under 30 seconds
- Each quiz can only be taken once per user
- Points credited based on score (full reward if passed, partial if failed)

## Room Task-Locking (New)

Admin can require users to complete a minimum number of tasks before joining a room:
- Set "Tasks Required" when creating a room (0 = no lock)
- Optionally hide the room until unlocked
- Users see a clear message: "You need to complete 5 tasks. You have completed 2. Complete 3 more."

## Referral System

- Each user gets a unique referral code (e.g. `ERN934X`)
- Share link: `https://yoursite.com/?ref=ERN934X`
- New users enter the code during registration
- When the new user verifies their email:
  - New user gets **150 welcome bonus points**
  - Inviter gets **90 referral reward points**
  - Inviter's `totalReferrals` and `activeReferrals` increment
  - Coin history entry + notification created for inviter
- Admin can generate **Official Links** for partners/teams (e.g. YouTube channel, Telegram community)

## Project Structure

```
earncoin/
├── prisma/
│   ├── schema.prisma     # Database schema (17 models including Quiz)
│   └── seed.ts           # Database seeder
├── public/
│   ├── logo.png          # EarnCoin logo
│   └── favicon.png       # Favicon
├── src/
│   ├── app/
│   │   ├── api/          # 35+ API routes (auth, quizzes, rooms, etc.)
│   │   ├── globals.css   # Dark/Light theme
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main page with view router
│   ├── components/
│   │   ├── admin/        # Admin dashboard + 14 sections
│   │   ├── auth/         # Login/Register/OTP dialogs
│   │   ├── business/     # Business dashboard
│   │   ├── dashboard/    # User dashboard + all pages (including QuizPage)
│   │   ├── layout/       # Navbar + Footer
│   │   ├── public/       # Home, About, FAQ, etc.
│   │   ├── shared/       # ScrollToTop, BottomNav, CustomerService, VideoWatchPage
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # use-mobile, use-toast
│   └── lib/
│       ├── animations.tsx # Framer Motion wrappers
│       ├── db.ts          # Prisma client
│       ├── dbSync.ts      # Database sync utility
│       ├── emailService.ts # Gmail SMTP + email templates
│       ├── mockData.ts    # Seed data + helpers
│       ├── store.ts       # Zustand store
│       ├── types.ts       # TypeScript types
│       └── utils.ts       # Utilities
├── .env                  # Environment variables
├── .env.example          # Template for env vars
├── package.json
└── next.config.ts
```

## Database Commands

```bash
npx prisma db push      # Create/update database tables
npx prisma db seed      # Fill with seed data
npx prisma studio       # Open database GUI viewer
npx prisma generate     # Regenerate Prisma client after schema changes
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="any-random-long-string"
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-16-char-gmail-app-password"
```

Get a free Supabase database at https://supabase.com
Get a Gmail App Password at https://myaccount.google.com/apppasswords

## Support

WhatsApp: +971 50 932 7341
Email: support@earncoin.com
