import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(await authHeaders()),
      ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { data: null, error: { message: body.error || res.statusText || 'Request failed.' } };
    }
    return { data: body, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message || 'Could not reach the Job Deck API server.' } };
  }
}

export const api = {
  bootstrap: () => request('/api/bootstrap'),
  list: (table) => request(`/api/${table}`),
  create: (table, payload) => request(`/api/${table}`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (table, id, payload) => request(`/api/${table}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (table, id) => request(`/api/${table}/${id}`, { method: 'DELETE' })
};
