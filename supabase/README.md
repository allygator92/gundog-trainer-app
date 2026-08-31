# Supabase setup

## 1. Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Copy the project URL and anon key from **Settings → API** into `.env.local`.
3. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to the client).

## 2. Database connection strings

From **Settings → Database → Connection string**:

- Use the **Transaction pooler** URI for `DATABASE_URL` (port 6543, `?pgbouncer=true`)
- Use the **Session pooler** or direct URI for `DIRECT_URL` (port 5432)

Then run:

```bash
npm run db:push
npm run db:seed
```

## 3. Admin authentication

Create an admin user under **Authentication → Users → Add user** (email + password).

Sign in at `/admin/login`.

## 4. Storage bucket (for Phase 2 intake PDFs)

Create a private bucket named `client-documents` under **Storage**:

- Public bucket: **off**
- Allowed MIME types: `application/pdf` (and others as needed)
- File size limit: as required

Access files via signed URLs using the service role client in server actions.

## 5. Row Level Security (Phase 6)

RLS policies will be added in the security phase. For Phase 0, all database access goes through Prisma using the connection string (bypasses RLS when using the service role / direct connection).
