/* sam quiz : diagnostic de configuration (aucune valeur n'est affichee) */
export async function onRequestGet(context) {
  const env = context.env;
  const key = env.SUPABASE_SERVICE_KEY || "";
  let keyKind = "absente";

  if (key) {
    if (key.startsWith("sb_secret_")) {
      keyKind = "secret (bonne cle)";
    } else if (key.startsWith("sb_publishable_")) {
      keyKind = "publishable (mauvaise cle)";
    } else if (key.startsWith("eyJ")) {
      try {
        const part = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(part));
        keyKind = (payload.role || "jwt inconnu") + (payload.role === "service_role" ? " (bonne cle)" : " (mauvaise cle)");
      } catch (e) {
        keyKind = "illisible";
      }
    } else {
      keyKind = "format inconnu";
    }
  }

  return new Response(
    JSON.stringify({
      AI: !!env.AI,
      SUPABASE_URL: !!env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!key,
      type_de_cle: keyKind
    }),
    { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }
  );
}
