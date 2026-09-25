// Appels à Mistral, sur son serveur européen (api.eu.mistral.ai).
// Formats repris du kit officiel @mistralai/mistralai :
//   POST /v1/chat/completions      (réponse JSON conforme à un schéma : response_format.json_schema)
//   POST /v1/audio/transcriptions  (formulaire multipart : model, file, language, context_bias)

export const EU_BASE_URL = "https://api.eu.mistral.ai";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Config = { apiKey: string; baseUrl?: string; fetchImpl?: typeof fetch };

async function send(cfg: Config, path: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await (cfg.fetchImpl || fetch)(`${cfg.baseUrl || EU_BASE_URL}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${cfg.apiKey}`, Accept: "application/json", ...(init.headers || {}) },
      signal: controller.signal,
    });
  } catch (_e) {
    throw new AiError("L'IA ne répond pas pour le moment. Réessaie dans un instant.", 503);
  } finally {
    clearTimeout(timer);
  }
  if (res.ok) return res.json();
  // On ne journalise jamais le contenu des notes : seulement le code d'erreur.
  console.error(`[ia] Mistral ${path} → ${res.status}`);
  if (res.status === 401 || res.status === 403) throw new AiError("L'IA n'est pas correctement configurée (clé Mistral refusée).", 503);
  if (res.status === 429) throw new AiError("L'IA est très sollicitée. Réessaie dans un instant.", 429);
  if (res.status === 413) throw new AiError("L'enregistrement est trop long.", 413);
  throw new AiError("L'IA n'a pas pu répondre. Réessaie dans un instant.", 502);
}

/** Demande une réponse JSON conforme au schéma, et la renvoie déjà décodée. */
export async function chatJson(cfg: Config & { model: string }, p: {
  system: string; user: string; schemaName: string; schema: Record<string, unknown>; maxTokens: number;
}): Promise<Record<string, unknown>> {
  const data = await send(cfg, "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.2,
      max_tokens: p.maxTokens,
      messages: [
        { role: "system", content: p.system },
        { role: "user", content: p.user },
      ],
      response_format: { type: "json_schema", json_schema: { name: p.schemaName, schema: p.schema, strict: true } },
    }),
  }, 30_000);
  const content = data?.choices?.[0]?.message?.content;
  try {
    const parsed = JSON.parse(typeof content === "string" ? content : "");
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_e) { /* traité ci-dessous */ }
  throw new AiError("L'IA a répondu dans un format inattendu. Réessaie.", 502);
}

/** Transcrit un enregistrement en français. */
export async function transcribe(cfg: Config & { model: string }, audio: Blob, fileName: string, hints: string[]) {
  const form = new FormData();
  form.append("model", cfg.model);
  form.append("file", audio, fileName);
  form.append("language", "fr");
  for (const h of hints) form.append("context_bias", h);
  const data = await send(cfg, "/v1/audio/transcriptions", { method: "POST", body: form }, 60_000);
  return typeof data?.text === "string" ? data.text.trim() : "";
}
