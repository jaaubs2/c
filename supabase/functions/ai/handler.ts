// Fonction serveur « ai » : dictée, rangement, fiche de transmission, carnet vivant.
//
// Sécurité :
//   • la clé Mistral ne quitte jamais le serveur ;
//   • chaque appel est fait au nom de la personne connectée (son jeton), qui doit
//     passer le quota du jour ;
//   • pour résumer un carnet, les notes sont relues avec ses droits : les règles
//     d'accès de la base s'appliquent, impossible de lire le carnet d'un autre ;
//   • les réponses de l'IA sont vérifiées avant d'être renvoyées ;
//   • rien n'est conservé ici : ni l'audio, ni les textes.
import { AiError, chatJson, transcribe } from "./mistral.ts";
import { CATEGORY_IDS, classifyPrompt, fichePrompt, reviewPrompt, type NoteForAi } from "./prompts.ts";

export type Env = {
  MISTRAL_API_KEY?: string;
  MISTRAL_BASE_URL?: string;
  MISTRAL_TEXT_MODEL?: string;
  MISTRAL_AUDIO_MODEL?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  AI_DAILY_LIMIT?: string;
};

const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // environ 10 minutes de voix compressée
const MAX_NOTES = 80;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/** Appelle une fonction SQL au nom de la personne connectée. */
function database(env: Env, authorization: string, apikey: string, fetchImpl: typeof fetch) {
  return async (fn: string, args: Record<string, unknown>) => {
    const res = await fetchImpl(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey, Authorization: authorization, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) return data;
    const message = (data && data.message) || "Erreur de la base de données.";
    const status = res.status === 401 ? 401 : data?.code === "54000" ? 429 : res.status === 403 ? 403 : 400;
    throw new AiError(status === 401 ? "Connecte-toi d'abord." : message, status);
  };
}

const clip = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max) : "");
function ageOf(iso: string) {
  const days = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 86_400_000));
  return days < 1 ? "aujourd'hui" : days < 30 ? `il y a ${days} jours` : `il y a ${Math.round(days / 30)} mois`;
}
function person(body: Record<string, unknown>) {
  const p = (body.person || {}) as Record<string, unknown>;
  return { name: clip(p.name, 40).split(/\s+/)[0] || "la personne", pronoun: p.pronoun === "il" ? "il" : "elle" };
}

