# Gundog Trainer

Mobile-first booking platform for a professional gundog trainer. Built with Next.js 15, Supabase, Prisma, Stripe, and Resend.

## Prerequisites

- Node.js 20+ and npm
- [Supabase](https://supabase.com) project (Postgres + Auth + Storage)
- [Stripe](https://stripe.com) account (test mode for development)
- [Resend](https://resend.com) API key

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in values from your Supabase, Stripe, and Resend dashboards. See `.env.example` for all required keys.

### 3. Set up the database

Push the Prisma schema to your Supabase Postgres database:

```bash
npm run db:push
npm run db:seed
```

### 4. Create an admin user

In the Supabase dashboard, go to **Authentication → Users** and create a user with email/password. This account can sign in at `/admin/login`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stripe webhooks (local testing)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## Project structure

```
src/
├── app/
│   ├── admin/           # Protected admin dashboard
│   ├── api/webhooks/    # Stripe webhook handler
│   ├── book/            # Booking flow (Phase 3)
│   └── contact/         # Contact form (Phase 2)
├── components/ui/       # shadcn/ui primitives
└── lib/
    ├── supabase/        # Auth clients
    ├── prisma.ts        # Database client
    ├── stripe.ts        # Stripe client
    └── email.ts         # Resend client
prisma/
├── schema.prisma        # Data model
└── seed.ts              # Services, testimonials, availability
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed services and testimonials |
| `npm run db:studio` | Open Prisma Studio |

## Phase 0 deliverable

- Next.js 15 + TypeScript + Tailwind + ESLint
- shadcn/ui primitives, React Hook Form, Zod (dependencies installed)
- Prisma schema with full MVP data model
- Supabase auth clients + admin route protection
- Stripe webhook endpoint scaffold
- Resend email client scaffold
- Environment variable template
- Admin login + empty dashboard shell
