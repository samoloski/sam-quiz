/* sam quiz : samoloski ai - generation des questions du jour (avec verification) */
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const LOCK_MAX_AGE_MS = 180000;
const MIN_KEPT = 6;

const SUBJECTS = {
  maths: {
    name: "Mathématiques",
    lang: "français",
    topics: [
      "équations et inéquations du second degré",
      "dérivation et étude de fonctions",
      "suites arithmétiques et géométriques",
      "trigonométrie",
      "dénombrement",
      "probabilités",
      "statistiques"
    ]
  },
  physique: {
    name: "Physique-Chimie",
    lang: "français",
    topics: [
      "mécanique : forces, travail et énergie",
      "électricité : loi d'Ohm, associations de résistors, énergie électrique",
      "chimie des solutions : concentration, quantité de matière, pH",
      "gravitation et poids",
      "mouvements"
    ]
  },
  svt: {
    name: "SVT",
    lang: "français",
    topics: [
      "génétique : mitose, méiose, hérédité",
      "immunologie : défenses de l'organisme, vaccin",
      "nutrition : digestion, respiration cellulaire",
      "reproduction humaine",
      "écologie et environnement"
    ]
  },
  francais: {
    name: "Français",
    lang: "français",
    topics: [
      "figures de style",
      "genres et registres littéraires",
      "grammaire : analyse de la phrase et accords",
      "conjugaison : temps et modes",
      "vocabulaire : synonymes, antonymes, champs lexicaux",
      "mouvements littéraires"
    ]
  },
  anglais: {
    name: "Anglais",
    lang: "anglais",
    topics: [
      "verb tenses",
      "modal verbs",
      "conditionals",
      "vocabulary",
      "reported speech",
      "passive voice",
      "prepositions"
    ]
  },
  histgeo: {
    name: "Histoire-Géographie",
    lang: "français",
    topics: [
      "histoire du monde contemporain",
      "colonisation et décolonisation en Afrique",
      "histoire du Togo",
      "géographie : population et développement",
      "organisations internationales"
    ]
  }
};

const LEVELS = {
  1: "FACILE : question directe sur le cours, une seule notion",
  2: "MOYEN : application du cours avec un petit calcul ou un raisonnement en une ou deux étapes",
  3: "DIFFICILE : problème en plusieurs étapes ou piège classique, pour un bon élève"
};

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function sbFetch(env, path, init) {
  const key = env.SUPABASE_SERVICE_KEY;
  const headers = Object.assign(
    { apikey: key, "Content-Type": "application/json" },
    (init && init.headers) || {}
  );
  if (key.startsWith("eyJ")) headers.Authorization = "Bearer " + key;
  return fetch(env.SUPABASE_URL + "/rest/v1/" + path, Object.assign({}, init, { headers: headers }));
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function buildMessages(subject, level) {
  const topics = shuffle(subject.topics).slice(0, 4).join(" ; ");
  return [
    {
      role: "system",
      content:
        "Tu es Samoloski AI, un professeur rigoureux qui crée des QCM pour des élèves de première série D au Togo. " +
        "Tu réponds uniquement avec un tableau JSON valide, sans texte autour et sans balises markdown."
    },
    {
      role: "user",
      content:
        "Crée 10 questions à choix multiples sur la matière : " + subject.name + ".\n" +
        "Thèmes à privilégier aujourd'hui : " + topics + ".\n" +
        "Difficulté : " + LEVELS[level] + ".\n" +
        "Règles :\n" +
        "- Langue des questions : " + subject.lang + ".\n" +
        "- Chaque question a exactement 4 choix, dont UN SEUL correct, indiscutable et conforme au programme officiel. Les trois autres sont plausibles mais clairement faux. La bonne réponse doit réellement figurer parmi les 4 choix et répondre exactement à la question posée.\n" +
        "- INTERDIT : les questions qui demandent seulement de réciter, du type « Quelle est la formule de... ». Préfère les applications avec des valeurs précises (calcul court) ou les questions de compréhension.\n" +
        "- Chaque question doit être complète et compréhensible seule : définis toute lettre ou variable utilisée (par exemple n, r, u₀) et énonce les conditions de validité d'une propriété (par exemple |r| < 1).\n" +
        "- AU PLUS UNE question par notion du cours.\n" +
        "- Vérifie chaque calcul avant d'écrire la réponse. Si tu n'es pas sûr d'une question, remplace-la.\n" +
        "- Pas de LaTeX, pas de tableau : écris les formules en texte simple (x², √3, 1/2).\n" +
        "- Explication : une ou deux phrases exactes qui refont le calcul ou le raisonnement.\n" +
        "Format exact : [{\"q\":\"...\",\"c\":[\"...\",\"...\",\"...\",\"...\"],\"a\":0,\"e\":\"...\"}]\n" +
        "où \"a\" est l'index (0 à 3) du bon choix."
    }
  ];
}

function extractArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

function cleanQuestions(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const item of list) {
    if (!item || typeof item.q !== "string" || !Array.isArray(item.c) || item.c.length !== 4) continue;
    const choices = item.c.map(function (x) { return String(x).trim(); });
    if (choices.some(function (x) { return !x || x.length > 140; })) continue;
    const distinct = new Set(choices.map(function (x) { return x.toLowerCase(); }));
    if (distinct.size !== 4) continue;
    const a = Number(item.a);
    if (!Number.isInteger(a) || a < 0 || a > 3) continue;
    const q = item.q.trim();
    if (q.length < 8 || q.length > 400 || seen.has(q.toLowerCase())) continue;
    seen.add(q.toLowerCase());
    const order = shuffle([0, 1, 2, 3]);
    out.push({
      q: q,
      c: order.map(function (i) { return choices[i]; }),
      a: order.indexOf(a),
      e: String(item.e || "").trim().slice(0, 400)
    });
  }
  return out.slice(0, 10);
}