export async function handle(req: Request, env: Env, fetchImpl: typeof fetch = fetch): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  const authorization = req.headers.get("authorization") || "";
  if (!/^Bearer\s+\S+/.test(authorization)) return json({ error: "Connecte-toi d'abord." }, 401);
  if (!env.MISTRAL_API_KEY) return json({ error: "L'IA n'est pas encore activée.", code: "not_configured" }, 503);

  const db = database(env, authorization, env.SUPABASE_ANON_KEY || req.headers.get("apikey") || "", fetchImpl);
  const mistral = { apiKey: env.MISTRAL_API_KEY, baseUrl: env.MISTRAL_BASE_URL, fetchImpl };
  const textModel = env.MISTRAL_TEXT_MODEL || "mistral-medium-latest";

  try {
    // Authentifie la personne et décompte son quota du jour.
    await db("ai_quota_hit", { p_limit: Number(env.AI_DAILY_LIMIT) || 150 });

    // ── Dictée ──
    if ((req.headers.get("content-type") || "").startsWith("multipart/form-data")) {
      const form = await req.formData();
      const audio = form.get("audio");
      if (!(audio instanceof Blob) || audio.size === 0) return json({ error: "Aucun enregistrement reçu." }, 400);
      if (audio.size > MAX_AUDIO_BYTES) return json({ error: "L'enregistrement est trop long (10 minutes maximum)." }, 413);
      const type = audio.type || "audio/webm";
      if (!/^(audio|video)\//.test(type)) return json({ error: "Ce fichier n'est pas un enregistrement audio." }, 415);
      const ext = type.includes("mp4") || type.includes("m4a") || type.includes("aac") ? "m4a"
        : type.includes("ogg") ? "ogg" : type.includes("wav") ? "wav" : type.includes("mpeg") ? "mp3" : "webm";
      const hints = form.getAll("hint").map((h) => clip(h, 40)).filter(Boolean).slice(0, 20);
      const text = await transcribe({ ...mistral, model: env.MISTRAL_AUDIO_MODEL || "voxtral-mini-latest" },
        audio, `note.${ext}`, hints);
      return json({ text });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // ── Rangement d'une note ──
    if (body.action === "classify") {
      const text = clip(body.text, 4000);
      if (!text) return json({ error: "La note est vide." }, 400);
      const out = await chatJson({ ...mistral, model: textModel }, { ...classifyPrompt(text), maxTokens: 200 });
      if (!CATEGORY_IDS.includes(out.category as string)) throw new AiError("L'IA n'a pas su ranger cette note.", 502);
      return json({
        category: out.category,
        moment: ["matin", "midi", "aprem", "soir"].includes(out.moment as string) ? out.moment : null,
        reason: clip(out.reason, 140),
      });
    }

    // Fiche et carnet vivant : notes relues avec les droits de la personne connectée.
    const readNotes = async () => {
      if (typeof body.carnetId !== "string") throw new AiError("Carnet manquant.", 400);
      const notes = (await db("notes_list", { p_carnet: body.carnetId })) as Array<Record<string, string>>;
      return notes.filter((n) => n.status === "published" && !n.archived_at).slice(0, MAX_NOTES);
    };
    const forAi = (n: Record<string, string>): NoteForAi =>
      ({ id: n.id, category: n.category, text: n.body.slice(0, 800), age: ageOf(n.confirmed_at || n.created_at) });

    // ── Fiche de transmission ──
    if (body.action === "fiche") {
      const categories = (Array.isArray(body.categories) ? body.categories : []).filter((c) => CATEGORY_IDS.includes(c as string)) as string[];
      if (!categories.length) return json({ error: "Choisis au moins une rubrique." }, 400);
      const recipientType = ["proche", "pro", "etab"].includes(body.recipientType as string) ? body.recipientType as string : "proche";
      const notes = (await readNotes()).filter((n) => categories.includes(n.category));
      if (!notes.length) return json({ error: "Aucune note à résumer dans les rubriques choisies." }, 422);
      const out = await chatJson({ ...mistral, model: textModel },
        { ...fichePrompt({ recipientType, person: person(body), categories, notes: notes.map(forAi) }), maxTokens: 900 });
      const essentials = (Array.isArray(out.essentials) ? out.essentials : [])
        .filter((e: Record<string, unknown>) => categories.includes(e?.category as string) && clip(e?.text, 300))
        .slice(0, 3)
        .map((e: Record<string, unknown>) => ({ category: e.category, text: clip(e.text, 300) }));
      if (!essentials.length) throw new AiError("L'IA n'a pas su préparer la fiche. Réessaie.", 502);
      return json({ intro: clip(out.intro, 300), essentials });
    }

    // ── Garder le carnet vivant ──
    if (body.action === "review") {
      const notes = await readNotes();
      if (!notes.length) return json({ items: [] });
      const ids = new Set(notes.map((n) => n.id));
      const out = await chatJson({ ...mistral, model: textModel },
        { ...reviewPrompt({ person: person(body), notes: notes.map(forAi) }), maxTokens: 600 });
      const items = (Array.isArray(out.items) ? out.items : [])
        .filter((it: Record<string, unknown>) => ["stale", "contradiction", "gap"].includes(it?.kind as string)
          && CATEGORY_IDS.includes(it?.category as string) && clip(it?.question, 200))
        .slice(0, 3)
        .map((it: Record<string, unknown>) => ({
          kind: it.kind,
          noteId: ids.has(it.noteId as string) ? it.noteId : null,
          category: it.category,
          question: clip(it.question, 200),
        }));
      return json({ items });
    }

    return json({ error: "Action inconnue." }, 400);
  } catch (e) {
    if (e instanceof AiError) return json({ error: e.message }, e.status);
    console.error("[ia] erreur inattendue");
    return json({ error: "Une erreur est survenue. Réessaie dans un instant." }, 500);
  }
}
