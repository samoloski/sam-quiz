/* sam quiz : connexion Supabase (compte anonyme, pseudo, classement) */
(function () {
  var cfg = window.SAMQUIZ_CONFIG || {};
  var client = null;
  var profile = null;

  if (window.supabase && cfg.url && cfg.key) {
    try {
      client = window.supabase.createClient(cfg.url, cfg.key, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
    } catch (e) {
      client = null;
    }
  }

  async function ensureUser() {
    var res = await client.auth.getSession();
    if (res.data && res.data.session) return res.data.session.user;
    var anon = await client.auth.signInAnonymously();
    if (anon.error) throw anon.error;
    return anon.data.user;
  }

  async function loadProfile() {
    if (!client) return null;
    var user = await ensureUser();
    var res = await client
      .from("profiles")
      .select("pseudo,sg")
      .eq("id", user.id)
      .maybeSingle();
    if (res.error) throw res.error;
    profile = res.data;
    return profile;
  }

  async function createProfile(pseudo) {
    var user = await ensureUser();
    var res = await client
      .from("profiles")
      .insert({ id: user.id, pseudo: pseudo })
      .select("pseudo,sg")
      .single();
    if (res.error) {
      if (res.error.code === "23505") throw new Error("Ce pseudo est déjà pris.");
      if (res.error.code === "23514") {
        throw new Error("Pseudo invalide : 3 à 16 caractères (lettres, chiffres, _).");
      }
      throw res.error;
    }
    profile = res.data;
    return profile;
  }

  async function submitScore(subject, level, correct, total) {
    if (!client || !profile) return null;
    var res = await client.rpc("submit_score", {
      p_subject: subject,
      p_level: level,
      p_correct: correct,
      p_total: total
    });
    if (res.error) throw res.error;
    profile.sg += res.data;
    return res.data;
  }

  async function leaderboard() {
    if (!client) return [];
    var res = await client
      .from("profiles")
      .select("pseudo,sg")
      .order("sg", { ascending: false })
      .limit(50);
    if (res.error) throw res.error;
    return res.data || [];
  }

  document.addEventListener("samquiz:quiz-finished", function (e) {
    var r = e.detail;
    if (!r.rewarded || !profile) return;
    submitScore(r.subjectId, r.level, r.correct, r.total)
      .then(function (gained) {
        if (gained === null) return;
        document.dispatchEvent(
          new CustomEvent("samquiz:cloud-score", { detail: { gained: gained, sg: profile.sg } })
        );
      })
      .catch(function (err) {
        console.error("Envoi du score impossible :", err);
      });
  });

  window.SamCloud = {
    available: function () { return !!client; },
    getProfile: function () { return profile; },
    loadProfile: loadProfile,
    createProfile: createProfile,
    submitScore: submitScore,
    leaderboard: leaderboard
  };
})();
