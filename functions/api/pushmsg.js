/* sam quiz : donne au telephone le texte de sa notification en attente */

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

export async function onRequestPost(context) {
  var env = context.env;
  var body = null;
  try {
    body = await context.request.json();
  } catch (e) {
    return json(null);
  }
  var endpoint = body && body.endpoint;
  if (typeof endpoint !== "string" || endpoint.indexOf("https://") !== 0 || endpoint.length > 1000) {
    return json(null);
  }
  try {
    var key = String(env.SUPABASE_SERVICE_KEY);
    var headers = { apikey: key, "Content-Type": "application/json" };
    if (key.indexOf("eyJ") === 0) headers.Authorization = "Bearer " + key;
    var base = String(env.SUPABASE_URL || "").replace(/\/+$/, "");
    var res = await fetch(base + "/rest/v1/rpc/take_push_message", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ p_endpoint: endpoint })
    });
    if (!res.ok) return json(null);
    var txt = await res.text();
    return json(txt ? JSON.parse(txt) : null);
  } catch (e) {
    return json(null);
  }
}
