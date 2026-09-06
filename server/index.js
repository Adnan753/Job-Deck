import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In the packaged Electron app, .env.local ships as an extra resource next to
// the app; in dev (either `npm run server` or the Vite dev server) it lives at
// the project root. process.resourcesPath only exists inside Electron.
const envPath = process.resourcesPath
  ? path.join(process.resourcesPath, '.env.local')
  : path.join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const ALLOWED_TABLES = ['jobs', 'contacts', 'portals', 'events', 'projects'];

const ORDER_BY = {
  jobs: { column: 'created_at', ascending: false },
  contacts: { column: 'created_at', ascending: false },
  portals: { column: 'created_at', ascending: false },
  events: { column: 'date', ascending: true },
  projects: { column: 'created_at', ascending: false }
};

export function createApp() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Missing Supabase credentials for the API server. Fill in VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY in .env.local, then restart the server.'
    );
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Every request is verified against Supabase Auth, then all data access below
  // runs through a Supabase client scoped to *that user's* access token -- never
  // the service_role key. Row Level Security (see supabase/schema.sql) is what
  // actually enforces "you only see your own rows"; this server never bypasses it.
  const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing access token.' });
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    req.userId = data.user.id;
    req.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    next();
  };

  const requireKnownTable = (req, res, next) => {
    if (!ALLOWED_TABLES.includes(req.params.table)) {
      return res.status(404).json({ error: 'Unknown resource.' });
    }
    next();
  };

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Single round trip for the initial load of every collection, instead of the
  // frontend firing five separate authenticated requests.
  app.get('/api/bootstrap', requireAuth, async (req, res) => {
    const results = await Promise.all(
      ALLOWED_TABLES.map(table => {
        const { column, ascending } = ORDER_BY[table];
        return req.supabase.from(table).select('*').order(column, { ascending });
      })
    );

    const firstError = results.find(r => r.error)?.error;
    if (firstError) {
      return res.status(400).json({ error: firstError.message });
    }

    const [jobs, contacts, portals, events, projects] = results.map(r => r.data);
    res.json({ jobs, contacts, portals, events, projects });
  });

  app.get('/api/:table', requireAuth, requireKnownTable, async (req, res) => {
    const { column, ascending } = ORDER_BY[req.params.table];
    const { data, error } = await req.supabase.from(req.params.table).select('*').order(column, { ascending });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/:table', requireAuth, requireKnownTable, async (req, res) => {
    const { data, error } = await req.supabase.from(req.params.table).insert(req.body).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  app.patch('/api/:table/:id', requireAuth, requireKnownTable, async (req, res) => {
    const { data, error } = await req.supabase
      .from(req.params.table)
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  app.delete('/api/:table/:id', requireAuth, requireKnownTable, async (req, res) => {
    const { error } = await req.supabase.from(req.params.table).delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  return app;
}

export function startServer(port = process.env.API_PORT || 8787) {
  const app = createApp();
  return new Promise((resolve) => {
    const server = app.listen(port, '127.0.0.1', () => {
      console.log(`Job Deck API listening on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  startServer();
}
