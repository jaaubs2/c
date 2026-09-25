// Connexion au serveur (Supabase) : comptes, carnets, notes, partages,
// invitations, établissement, RGPD. Exposé aux écrans sous window.Backend.
//
// Sans configuration (ou avec « ?demo » dans l'adresse), l'app reste en mode
// démonstration : données d'exemple, rien n'est envoyé nulle part.
import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const forceDemo = new URLSearchParams(window.location.search).has("demo");

const enabled = Boolean(URL_ && KEY) && !forceDemo;
const sb = enabled
  ? createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

// ─── Messages d'erreur compréhensibles ───────────────────────────────
const ERRORS = [
  [/Invalid login credentials/i, "Email ou mot de passe incorrect."],
  [/Email not confirmed/i, "Confirme d'abord ton email avec le code reçu."],
  [/already registered|already been registered|already exists/i, "Un compte existe déjà avec cet email."],
  [/Token has expired or is invalid|otp.*(expired|invalid)|invalid.*(otp|token)/i, "Code incorrect ou expiré. Demande un nouveau code."],
  [/Password should be|weak.?password|password.*(short|at least)/i, "Mot de passe trop court : au moins 8 caractères."],
  [/New password should be different/i, "Choisis un mot de passe différent de l'ancien."],
  [/For security purposes|rate limit|too many requests/i, "Trop de demandes d'un coup. Patiente une minute avant de réessayer."],
  [/provider is not enabled|Unsupported provider/i, "Cette méthode de connexion n'est pas encore activée."],
  [/Signups not allowed/i, "Les inscriptions sont fermées pour le moment."],
  [/Unable to validate email|invalid.*email/i, "Cet email ne semble pas valide."],
  [/Failed to fetch|NetworkError|Load failed|network request failed/i, "Pas de connexion au serveur. Vérifie ta connexion internet."],
  [/row-level security|permission denied/i, "Tu n'as pas le droit de faire cette action."],
  [/violates check constraint/i, "Une information n'est pas valide. Vérifie ce que tu as saisi."],
];

function toFrench(error) {
  const raw = (error && (error.message || error.error_description || error.msg)) || String(error || "");
  for (const [re, msg] of ERRORS) if (re.test(raw)) return withCause(msg, error);
  // Les messages rédigés dans la base sont déjà en français.
  if (/[éèàçêôû]/.test(raw) || /^(Seul|Seule|Tu |Ce |Carnet|Note|Lien|Trop|Il faut|Unité|Membre|Connecte|Aucun|La durée)/.test(raw)) {
    return withCause(raw, error);
  }
  return withCause("Une erreur est survenue. Réessaie dans un instant.", error);
}
function withCause(message, cause) {
  const e = new Error(message);
  e.cause = cause;
  if (cause) console.warn("[carnet]", cause);
  return e;
}

async function call(fn, args = {}) {
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw toFrench(error);
  return data;
}
async function auth(promise) {
  const { data, error } = await promise;
  if (error) throw toFrench(error);
  return data;
}

// ─── Liens partageables ──────────────────────────────────────────────
// Le jeton est placé après « # » : il n'est jamais envoyé au serveur web.
function publicBase() {
  const configured = import.meta.env.VITE_PUBLIC_URL;
  if (configured) return configured.replace(/\/?$/, "/");
  return window.location.origin + window.location.pathname.replace(/[^/]*$/, "");
}
const shareUrl = (token) => `${publicBase()}#fiche=${token}`;
const inviteUrl = (token) => `${publicBase()}#invitation=${token}`;

function readLink() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (params.get("fiche")) return { kind: "fiche", token: params.get("fiche") };
  if (params.get("invitation")) return { kind: "invitation", token: params.get("invitation") };
  return null;
}
function clearLink() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

// ─── Conversion vers le format des écrans ────────────────────────────
const ts = (d) => (d ? Date.parse(d) : undefined);
const mapNote = (n) => ({
  id: n.id,
  carnetId: n.carnet_id,
  text: n.body,
  catId: n.category,
  ts: ts(n.created_at),
  author: n.author_name || "",
  authorRole: n.author_role || "",
  authorId: n.author_id,
  status: n.status || "published",
  confirmedAt: ts(n.confirmed_at),
  archived: Boolean(n.archived_at),
  archivedAt: ts(n.archived_at),
});

