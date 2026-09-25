// Simulateur minimal de Supabase pour les tests de bout en bout :
//   /auth/v1/*       comptes (inscription + code, connexion, mot de passe oublié…)
//   /rest/v1/rpc/*   appel des fonctions SQL, avec les droits de la personne connectée
// Branché sur la vraie base PostgreSQL et ses règles d'accès.
const http = require('http');
const crypto = require('crypto');
const { Pool } = require('pg');
const { SignJWT, jwtVerify } = require('jose');

const PORT = 54321;
const SECRET = new TextEncoder().encode('secret-de-test-uniquement-pour-le-banc-d-essai');
const db = new Pool({ host: '127.0.0.1', user: 'postgres', password: 'postgres', database: 'carnet', max: 4 });
const codes = new Map();   // email → { code, type }
const refresh = new Map(); // refresh_token → user id

const sign = (claims, ttl = 3600) =>
  new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${ttl}s`).sign(SECRET);

async function userRow(where, value) {
  const r = await db.query(`select * from auth.users where ${where} = $1`, [value]);
  return r.rows[0];
}
const userJson = (u) => ({
  id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email,
  email_confirmed_at: u.email_confirmed_at, confirmed_at: u.email_confirmed_at,
  user_metadata: u.raw_user_meta_data || {}, app_metadata: { provider: 'email', providers: ['email'] },
  identities: [{ id: u.id, user_id: u.id, provider: 'email', identity_data: { email: u.email } }],
  created_at: u.created_at, updated_at: u.updated_at,
});
async function session(u) {
  const access_token = await sign({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated' });
  const refresh_token = crypto.randomBytes(16).toString('hex');
  refresh.set(refresh_token, u.id);
  return { access_token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
           refresh_token, user: userJson(u) };
}
const newCode = (email, type) => { const code = String(crypto.randomInt(0, 1e6)).padStart(6, '0'); codes.set(email, { code, type }); return code; };
const authError = (status, msg, error_code) => ({ status, body: { code: status, error_code, msg, message: msg } });

async function claims(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : req.headers.apikey;
  if (!token) return { role: 'anon' };
  try { const { payload } = await jwtVerify(token, SECRET); return payload; } catch { return null; }
}

async function handleAuth(req, path, url, body) {
  if (path === '/signup' && req.method === 'POST') {
    const email = (body.email || '').toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return authError(400, 'Unable to validate email address: invalid format', 'validation_failed');
    if ((body.password || '').length < 6) return authError(422, 'Password should be at least 6 characters.', 'weak_password');
    const existing = await userRow('email', email);
    if (existing) return { status: 200, body: { ...userJson(existing), identities: [] } }; // comme Supabase : pas de fuite
    const r = await db.query(`insert into auth.users (email, encrypted_password, raw_user_meta_data) values ($1, $2, $3) returning *`,
      [email, body.password, body.data || {}]);
    newCode(email, 'signup');
    return { status: 200, body: { ...userJson(r.rows[0]), confirmation_sent_at: new Date().toISOString() } };
  }
  if (path === '/verify' && req.method === 'POST') {
    const email = (body.email || '').toLowerCase();
    const c = codes.get(email);
    const ok = c && c.code === body.token && (c.type === body.type || (c.type === 'signup' && body.type === 'email'));
    if (!ok) return authError(403, 'Token has expired or is invalid', 'otp_expired');
    codes.delete(email);
    await db.query(`update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = $1`, [email]);
    return { status: 200, body: await session(await userRow('email', email)) };
  }
  if (path === '/token' && req.method === 'POST') {
    if (url.searchParams.get('grant_type') === 'refresh_token') {
      const id = refresh.get(body.refresh_token);
      if (!id) return authError(400, 'Invalid Refresh Token', 'refresh_token_not_found');
      refresh.delete(body.refresh_token);
      return { status: 200, body: await session(await userRow('id', id)) };
    }
    const u = await userRow('email', (body.email || '').toLowerCase());
    if (!u || u.encrypted_password !== body.password) return authError(400, 'Invalid login credentials', 'invalid_credentials');
    if (!u.email_confirmed_at) return authError(400, 'Email not confirmed', 'email_not_confirmed');
    return { status: 200, body: await session(u) };
  }
  if (path === '/recover' && req.method === 'POST') {
    const email = (body.email || '').toLowerCase();
    if (await userRow('email', email)) newCode(email, 'recovery');
    return { status: 200, body: {} };
  }
  if (path === '/resend' && req.method === 'POST') {
    newCode((body.email || '').toLowerCase(), body.type || 'signup');
    return { status: 200, body: {} };
  }
  if (path === '/user') {
    const c = await claims(req);
    if (!c || !c.sub) return authError(401, 'Invalid JWT', 'bad_jwt');
    if (req.method === 'PUT' && body.password) await db.query(`update auth.users set encrypted_password = $2 where id = $1`, [c.sub, body.password]);
    const u = await userRow('id', c.sub);
    if (!u) return authError(404, 'User not found', 'user_not_found');
    return { status: 200, body: userJson(u) };
  }
  if (path === '/logout') return { status: 204, body: null };
  return authError(404, 'Not found', 'not_found');
}

// ─── Fonction serveur « ai » : le vrai code (supabase/functions/ai/handler.ts), branché sur un faux Mistral ───
const path = require('path');
const { pathToFileURL } = require('url');
let aiHandler = null;
const aiCalls = { transcriptions: 0, classement: 0, fiche: 0, revue: 0 };
const ANON = { key: '' };

function fakeMistral(pathname, raw, headers) {
  if (pathname.endsWith('/v1/audio/transcriptions')) {
    aiCalls.transcriptions++;
    const okForm = (headers['content-type'] || '').startsWith('multipart/form-data') && raw.length > 100
      && raw.includes('name="model"') && raw.includes('voxtral') && raw.includes('name="language"');
    if (!okForm) return { status: 400, body: { message: 'formulaire invalide' } };
    return { status: 200, body: { model: 'voxtral-mini-latest', text: 'Le soir, il aime écouter Brassens avant de dormir.', language: 'fr', usage: {} } };
  }
  if (pathname.endsWith('/v1/chat/completions')) {
    const req = JSON.parse(raw);
    const kind = req.response_format.json_schema.name;
    aiCalls[kind]++;
    const data = JSON.parse(req.messages[1].content);
    let out;
    if (kind === 'classement') {
      const t = data.note.toLowerCase();
      const category = /brassens|musique|chanson|aime/.test(t) ? 'gouts' : /matin|café/.test(t) ? 'habitudes'
        : /parler|appeler/.test(t) ? 'parler' : /calme|apaise/.test(t) ? 'apaise' : 'histoire';
      out = { category, moment: /soir|dormir/.test(t) ? 'soir' : /matin/.test(t) ? 'matin' : 'aucun', reason: 'D\'après les mots de la note.' };
    } else if (kind === 'fiche') {
      const name = (req.messages[0].content.match(/s'appelle (\S+)/) || [])[1] || 'la personne';
      const seen = new Set(), essentials = [];
      for (const n of data.notes) if (!seen.has(n.category) && essentials.length < 3) { seen.add(n.category); essentials.push({ category: n.category, text: n.text }); }
      out = { intro: `Voici l'essentiel pour bien accompagner ${name}.`, essentials };
    } else {
      const n = data.notes[data.notes.length - 1];
      out = { items: [{ kind: 'stale', noteId: n.id, category: n.category, question: `« ${n.text.slice(0, 40)} » : est-ce toujours d'actualité ?` }] };
    }
    return { status: 200, body: { choices: [{ message: { role: 'assistant', content: JSON.stringify(out) } }] } };
  }
  return { status: 404, body: {} };
}

