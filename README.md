# AVISHKAR 2K26

Public event website and Supabase-backed team registration, participant, and administrator portals for the AIT Innovation Hackathon.

## Features

- Public pages for the event, domains, schedule, guidelines, FAQ, contact, registration, privacy, terms and the Chikkamagaluru travel guide at `/blog`.
- Participant portal with team details, registration status, announcements, project submission, accommodation requests and a team meal QR code.
- Administrator portal with registration review, team management, announcements, domain editing, CSV export, accommodation request management and meal QR scanning.
- Supabase Auth and Postgres with database row-level security.

## Event details

- AVISHKAR 2K26, 25-26 November 2026 at AIT, Chikkamagaluru, Karnataka.
- Registration fee: INR 1,500 per team. Prize pool: INR 1,00,000.
- Payment collection details and accommodation availability must be confirmed by event organisers.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Stop the server with Ctrl+C. For production, run `npm run build` followed by `npm start`.

## Configure Supabase

1. Create a Supabase project. In Project Settings / API, copy the Project URL and publishable key (or use the legacy anon key if that is what your project provides).
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. The app also accepts the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable.
3. For a new project, install the CLI with `npm install supabase --save-dev`, initialize it with `npx supabase init`, then run `npx supabase login` and `npx supabase link --project-ref <project-ref>`. Preview with `npx supabase db push --dry-run --remote`; apply only after checking the target with `npx supabase db push --remote`. For an existing project with migrations previously run in the SQL Editor, use the SQL Editor for the new migration unless CLI migration history has been aligned.
4. In Authentication / Providers, enable Email sign-in. In Authentication / URL Configuration, set `http://localhost:3000` as the Site URL and add `http://localhost:3000/auth/callback` to Redirect URLs. Add the production HTTPS origin and its `/auth/callback` before deployment.
5. Create and verify the intended administrator account. In the Supabase SQL Editor, assign its role:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('verified-admin@example.com');
```

Replace the sample address with the verified admin email. Keep the SQL Editor limited to trusted project administrators. Do not put a service-role key in the app or any `NEXT_PUBLIC_` variable.

6. For admin passkeys, open Authentication / Passkeys and enable passkey authentication. For local development set the WebAuthn RP ID to `localhost` and allowed origin to `http://localhost:3000`. Configure the production domain separately before deploying. Supabase passkeys are experimental and require a confirmed account.
7. For the first setup only, sign in with the admin email using `/login?next=%2Fadmin%2Fpasskey%2Fsetup`, then register the passkey. The admin portal sign-in at `/admin/login` uses only email and passkey after setup; team leaders continue to use email magic links at `/login`.
8. Sign in at `/admin` with the enrolled passkey and verify expected reads and writes before opening registration. Use a staging project first if production already contains event data.

## Database migrations

Apply these files in order to a new project:

1. `supabase/migrations/202611090001_initial_schema.sql`
2. `supabase/migrations/202611090002_portals.sql`
3. `supabase/migrations/202611090003_official_domains_and_multi_registration.sql`
4. `supabase/migrations/202611100004_archive_event_details.sql`
5. `supabase/migrations/202611100005_civilx_official_rules.sql`
6. `supabase/migrations/202611100006_accommodation_and_meal_qr.sql`
7. `supabase/migrations/202611100007_preserve_admin_team_leaders.sql`

For an existing database, apply only the migrations not already applied, in order. Migration 006 adds random per-team QR credentials, accommodation requests and duplicate-protected meal check-ins. Migration 007 prevents team registration from replacing an administrator role.

## Operations

- `/portal`: team workspace. Team leaders submit and update accommodation requests; organisers set their status in `/admin/accommodation`. Admins who lead a team can access both workspaces.
- Team meal QR codes are shown in `/portal`. `/admin/meals` scans a team once per meal type per India-local date. The scanner needs camera permission and an HTTPS page (localhost is supported for development); it also provides a manual input fallback.
- QR values act as team credentials. Share them only with the team and authorised event staff.
- `/supabase/tests/portal_isolation.sql` contains participant isolation checks. Substitute real account UUIDs before running.

The project URL and publishable key are set in the ignored local `.env.local` file. Apply the migrations in order before using the data-backed features.
