// Tests de la fonction serveur « ai », avec un faux Mistral et une fausse base.
// Lancer : node supabase/tests/ai.test.mjs
import { handle } from "../functions/ai/handler.ts";

let passed = 0, failed = 0;
const ok = (c, l) => { if (c) { passed++; console.log("  ✔", l); } else { failed++; console.log("  ✘", l); } };

const ENV = { MISTRAL_API_KEY: "cle-test", SUPABASE_URL: "https://projet.supabase.co", SUPABASE_ANON_KEY: "anon" };
const NOTES = [
  { id: "n1", category: "parler", body: "L'appeler Paul, jamais Monsieur.", status: "published", archived_at: null, created_at: new Date(Date.now() - 200 * 864e5).toISOString() },
  { id: "n2", category: "habitudes", body: "Café noir le matin.", status: "published", archived_at: null, created_at: new Date().toISOString() },
  { id: "n3", category: "sante", body: "Appareil auditif gauche.", status: "published", archived_at: null, created_at: new Date().toISOString() },
  { id: "n4", category: "apaise", body: "Note en attente.", status: "pending", archived_at: null, created_at: new Date().toISOString() },
];

// Faux réseau : base de données Supabase + Mistral. Garde une trace des requêtes.
function fakeNet({ quota = "ok", mistral = {}, notes = NOTES } = {}) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.includes("/rest/v1/rpc/ai_quota_hit")) {
      if (quota === "anon") return Response.json({ message: "JWT expired" }, { status: 401 });
      if (quota === "full") return Response.json({ code: "54000", message: "Limite d'utilisation de l'IA atteinte pour aujourd'hui. Réessaie demain." }, { status: 400 });
      return Response.json({ calls: 1 });
    }
    if (url.includes("/rest/v1/rpc/notes_list")) return Response.json(notes);
    if (url.endsWith("/v1/audio/transcriptions")) {
      if (mistral.status) return new Response("{}", { status: mistral.status });
      return Response.json({ model: "voxtral-mini-latest", text: "  Le soir il écoute Brassens.  ", language: "fr", usage: {} });
    }
    if (url.endsWith("/v1/chat/completions")) {
      if (mistral.status) return new Response("{}", { status: mistral.status });
      const body = JSON.parse(init.body);
      const content = mistral.content?.[body.response_format.json_schema.name];
      return Response.json({ choices: [{ message: { content: typeof content === "string" ? content : JSON.stringify(content) } }] });
    }
    return new Response("inconnu", { status: 404 });
  };
  return { fetchImpl, calls };
}
const post = (body, headers = { authorization: "Bearer jeton-anne" }) =>
  new Request("https://fn/ai", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
const call = async (req, net, env = ENV) => { const res = await handle(req, env, net.fetchImpl); return { status: res.status, body: await res.json().catch(() => null) }; };

console.log("\n■ Accès");
let net = fakeNet();
ok((await call(post({ action: "classify", text: "x" }, {}), net)).status === 401, "sans être connecté : refusé");
ok((await call(post({ action: "classify", text: "x" }), net, { ...ENV, MISTRAL_API_KEY: "" })).body.code === "not_configured", "sans clé Mistral : « IA pas encore activée »");
let r = await call(post({ action: "classify", text: "x" }), fakeNet({ quota: "anon" }));
ok(r.status === 401, "jeton expiré : refusé");
r = await call(post({ action: "classify", text: "x" }), fakeNet({ quota: "full" }));
ok(r.status === 429 && r.body.error.includes("Limite"), "quota du jour dépassé : message clair");

console.log("\n■ Rangement d'une note");
net = fakeNet({ mistral: { content: { classement: { category: "habitudes", moment: "matin", reason: "Rituel du matin." } } } });
r = await call(post({ action: "classify", text: "Café noir le matin." }), net);
ok(r.status === 200 && r.body.category === "habitudes" && r.body.moment === "matin", "l'IA propose « Habitudes », le matin");
const chat = net.calls.find((c) => c.url.includes("chat/completions"));
const sent = JSON.parse(chat.init.body);
ok(chat.url === "https://api.eu.mistral.ai/v1/chat/completions", "appel au serveur européen de Mistral");
ok(chat.init.headers.Authorization === "Bearer cle-test", "la clé reste côté serveur (en-tête de la requête serveur)");
ok(sent.response_format.type === "json_schema" && sent.response_format.json_schema.strict === true && sent.response_format.json_schema.schema.properties.category.enum.length === 7, "réponse contrainte par un schéma JSON (7 rubriques)");
ok(sent.model === "mistral-medium-latest" && sent.messages[0].role === "system" && sent.messages[0].content.includes("aucun diagnostic"), "consigne « aucun diagnostic » envoyée");
ok(JSON.parse(sent.messages[1].content).note === "Café noir le matin.", "la note est transmise comme une donnée");
const quota = net.calls.find((c) => c.url.includes("ai_quota_hit"));
ok(quota.init.headers.Authorization === "Bearer jeton-anne", "le quota est décompté au nom de la personne connectée");
r = await call(post({ action: "classify", text: "x" }), fakeNet({ mistral: { content: { classement: { category: "diagnostic", moment: "matin", reason: "" } } } }));
ok(r.status === 502, "une rubrique inventée par l'IA est rejetée");
r = await call(post({ action: "classify", text: "x" }), fakeNet({ mistral: { content: { classement: "pas du json" } } }));
ok(r.status === 502, "une réponse illisible de l'IA est rejetée");
r = await call(post({ action: "classify", text: "x" }), fakeNet({ mistral: { status: 401 } }));
ok(r.status === 503 && r.body.error.includes("clé Mistral"), "clé Mistral refusée : message clair");
r = await call(post({ action: "classify", text: "x" }), fakeNet({ mistral: { status: 429 } }));
ok(r.status === 429, "Mistral surchargé : « réessaie dans un instant »");

console.log("\n■ Fiche de transmission");
net = fakeNet({ mistral: { content: { fiche: { intro: "Voici l'essentiel pour passer un bon moment avec Paul.", essentials: [
  { category: "parler", text: "L'appeler Paul." }, { category: "sante", text: "Ne doit pas passer." }, { category: "habitudes", text: "Café noir le matin." }, { category: "parler", text: "x".repeat(500) } ] } } } });
r = await call(post({ action: "fiche", carnetId: "c1", recipientType: "proche", categories: ["parler", "habitudes"], person: { name: "Paul Martin", pronoun: "il" } }), net);
ok(r.status === 200 && r.body.essentials.length === 3, "la fiche contient au plus 3 choses à savoir");
ok(r.body.essentials.every((e) => ["parler", "habitudes"].includes(e.category)), "uniquement dans les rubriques choisies (la santé est écartée)");
ok(r.body.essentials.every((e) => e.text.length <= 300), "chaque point est limité en longueur");
const ficheReq = JSON.parse(net.calls.find((c) => c.url.includes("chat/completions")).init.body);
const sentNotes = JSON.parse(ficheReq.messages[1].content).notes;
ok(sentNotes.length === 2 && !sentNotes.some((n) => n.category === "sante"), "seules les notes des rubriques choisies sont envoyées à l'IA");
ok(!JSON.stringify(ficheReq).includes("Martin"), "le nom de famille n'est pas envoyé à l'IA (prénom seulement)");
ok(!JSON.stringify(ficheReq).includes("Note en attente"), "les notes en attente de visa ne sont pas envoyées");
ok(ficheReq.messages[0].content.includes("tutoiement"), "ton adapté à un proche (tutoiement)");
ok(net.calls.find((c) => c.url.includes("notes_list")).init.headers.Authorization === "Bearer jeton-anne", "les notes sont lues avec les droits de la personne connectée");
r = await call(post({ action: "fiche", carnetId: "c1", categories: ["gouts"] }), fakeNet());
ok(r.status === 422, "aucune note dans les rubriques : message clair");

console.log("\n■ Garder le carnet vivant");
net = fakeNet({ mistral: { content: { revue: { items: [
  { kind: "stale", noteId: "n1", category: "parler", question: "Toujours d'actualité ?" },
  { kind: "gap", noteId: "inventé", category: "histoire", question: "Un souvenir d'enfance qu'il raconte volontiers ?" },
  { kind: "bizarre", noteId: "n2", category: "habitudes", question: "?" } ] } } } });
r = await call(post({ action: "review", carnetId: "c1", person: { name: "Paul", pronoun: "il" } }), net);
ok(r.body.items.length === 2 && r.body.items[0].noteId === "n1" && r.body.items[1].noteId === null, "questions vérifiées (identifiant inventé retiré, type inconnu écarté)");
ok(JSON.parse(JSON.parse(net.calls.find((c) => c.url.includes("chat/completions")).init.body).messages[1].content).notes[0].age === "il y a 7 mois", "l'IA sait depuis quand date chaque note");

console.log("\n■ Dictée");
const audioReq = (blob, hints = []) => {
  const fd = new FormData(); fd.append("audio", blob, "note.webm"); hints.forEach((h) => fd.append("hint", h));
  return new Request("https://fn/ai", { method: "POST", headers: { authorization: "Bearer jeton-anne" }, body: fd });
};
net = fakeNet();
r = await call(audioReq(new Blob([new Uint8Array(2000)], { type: "audio/webm;codecs=opus" }), ["Paul", "Brassens"]), net);
ok(r.status === 200 && r.body.text === "Le soir il écoute Brassens.", "l'enregistrement est transcrit en texte");
const tr = net.calls.find((c) => c.url.includes("transcriptions"));
const form = tr.init.body;
ok(tr.url === "https://api.eu.mistral.ai/v1/audio/transcriptions", "transcription sur le serveur européen");
ok(form.get("model") === "voxtral-mini-latest" && form.get("language") === "fr" && form.get("file") instanceof Blob, "modèle Voxtral, en français");
ok(form.getAll("context_bias").join() === "Paul,Brassens", "les prénoms aident la reconnaissance");
r = await call(audioReq(new Blob([new Uint8Array(11 * 1024 * 1024)], { type: "audio/webm" })), fakeNet());
ok(r.status === 413, "un enregistrement trop long est refusé");
r = await call(audioReq(new Blob(["<html>"], { type: "text/html" })), fakeNet());
ok(r.status === 415, "un fichier qui n'est pas du son est refusé");

console.log(`\n${passed} vérifications réussies, ${failed} en échec.`);
process.exit(failed ? 1 : 0);