// ─── IA (fonction serveur « ai » : la clé Mistral reste sur le serveur) ───
async function invokeAi(body) {
  const { data, error } = await sb.functions.invoke("ai", { body });
  if (!error) return data;
  let message = "", code = "";
  try { const j = await error.context.json(); message = j.error || ""; code = j.code || ""; } catch (_e) { /* pas de corps */ }
  if (code === "not_configured") Backend.ai.available = false;
  const e = new Error(message || (error.name === "FunctionsFetchError"
    ? "Pas de connexion au serveur. Vérifie ta connexion internet."
    : "L'IA n'a pas pu répondre. Réessaie dans un instant."));
  e.code = code;
  throw e;
}
const audioName = (type = "") =>
  type.includes("mp4") || type.includes("aac") ? "note.m4a" : type.includes("ogg") ? "note.ogg" : "note.webm";

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const Backend = {
  enabled,
  demo: !enabled,
  shareUrl,
  inviteUrl,
  readLink,
  clearLink,
  mapNote,

  // ── Comptes ──
  async session() {
    const { data } = await sb.auth.getSession();
    return data.session;
  },
  onAuthChange(callback) {
    const { data } = sb.auth.onAuthStateChange((event, session) => callback(event, session));
    return () => data.subscription.unsubscribe();
  },
  async signUp({ email, password, displayName, accountType = "aidant", intent = "aidant" }) {
    const data = await auth(
      sb.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: (displayName || "").trim(), account_type: accountType, intent, consents: ["terms", "sensitive_data"] },
          emailRedirectTo: publicBase(),
        },
      })
    );
    // Supabase ne dit pas qu'un email est déjà pris (protection) : il renvoie un compte sans identité.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error("Un compte existe déjà avec cet email. Connecte-toi, ou utilise « Mot de passe oublié ».");
    }
    return { needsCode: !data.session };
  },
  async verifySignup(email, code) {
    const r = await sb.auth.verifyOtp({ email: email.trim(), token: code, type: "signup" });
    if (!r.error) return r.data;
    return auth(sb.auth.verifyOtp({ email: email.trim(), token: code, type: "email" }));
  },
  resendSignup: (email) => auth(sb.auth.resend({ type: "signup", email: email.trim() })),
  signIn: (email, password) => auth(sb.auth.signInWithPassword({ email: email.trim(), password })),
  async signInWithProvider(provider) {
    if (Capacitor.isNativePlatform()) {
      throw new Error("Dans l'app, connecte-toi avec ton email pour l'instant.");
    }
    return auth(sb.auth.signInWithOAuth({ provider, options: { redirectTo: publicBase() } }));
  },
  sendRecovery: (email) => auth(sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: publicBase() })),
  async resetPassword(email, code, password) {
    await auth(sb.auth.verifyOtp({ email: email.trim(), token: code, type: "recovery" }));
    return auth(sb.auth.updateUser({ password }));
  },
  async signOut() {
    await sb.auth.signOut();
  },

  // ── Démarrage ──
  bootstrap: () => call("app_bootstrap"),
  updateProfile: (displayName) => call("profile_update", { p_display_name: displayName }),

  // ── Carnet d'un aidant ──
  createCarnet: ({ name, age, since, relation, avatar, pronoun, personConsent }) =>
    call("carnet_create", {
      p_person_name: name,
      p_person_age: age === "" || age == null ? null : Number(age),
      p_since: since || null,
      p_relation: relation || null,
      p_avatar: avatar || null,
      p_pronoun: pronoun || "elle",
      p_person_consent: personConsent || null,
    }),
  updateCarnet: (id, { name, age, since, pronoun, avatar, room, unitId }) =>
    call("carnet_update", {
      p_carnet: id,
      p_person_name: name,
      p_person_age: age === "" || age == null ? null : Number(age),
      p_since: since || null,
      p_pronoun: pronoun || null,
      p_avatar: avatar || null,
      p_room: room || null,
      p_unit: unitId || null,
    }),

  // ── Notes ──
  async listNotes(carnetId) {
    return (await call("notes_list", { p_carnet: carnetId })).map(mapNote);
  },
  async addNote(carnetId, { text, catId, inputMode, aiCategory }) {
    return mapNote(await call("note_add", {
      p_carnet: carnetId, p_category: catId, p_body: text,
      p_input_mode: inputMode === "voice" ? "voice" : "text", p_ai_category: aiCategory || null,
    }));
  },
  async updateNote(id, { text, catId }) {
    return mapNote(await call("note_update", { p_note: id, p_body: text, p_category: catId || null }));
  },
  async confirmNote(id) {
    return mapNote(await call("note_confirm", { p_note: id }));
  },
  async archiveNote(id, archived = true) {
    return mapNote(await call("note_archive", { p_note: id, p_archived: archived }));
  },
  deleteNote: (id) => call("note_delete", { p_note: id }),
  async validateNote(id, approve) {
    return mapNote(await call("note_validate", { p_note: id, p_approve: approve }));
  },

  // ── Partage par lien ──
  async createShare({ carnetId, recipientType, recipientName, categories, days = 7, intro, aiSummary }) {
    const r = await call("create_share", {
      p_carnet: carnetId,
      p_recipient_type: recipientType,
      p_recipient_name: recipientName || "",
      p_categories: categories,
      p_expires_in_days: days,
      p_intro: intro || null,
      p_ai_summary: aiSummary && aiSummary.essentials && aiSummary.essentials.length ? aiSummary : null,
    });
    return { id: r.id, url: shareUrl(r.token), expiresAt: ts(r.expires_at) };
  },
  async listShares(carnetId) {
    return (await call("list_shares", { p_carnet: carnetId })).map((s) => ({
      id: s.id,
      recipientType: s.recipient_type,
      name: s.recipient_name,
      included: s.categories,
      createdAt: ts(s.created_at),
      expiresAt: ts(s.expires_at),
      revokedAt: ts(s.revoked_at),
      openCount: Number(s.open_count || 0),
      lastOpenedAt: ts(s.last_opened_at),
    }));
  },
  revokeShare: (id) => call("revoke_share", { p_share: id }),
  async openShare(token) {
    const r = await call("open_share", { p_token: token });
    if (r.status !== "ok") return r;
    return { ...r, notes: r.notes.map((n) => mapNote({ ...n, status: "published" })) };
  },

  // ── Invitations à contribuer ──
  async createInvite(carnetId, { name, relation, role = "editor" } = {}) {
    const r = await call("carnet_invite_create", {
      p_carnet: carnetId,
      p_invited_name: name || "",
      p_relation: relation || "",
      p_role: role,
    });
    return { url: inviteUrl(r.token), expiresAt: ts(r.expires_at) };
  },
  previewInvite: (token) => call("carnet_invite_preview", { p_token: token }),
  acceptInvite: (token) => call("carnet_invite_accept", { p_token: token }),
  listMembers: (carnetId) => call("carnet_members_list", { p_carnet: carnetId }),

  // ── Établissement ──
  createOrg: ({ name, kind, finess, city, displayName, jobTitle, units }) =>
    call("org_create", {
      p_name: name,
      p_kind: kind,
      p_finess: finess || null,
      p_city: city || null,
      p_display_name: displayName,
      p_job_title: jobTitle,
      p_units: units,
    }),
  async orgSnapshot() {
    const s = await call("org_snapshot");
    if (!s) return null;
    return { ...s, notes: s.notes.map(mapNote) };
  },
  createResident: ({ name, age, room, unitId }) =>
    call("resident_create", {
      p_name: name,
      p_age: age === "" || age == null ? null : Number(age),
      p_room: room || null,
      p_unit: unitId,
    }),
  createStaffCode: ({ name, jobTitle, unitId, perm }) =>
    call("staff_invite_create", { p_display_name: name, p_job_title: jobTitle, p_unit: unitId || null, p_perm: perm }),
  acceptStaffCode: (code) => call("staff_invite_accept", { p_code: code }),
  updateMember: (userId, { unitId, perm }) => call("member_update", { p_user: userId, p_unit: unitId || null, p_perm: perm }),

  // ── IA ──
  ai: {
    available: enabled,
    /** Transcrit un enregistrement du micro. hints : prénoms à bien reconnaître. */
    async transcribe(blob, hints = []) {
      const form = new FormData();
      form.append("audio", blob, audioName(blob.type));
      hints.filter(Boolean).forEach((h) => form.append("hint", h));
      return ((await invokeAi(form)) || {}).text || "";
    },
    classify: (text) => invokeAi({ action: "classify", text }),
    fiche: ({ carnetId, recipientType, categories, person }) =>
      invokeAi({ action: "fiche", carnetId, recipientType, categories, person }),
    review: ({ carnetId, person }) => invokeAi({ action: "review", carnetId, person }),
  },

  // ── RGPD ──
  myConsents: () => call("my_consents"),
  async exportData() {
    const data = await call("export_my_data");
    const day = new Date().toISOString().slice(0, 10);
    download(`carnet-vivant-mes-donnees-${day}.json`, JSON.stringify(data, null, 2));
    return data;
  },
  async deleteAccount() {
    await call("delete_my_account");
    await sb.auth.signOut().catch(() => {});
  },
};

window.Backend = Backend;
export default Backend;
