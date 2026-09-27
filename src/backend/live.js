// Qui est qui, et ce qu'on déduit des vraies notes.
//
// window.Who : les prénoms affichés par les écrans. En démo : Anne et Jeanne.
// Avec un vrai compte, app.jsx le remplit avec le profil et le carnet.
//
// window.Live : remplace les contenus d'exemple (« 3 choses à savoir »,
// conseils par moment de la journée…) par ce que disent les vraies notes.

const DEMO = {
  demo: true,
  aidant: "Anne",
  aidantFull: "Anne C",
  person: "Jeanne",
  personFull: "Jeanne Martin",
  pronoun: "elle",
};

const Who = {
  ...DEMO,
  /** Accorde un mot selon la personne accompagnée : Who.g("fatiguée", "fatigué"). */
  g(feminine, masculine) {
    return this.pronoun === "il" ? masculine : feminine;
  },
  set(patch) {
    Object.assign(this, patch);
  },
  reset() {
    Object.assign(this, DEMO);
  },
};

const first = (name) => (name || "").trim().split(/\s+/)[0] || "";

const MOMENTS = [
  { id: "matin", title: "Ce matin", hint: "7h–11h", label: "ce matin",
    re: /(\bmatin|réveil|reveil|\blever\b|se lève|petit[- ]d[ée]j|toilette|douche)/i },
  { id: "midi", title: "Ce midi", hint: "11h–14h", label: "ce midi",
    re: /(\bmidi\b|d[ée]jeuner|\brepas\b)/i },
  { id: "aprem", title: "Cet après-midi", hint: "14h–18h", label: "cet après-midi",
    re: /(apr[èe]s[- ]midi|sieste|go[ûu]ter|\b1[4-7] ?h|\bvisite)/i },
  { id: "soir", title: "Ce soir", hint: "18h–22h", label: "ce soir",
    re: /(\bsoir|\bnuit\b|coucher|d[îi]ner|veilleuse|dormir|endormir)/i },
];

function momentOf(text) {
  const t = text || "";
  return MOMENTS.filter((m) =>
    m.id === "midi" ? m.re.test(t.replace(/petit[- ]d[ée]jeuner/gi, "")) : m.re.test(t)
  ).map((m) => m.id);
}

const active = (notes) => (notes || []).filter((n) => !n.archived && (n.status || "published") === "published");

const Live = {
  first,
  MOMENTS,

  /** Les repères de la journée, construits à partir des notes (même forme que TIPS_BY_MOMENT). */
  tipsByMoment(notes) {
    const list = active(notes);
    return MOMENTS.map((m) => ({
      id: m.id,
      title: m.title,
      hint: m.hint,
      items: list
        .filter((n) => momentOf(n.text).includes(m.id))
        .slice(0, 4)
        .map((n) => ({ catId: n.catId, text: n.text })),
    }));
  },

  /** « 3 choses à savoir tout de suite » : comment lui parler, ce qui l'apaise, ses habitudes d'abord. */
  topThree(notes) {
    const order = ["parler", "apaise", "habitudes", "sante", "gouts", "histoire", "proches"];
    const list = active(notes).sort((a, b) => b.ts - a.ts);
    const out = [];
    for (const catId of order) {
      const n = list.find((x) => x.catId === catId);
      if (n) out.push({ catId, title: n.text, body: "" });
      if (out.length === 3) break;
    }
    return out;
  },

  /** Un repère pour le moment présent, ou null s'il n'y en a pas encore. */
  ritual(notes, momentId) {
    const m = MOMENTS.find((x) => x.id === momentId);
    const block = Live.tipsByMoment(notes).find((b) => b.id === momentId);
    const item = block && block.items[0];
    if (!m || !item) return null;
    return { id: "live-" + momentId, moment: momentId, title: `Un repère pour ${m.label}`, body: item.text, catId: item.catId };
  },
};

window.Who = Who;
window.Live = Live;
export { Who, Live };
