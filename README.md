# Gundog Trainer

Mobile-first booking site for a UK gundog trainer. Clients pick a session, complete a dog intake, and pay with Stripe. The trainer manages bookings from a protected admin dashboard.

Stack: Next.js 16 (App Router, `src/`), TypeScript, Tailwind v4, Prisma, Supabase (Postgres, Auth, Storage), Stripe Checkout, Resend.

Copy and photos live in `content/`. Prices, slots, bookings, and testimonials live in the database. That split is deliberate: marketing text can change without a migration; money and diaries cannot.

## Prerequisites

- Node.js 20+ and npm (Volta is fine on Windows)
- [Supabase](https://supabase.com) project (Postgres, Auth, Storage)
- [Stripe](https://stripe.com) account in test mode
- [Resend](https://resend.com) API key (optional until you want emails)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Prisma reads **`.env`**, not `.env.local`. Next.js will also load `.env.local` for `NEXT_PUBLIC_*` and server env at runtime, but `prisma` CLI and the Prisma Client datasource only see `.env`. Put `DATABASE_URL` and `DIRECT_URL` in `.env` or Prisma commands will fail while the app appears fine.

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill in Supabase, Stripe, and Resend values. See `.env.example` for every key. Never commit `.env`.

### 3. Set up the database

```bash
npm run db:push
npm run db:seed
```

Seed creates active services (virtual + in person), weekly availability hours, and a couple of published testimonials.

### 4. Create an admin user

In Supabase: **Authentication → Users** → create an email/password user. Sign in at `/admin/login`.

There is no separate “admin role” table. Anyone who can sign in with the configured Supabase project can open `/admin`. Treat that project as trainer-only.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Site looks (Heath and Field)

The public site has two layouts you can toggle in the header (useful when showing a client):

| Look | Style |
|------|--------|
| **Heath** | Warm countryside greens, rounded cards, Fraunces headings |
| **Field** | Ink navy and brass, sharper edges, estate-style headings |

How it is wired:

1. `src/app/(marketing)/layout.tsx` reads the `gundog-theme` cookie and sets `data-theme="heath" | "field"` on a wrapper.
2. `src/components/theme/theme-toggle.tsx` writes that cookie in the browser and updates `data-theme` immediately so the page does not need a full reload.
3. `src/app/globals.css` scopes Field overrides with `[data-theme="field"]`. Tokens such as `--primary` and `--font-display-family` switch with the attribute.
4. Admin routes are **not** inside `(marketing)`, so they never pick up Field. Keep it that way — a diary UI in brass serif is harder to scan.

The Field header is navy with cream text. The mobile menu panel is cream. Menu links must set their own dark colour (`.site-mobile-link`) or they inherit cream-on-cream and disappear. Footer links on Field need `.site-footer-link` for the same reason: Tailwind `text-muted-foreground` is a dark navy that vanishes on a navy footer.

Hero copy on Field sits in a navy panel (`.site-hero-panel`) so cream text is never sitting on a bright photo.

## How the systems hang together

This is the map of the moving parts. Read this before changing booking, payments, or intake.

### Request path

```
Browser
  → src/app/(marketing)/*     public pages, /book, /intake, /training
  → src/app/admin/*           Supabase-auth gated trainer UI
  → src/app/api/webhooks/stripe   Stripe → confirm or release a booking
  → src/app/actions/*         server actions (forms, checkout, slots)
```

Route groups `(marketing)` only affect layout and URLs stay unprefixed (`/about`, not `/marketing/about`).

Pages that read the database set `export const dynamic = "force-dynamic"` so service prices and slots are not cached stale at build time.

### Content vs database

| Lives in `content/` | Lives in Postgres (Prisma) |
|---------------------|----------------------------|
| Site name, nav, Unsplash image URLs | Services, prices, durations |
| Home / about / training copy | Availability rules, blocked dates |
| Intake question wording | Clients, dogs, bookings |
| Privacy text | Intake PDFs (path only — file in Storage) |
| | Contact enquiries, testimonials |

`content/site.ts` is the switchboard for the logo name, contact details, nav, and photos. Swap gallery URLs there; do not hardcode Unsplash links in components.

### Booking state machine

A booking is not “paid” when the client clicks **Pay securely**. The sequence is:

1. **Session** — client picks a `Service`. `getSlotsAction` asks the availability engine for that service’s duration.
2. **Time** — client picks an ISO start (`startsAt`). Nothing is reserved yet.
3. **Intake** — `submitIntakeAction` upserts a `Client` by **email**, always creates a new `Dog`, stores JSON intake fields, generates a PDF, uploads it to a **private** Supabase bucket, and writes a `Document` row. The wizard returns `clientId` + `dogId` to the booking flow. There is no client login; identity is the email address.
4. **Pay** — `createCheckoutAction` re-checks the slot is still free, inserts a booking with `status: pending_payment`, then creates a Stripe Checkout Session that holds `bookingId` in metadata. The browser redirects to Stripe.
5. **Confirmed** — only the **webhook** (`checkout.session.completed` or `async_payment_succeeded`) flips the row to `confirmed` and sends emails. The success page is not trusted to do this.
6. **Cancelled / abandoned** — Stripe `expired` / `async_payment_failed`, or a hold older than **30 minutes**, sets `pending_payment` → `cancelled` so the slot is offered again.

`pending_payment` **occupies** the slot the same as `confirmed`. That is the hold. If you stop treating pending as busy, two people can pay for the same hour.

Webhook handler (`src/lib/checkout-events.ts`) is idempotent: a second `completed` event on an already `confirmed` booking is a no-op (`already_confirmed`) so Stripe retries do not double-email.

### Availability engine

All wall-clock times are **Europe/London** (`src/lib/availability-slots.ts`), including BST. Do not generate slots in UTC and label them as local.

Inputs:

- Weekly `AvailabilityRule` rows (day of week 1–7, `HH:mm` start/end) edited in admin
- `BlockedDate` (whole days off)
- Existing `pending_payment` + `confirmed` bookings (busy windows use **that booking’s service duration**, which may differ from the service currently being booked)
- Lead time: no slot starting within **60 minutes**
- Horizon: **14 days**

`getAvailableSlots` calls `releaseExpiredHolds()` first so abandoned checkouts do not block the diary forever.

### Stripe

- Checkout is created server-side (`src/lib/checkout.ts`). Wallets (Apple Pay / Google Pay) appear when Stripe and the device allow them; you do not implement wallet buttons yourself.
- `NEXT_PUBLIC_APP_URL` must match the URL Stripe redirects to (`/book/confirmed`, `/book?cancelled=1`).
- Local webhooks: each `stripe listen` session prints a **new** `whsec_...`. Paste it into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`. An old secret makes every webhook 400 and bookings stay `pending_payment`.
- Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

### Email (Resend)

`isResendConfigured()` is true only when `RESEND_API_KEY` starts with `re_` and is **not** the placeholder `re_...`. If it is not configured, contact, intake, and booking emails are skipped with a server log — the booking still confirms. That is intentional so local work does not fail on mail.

### Admin dashboard

`/admin` is gated by Supabase Auth (`requireAdmin` + middleware session refresh). There is no extra roles table — anyone who can sign in is the trainer.

| Page | What it is for |
|------|----------------|
| `/admin` | Today’s diary, next sessions, recent intakes and enquiries |
| `/admin/bookings` | Filter by status / today / upcoming / past |
| `/admin/bookings/[id]` | Client, dog, intake answers, payment ids, notes, cancel (frees the slot) |
| `/admin/clients` | Owners created by intake (matched later by email) |
| `/admin/clients/[id]` | Dogs, bookings, files, extra upload |
| `/admin/availability` | Weekly hours + blocked dates |
| `/admin/intakes` | Intake list + PDF download |
| `/admin/documents` | All private files + upload PDF/JPEG/PNG/WebP |
| `/admin/enquiries` | Contact form messages |

Downloads go through `/admin/documents/[id]/file`, which checks you are signed in, then issues a **10-minute** signed URL to the private `client-documents` bucket. Direct public URLs should not work.

Cancelling a booking in admin sets `cancelled`. That status is not treated as busy, so the slot returns to `/book`.

Deleting a client (GDPR) removes their dogs, bookings, and private files. Type their name to confirm. Stripe may still hold payment records.

### Security (RLS and secrets)

- Admin routes are behind Supabase Auth middleware.
- Prisma talks to Postgres with `DATABASE_URL` (the database role). That **bypasses** Row Level Security.
- `supabase/rls.sql` turns RLS on for every public table with **no anon policies**, so a leaked `NEXT_PUBLIC_SUPABASE_ANON_KEY` cannot read PII through PostgREST. Run that SQL in the Supabase SQL editor after `db:push`.
- Storage bucket `client-documents` is private. Downloads are 10-minute signed URLs after an admin session check.
- Never put `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET` in client code.

### Cookies and privacy

- `/privacy` — what we store, why, how long, your rights, ICO.
- `/cookies` — `gundog-theme` and admin session cookies only. No ads cookies.
- Public pages show a small notice until dismissed (stored in `localStorage`, not a tracking cookie).

### PWA and sharing

- `src/app/manifest.ts` lets supported browsers “Add to Home Screen”.
- Open Graph / Twitter cards use `NEXT_PUBLIC_APP_URL` as `metadataBase` and the hero photo.

### Theme, favicon, images

- Favicon: `src/app/icon.svg` (Next.js App Router file convention).
- Photos are Unsplash working-dog shots referenced from `content/site.ts`. They are placeholders until you have your own trainer/dog pictures. `next.config.ts` allowlists `images.unsplash.com` and `*.supabase.co`.

### Things that are easy to break

- **Do not confirm bookings from the success page.** Confirm in the webhook only.
- **Do not move Prisma secrets solely into `.env.local`.**
- **Do not add `pointer-events: none` or colour Field footer `li` elements** in a way that hides links — Field navy + muted navy already did that once.
- **Do not wrap admin in `data-theme`.**
- Intake matches clients by email and creates a **new dog every time**. Repeat bookings for the same dog will duplicate `Dog` rows unless you later add “pick an existing dog”.
- Server actions in `src/app/actions/` are the write API. Keep validation (Zod) on that boundary; the browser wizard is not trusted.
- Rate limits exist on contact and intake (`src/lib/rate-limit.ts`) — in-memory, so they reset on every server restart and do not work across multiple server instances.

## Stripe webhooks (local testing)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Paste the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` in `.env`, then restart `npm run dev`.

Apple Pay and Google Pay appear on Stripe Checkout on supported devices. Production wallets also need your domain verified in Stripe.

## Tests

```bash
npm test          # unit tests (validation, slots, checkout, emails, theme)
npm run test:e2e  # Playwright against the running app
```

The first e2e run downloads Chromium (`npx playwright install chromium`). On Windows the install cache can move between environments; if Playwright says the browser executable is missing, run that install again.

Unit tests are the right place for slot maths, webhook idempotency, and Zod schemas. E2e covers “a page renders and a form validates” — they do not complete a real Stripe payment unless you add that flow later.

## Project structure

```
content/                 # Site copy, nav, Unsplash image URLs
e2e/                     # Playwright flows
src/
├── app/
│   ├── icon.svg         # Favicon
│   ├── (marketing)/     # Public pages, booking, intake, privacy, cookies, training
│   ├── admin/           # Bookings, clients, documents, availability, intakes, enquiries
│   ├── actions/         # Server actions (booking, intake, contact)
│   ├── manifest.ts      # Add to Home Screen
│   └── api/webhooks/    # Stripe webhook
├── components/
│   ├── booking/         # Multi-step book → pay flow
│   ├── forms/           # Contact + intake
│   ├── marketing/       # Header, hero, footer, gallery
│   └── theme/           # Heath / Field look toggle
└── lib/                 # Availability, Stripe, email, Zod schemas, theme cookie
prisma/
├── schema.prisma
└── seed.ts
supabase/
├── README.md
└── rls.sql              # Enable RLS (run in SQL editor)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed services, testimonials, hours |
| `npm run db:studio` | Open Prisma Studio |

## Going live (when you are ready)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com). Add every env var from `.env.example`.
2. Set `NEXT_PUBLIC_APP_URL` to the live HTTPS origin (needed for Stripe redirects, Open Graph, and signed links).
3. Point Stripe webhooks at `https://your-domain/api/webhooks/stripe` and paste the live `whsec_...` into Vercel.
4. Run `supabase/rls.sql` in the Supabase SQL editor.
5. Confirm the `client-documents` bucket is private.

HTTPS is automatic on Vercel. Apple Pay / Google Pay need the domain verified in Stripe.

## What is in place

- Marketing: home, about, training, pricing, contact, privacy, cookies
- Photo gallery of working gundogs in field and urban settings (Unsplash placeholders)
- Booking: session type → UK time slots → intake → Stripe Checkout
- Intake PDF stored in a private Supabase bucket
- Admin: overview, bookings with filters/detail, clients (including GDPR delete), documents, availability, intakes, enquiries
- Paid bookings confirm from the Stripe webhook and queue HTML + text emails
- Abandoned checkouts release the slot after 30 minutes
- Heath / Field public looks, cookie-persisted
- PWA manifest, Open Graph tags, cookie notice, RLS SQL to apply in Supabase