function readText(out) {
  if (typeof out === "string") return out;
  if (!out) return "";
  const candidate =
    out.response ||
    (out.result && out.result.response) ||
    (out.choices && out.choices[0] && out.choices[0].message && out.choices[0].message.content) ||
    "";
  return typeof candidate === "string" ? candidate : JSON.stringify(candidate);
}

async function verifySolve(env, list) {
  const text = list
    .map(function (it, i) {
      return (
        i + 1 + ". " + it.q + "\n" +
        it.c.map(function (c, j) { return "ABCD".charAt(j) + ") " + c; }).join("\n") + "\n" +
        "E) Aucune de ces réponses n'est correcte"
      );
    })
    .join("\n\n");

  const out = await env.AI.run(MODEL, {
    messages: [
      {
        role: "system",
        content:
          "Tu es un correcteur expert et prudent. Tu résous chaque QCM toi-même, sans a priori. " +
          "Si aucune réponse de A à D n'est exacte, ou si la question est incomplète ou ambiguë, réponds E. " +
          "Tu réponds uniquement avec un tableau JSON de lettres, une par question, par exemple [\"A\",\"C\",\"E\"]."
      },
      { role: "user", content: text }
    ],
    max_tokens: 200,
    temperature: 0
  });

  const arr = extractArray(readText(out));
  if (!Array.isArray(arr) || arr.length !== list.length) return null;
  return list.filter(function (it, i) {
    return String(arr[i]).trim().toUpperCase().charAt(0) === "ABCD".charAt(it.a);
  });
}

async function verifyExplanations(env, list) {
  const text = list
    .map(function (it, i) {
      return (
        i + 1 + ". " + it.q + "\n" +
        "Réponse proposée : " + "ABCD".charAt(it.a) + ") " + it.c[it.a] + "\n" +
        "Explication : " + it.e
      );
    })
    .join("\n\n");

  const out = await env.AI.run(MODEL, {
    messages: [
      {
        role: "system",
        content:
          "Tu es un correcteur expert et exigeant. Pour chaque question, on te donne la réponse proposée et son explication. " +
          "Réponds OK si l'explication est exacte, cohérente avec la question et avec la réponse, et ne contient aucune erreur. " +
          "Réponds KO si elle contient une erreur, un raisonnement faux ou une contradiction. " +
          "Tu réponds uniquement avec un tableau JSON, par exemple [\"OK\",\"KO\",\"OK\"]."
      },
      { role: "user", content: text }
    ],
    max_tokens: 200,
    temperature: 0
  });

  const arr = extractArray(readText(out));
  if (!Array.isArray(arr) || arr.length !== list.length) return null;
  return list.filter(function (it, i) {
    return String(arr[i]).trim().toUpperCase().indexOf("OK") === 0;
  });
}

async function generate(env, subject, level) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await env.AI.run(MODEL, {
      messages: buildMessages(subject, level),
      max_tokens: 3000,
      temperature: 0.4
    });
    const list = cleanQuestions(extractArray(readText(out)));
    if (list.length < 8) continue;

    const solved = await verifySolve(env, list);
    if (!solved || solved.length < MIN_KEPT) continue;

    const explained = await verifyExplanations(env, solved);
    const finalList = explained || solved;
    if (finalList.length >= MIN_KEPT) return finalList;
  }
  return null;
}

export async function onRequestGet(context) {
  const env = context.env;

  if (!env.AI || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return json({ ok: false, error: "configuration manquante" }, 500);
  }

  const url = new URL(context.request.url);
  const subjectId = url.searchParams.get("subject");
  const level = parseInt(url.searchParams.get("level"), 10);

  if (!SUBJECTS[subjectId] || [1, 2, 3].indexOf(level) === -1) {
    return json({ ok: false, error: "parametres invalides" }, 400);
  }

  const day = new Date().toISOString().slice(0, 10);
  const filter = "day=eq." + day + "&subject=eq." + subjectId + "&level=eq." + level;

  const existing = await sbFetch(env, "daily_sets?" + filter + "&select=id");
  if (!existing.ok) return json({ ok: false, error: "base indisponible" }, 502);
  const found = await existing.json();
  if (found.length) return json({ ok: true, ready: true });

  const lock = await sbFetch(env, "daily_locks", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ day: day, subject: subjectId, level: level })
  });

  if (lock.status === 409) {
    const cur = await sbFetch(env, "daily_locks?" + filter + "&select=created_at");
    if (cur.ok) {
      const rows = await cur.json();
      if (rows.length && Date.now() - new Date(rows[0].created_at).getTime() > LOCK_MAX_AGE_MS) {
        await sbFetch(env, "daily_locks?" + filter, { method: "DELETE" });
      }
    }
    return json({ ok: true, ready: false, pending: true });
  }
  if (!lock.ok) return json({ ok: false, error: "verrou impossible" }, 502);

  let list = null;
  let err = "";
  try {
    list = await generate(env, SUBJECTS[subjectId], level);
  } catch (e) {
    err = String((e && e.message) || e);
  }

  if (!list) {
    return json({ ok: false, error: err || "generation non validee, nouvel essai dans quelques minutes" }, 502);
  }

  const ins = await sbFetch(env, "daily_sets?on_conflict=day,subject,level", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ day: day, subject: subjectId, level: level, questions: list })
  });
  await sbFetch(env, "daily_locks?" + filter, { method: "DELETE" });

  if (!ins.ok) return json({ ok: false, error: "enregistrement impossible" }, 502);
  return json({ ok: true, ready: true, generated: true, kept: list.length });
}