async function handleFunction(req, url, rawBuf) {
  if (!aiHandler) aiHandler = await import(pathToFileURL(path.join(__dirname, '../functions/ai/handler.ts')).href);
  const env = { MISTRAL_API_KEY: 'cle-de-test', MISTRAL_BASE_URL: `http://127.0.0.1:${PORT}/fake-mistral`,
                SUPABASE_URL: `http://127.0.0.1:${PORT}`, SUPABASE_ANON_KEY: ANON.key };
  const request = new Request(`http://127.0.0.1:${PORT}${url.pathname}`, {
    method: req.method, headers: req.headers, body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : rawBuf });
  const res = await aiHandler.handle(request, env);
  const text = await res.text();
  return { status: res.status, raw: text, headers: Object.fromEntries(res.headers) };
}

const PG_STATUS = { '42501': 403, '23505': 409, 'P0001': 400, '22023': 400, '23514': 400, '54000': 400 };

async function handleRpc(req, fn, body) {
  if (!/^[a-z_]+$/.test(fn)) return { status: 404, body: { message: 'not found' } };
  const c = await claims(req);
  if (!c) return { status: 401, body: { message: 'JWT invalide' } };
  const role = c.role === 'authenticated' ? 'authenticated' : 'anon';
  const keys = Object.keys(body || {});
  const client = await db.connect();
  try {
    await client.query('begin');
    await client.query(`set local role ${role}`);
    await client.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(c)]);
    const r = await client.query(`select public.${fn}(${keys.map((k, i) => `${k} => $${i + 1}`).join(', ')}) as r`, keys.map(k => body[k]));
    await client.query('commit');
    return { status: 200, body: r.rows[0].r };
  } catch (e) {
    await client.query('rollback').catch(() => {});
    return { status: PG_STATUS[e.code] || 400, body: { code: e.code, message: e.message, details: e.detail || null, hint: e.hint || null } };
  } finally { client.release(); }
}

