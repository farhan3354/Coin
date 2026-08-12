# EarnCoin — Online Rewards Platform

A modern rewards platform where users earn points by watching videos, completing tasks, joining events, and inviting friends. Businesses can promote their products and services.

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

- **User Dashboard** — Stats, referrals, notifications, withdrawal status
- **Video Watching** — Watch videos in new tab, timer-based rewards
- **Tasks** — 8 task types (watch, visit, survey, social, etc.)
- **Events** — Daily, weekly, monthly, special, festival events with leaderboards
- **Rooms** — 5 levels (Local→VIP) with increasing seats (5/7/10/15/20)
- **Games** — Free games (Tic-Tac-Toe, Memory) + Coin games (Math, Reaction, Number Hunt)
- **Withdrawals** — Diamond-based system, first withdrawal free, then 10+ diamonds minimum
- **Buy Coins** — Purchase coins via JazzCash, EasyPaisa, PayPal, Binance
- **Referral System** — Unique referral codes, official links from admin
- **Email System** — Automated emails for registration, withdrawals, referrals
- **Dark/Light Mode** — Toggle in navbar
- **Customer Service** — Floating WhatsApp support button (+971 50 932 7341)
- **Admin Panel** — 14 sections with sidebar navigation
- **Business Dashboard** — Campaign management with analytics

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (file-based, no external server needed)
- **Animations**: Framer Motion
- **State**: Zustand

## Project Structure

```
earncoin/
├── prisma/
│   ├── schema.prisma     # Database schema (16 models)
│   └── seed.ts           # Database seeder
├── public/
│   ├── logo.png          # Your logo
│   └── favicon.png       # Favicon
├── src/
│   ├── app/
│   │   ├── api/          # 20+ API routes
│   │   ├── globals.css   # Dark/Light theme
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main page with view router
│   ├── components/
│   │   ├── admin/        # Admin dashboard
│   │   ├── auth/         # Login/Register/OTP
│   │   ├── business/     # Business dashboard
│   │   ├── dashboard/    # User dashboard + sidebar
│   │   ├── layout/       # Navbar + Footer
│   │   ├── public/       # Home, About, FAQ, etc.
│   │   ├── shared/       # ScrollToTop, BottomNav, CustomerService, etc.
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # use-mobile, use-toast
│   └── lib/
│       ├── animations.tsx # Framer Motion wrappers
│       ├── db.ts          # Prisma client
│       ├── dbSync.ts      # Database sync utility
│       ├── mockData.ts    # Seed data + helpers
│       ├── store.ts       # Zustand store
│       ├── types.ts       # TypeScript types
│       └── utils.ts       # Utilities
├── .env                  # DATABASE_URL
├── .env.production       # Production DATABASE_URL
├── package.json
└── next.config.ts
```

## Database Commands

```bash
npx prisma db push      # Create/update database tables
npx prisma db seed      # Fill with seed data
npx prisma studio       # Open database GUI viewer
```

## Support

WhatsApp: +971 50 932 7341
Email: support@earncoin.com
