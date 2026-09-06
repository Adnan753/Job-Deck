# Job Deck

## Architecture

The frontend (React/Vite) never talks to Supabase directly for data — only for auth (sign in/up/out). All reads and writes to jobs/contacts/portals/events/projects go through a small Express API in [`server/`](server), which:

- verifies the caller's Supabase access token on every request,
- then performs the query as *that user*, via a Supabase client scoped to their token (not the service_role key) — so Row Level Security still enforces per-user isolation, same as before.

`npm run dev` and `npm run electron:dev` start both the API server (port 8787 by default) and Vite together. To run the API alone: `npm run server`.

## Supabase setup

This app stores all data (jobs, contacts, portals, events, projects) in Supabase and requires an account (email/password) to sign in.

1. Open your Supabase project -> **SQL Editor** -> New Query, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the tables and Row Level Security policies (each signed-in user only ever sees their own rows).
2. Open **Project Settings -> API**, copy the **Project URL** and **anon public** key.
3. Edit `.env.local` (already created, gitignored) and replace the placeholder values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart the dev server (`npm run dev` / `npm run electron:dev`) so Vite picks up the new env vars.
5. Open the app and use "Don't have an account? Sign up" to create your account. If your Supabase project has email confirmation enabled, confirm via the email it sends before signing in.

Never put the **service_role** key in this app — only the anon/public key, which is safe for client code and is constrained by the RLS policies in `supabase/schema.sql`.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