http.createServer(async (req, res) => {
  const cors = { 'access-control-allow-origin': req.headers.origin || '*', 'access-control-allow-headers': '*',
                 'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'access-control-expose-headers': '*' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const parts = []; for await (const chunk of req) parts.push(chunk);
  const rawBuf = Buffer.concat(parts), raw = rawBuf.toString('latin1');
  let body = {}; try { body = raw ? JSON.parse(rawBuf.toString('utf8')) : {}; } catch {}
  let out;
  try {
    if (url.pathname.startsWith('/functions/v1/')) {
      const r = await handleFunction(req, url, rawBuf);
      res.writeHead(r.status, { ...r.headers, ...cors });
      return res.end(r.status === 204 ? undefined : r.raw);
    }
    if (url.pathname.startsWith('/fake-mistral/')) out = fakeMistral(url.pathname, url.pathname.endsWith('/chat/completions') ? rawBuf.toString('utf8') : raw, req.headers);
    else if (url.pathname === '/test/ai-calls') out = { status: 200, body: aiCalls };
    else if (url.pathname.startsWith('/auth/v1')) out = await handleAuth(req, url.pathname.slice(8), url, body);
    else if (url.pathname.startsWith('/rest/v1/rpc/')) out = await handleRpc(req, url.pathname.slice(13), body);
    else if (url.pathname === '/test/code') out = { status: 200, body: codes.get((url.searchParams.get('email') || '').toLowerCase()) || null };
    else out = { status: 404, body: { message: 'not found' } };
  } catch (e) { out = { status: 500, body: { message: e.message } }; }
  if (out.status === 204) { res.writeHead(204, cors); return res.end(); }
  res.writeHead(out.status, { ...cors, 'content-type': 'application/json' });
  res.end(JSON.stringify(out.body));
}).listen(PORT, '127.0.0.1', async () => {
  console.log(`mini-supabase prêt sur http://127.0.0.1:${PORT}`);
  ANON.key = await sign({ role: 'anon' }, 3600 * 24 * 365);
  console.log('ANON_KEY=' + ANON.key);
});
