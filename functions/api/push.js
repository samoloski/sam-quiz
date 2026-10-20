/* sam quiz : envoi des notifications push (appele toutes les 5 minutes par un declencheur) */

function b64u(bytes) {
  var s = "";
  for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64u(str) {
  var s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  var bin = atob(s);
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function strB64u(text) {
  return b64u(new TextEncoder().encode(text));
}

function same(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  var r = 0;
  for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function sbHeaders(env) {
  var key = String(env.SUPABASE_SERVICE_KEY);
  var h = { apikey: key, "Content-Type": "application/json" };
  if (key.indexOf("eyJ") === 0) h.Authorization = "Bearer " + key;
  return h;
}

async function rpc(env, name, args) {
  var base = String(env.SUPABASE_URL || "").replace(/\/+$/, "");
  var res = await fetch(base + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: sbHeaders(env),
    body: JSON.stringify(args || {})
  });
  if (!res.ok) throw new Error(name + " : erreur " + res.status);
  var txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

async function vapidAuth(endpoint, env, signKey) {
  var aud = new URL(endpoint).origin;
  var header = strB64u(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  var payload = strB64u(JSON.stringify({
    aud: aud,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: env.VAPID_SUBJECT || "https://sam-quiz.pages.dev"
  }));
  var data = new TextEncoder().encode(header + "." + payload);
  var sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, signKey, data);
  return "vapid t=" + header + "." + payload + "." + b64u(new Uint8Array(sig)) + ", k=" + env.VAPID_PUBLIC_KEY;
}

export async function onRequest(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var given = url.searchParams.get("key") || context.request.headers.get("x-cron-key") || "";

  if (!env.CRON_KEY || !same(String(given).trim(), String(env.CRON_KEY || "").trim())) {
    return new Response("forbidden" + (!env.CRON_KEY ? " : CRON_KEY absente" : String(given).length !== String(env.CRON_KEY).length ? " : longueur differente (recu " + String(given).trim().length + ", attendu " + String(env.CRON_KEY).trim().length + ")" : " : meme longueur, caracteres differents"), { status: 403 });
  }
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return json({ error: "configuration incomplete" }, 500);
  }

  try {
    var pub = fromB64u(env.VAPID_PUBLIC_KEY);
    var jwk = {
      kty: "EC",
      crv: "P-256",
      x: b64u(pub.slice(1, 33)),
      y: b64u(pub.slice(33, 65)),
      d: env.VAPID_PRIVATE_KEY,
      ext: true
    };
    var signKey = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);

    var jobs = (await rpc(env, "push_plan", { p_limit: 20 })) || [];
    var sent = 0;
    var dropped = 0;
    var failed = 0;

    await Promise.all(jobs.map(async function (job) {
      try {
        var auth = await vapidAuth(job.endpoint, env, signKey);
        var res = await fetch(job.endpoint, {
          method: "POST",
          headers: { Authorization: auth, TTL: "3600", Urgency: "normal" },
          body: ""
        });
        if (res.status === 404 || res.status === 410) {
          await rpc(env, "push_drop", { p_sub_id: job.sub_id });
          dropped++;
        } else if (res.ok) {
          sent++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
    }));

    return json({ planned: jobs.length, sent: sent, dropped: dropped, failed: failed });
  } catch (e) {
    return json({ error: String(e && e.message ? e.message : e) }, 500);
  }
}
