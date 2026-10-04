/* sam quiz : connexion Supabase (compte anonyme, pseudo, classement, defi du jour, statistiques, chat) */
(function () {
  var cfg = window.SAMQUIZ_CONFIG || {};
  var client = null;
  var profile = null;
  var userPromise = null;
  var LOCAL_KEY = "samquiz:pseudo";

  if (window.supabase && cfg.url && cfg.key) {
    try {
      client = window.supabase.createClient(cfg.url, cfg.key, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
    } catch (e) {
      client = null;
    }
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function rememberPseudo(p) {
    try {
      if (p && p.pseudo) localStorage.setItem(LOCAL_KEY, p.pseudo);
      else localStorage.removeItem(LOCAL_KEY);
    } catch (e) {}
  }

  function localPseudo() {
    try {
      return localStorage.getItem(LOCAL_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function ensureUser() {
    if (!userPromise) {
      userPromise = (async function () {
        var res = await client.auth.getSession();
        if (res.data && res.data.session) return res.data.session.user;
        var anon = await client.auth.signInAnonymously();
        if (anon.error) throw anon.error;
        return anon.data.user;
      })().catch(function (err) {
        userPromise = null;
        throw err;
      });
    }
    return userPromise;
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
    rememberPseudo(profile);
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
      var m = String(res.error.message || "");
      if (res.error.code === "23505") throw new Error("Ce pseudo est déjà pris.");
      if (m.indexOf("interdit") !== -1) {
        throw new Error("Ce pseudo n'est pas autorisé. Choisis-en un autre.");
      }
      if (res.error.code === "23514") {
        throw new Error("Pseudo invalide : 3 à 16 caractères (lettres, chiffres, _).");
      }
      throw res.error;
    }
    profile = res.data;
    rememberPseudo(profile);
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

  async function getLeaderboard(period) {
    if (!client) throw new Error("Hors ligne");
    await ensureUser();
    var res = await client.rpc("get_leaderboard", { p_period: period || "all" });
    if (res.error) throw res.error;
    return res.data;
  }

  async function getStats() {
    if (!client) return null;
    await ensureUser();
    var res = await client.rpc("get_my_stats");
    if (res.error) throw res.error;
    return res.data;
  }

  /* ---- defi du jour (Samoloski AI) ---- */

  async function prepareDaily(subjectId, level) {
    for (var i = 0; i < 14; i++) {
      var info = null;
      try {
        var r = await fetch(
          "/api/daily?subject=" + encodeURIComponent(subjectId) + "&level=" + level,
          { cache: "no-store" }
        );
        info = await r.json();
      } catch (e) {
        info = null;
      }
      if (info && info.ok && info.ready) return true;
      if (info && info.ok === false) {
        throw new Error(info.error || "Génération impossible pour le moment.");
      }
      await sleep(5000);
    }
    return false;
  }

  async function getDailySet(subjectId, level) {
    if (!client) throw new Error("Hors ligne");
    await ensureUser();
    var res = await client.rpc("get_daily_set", { p_subject: subjectId, p_level: level });
    if (res.error) throw res.error;
    return res.data;
  }

  async function dailyAttempt(setId) {
    if (!client) return null;
    await ensureUser();
    var res = await client
      .from("daily_attempts")
      .select("correct,total,sg")
      .eq("set_id", setId)
      .maybeSingle();
    if (res.error) throw res.error;
    return res.data;
  }

  async function submitDaily(setId, answers) {
    if (!client || !profile) throw new Error("Choisis d'abord un pseudo.");
    var res = await client.rpc("submit_daily", { p_set_id: setId, p_answers: answers });
    if (res.error) {
      var msg = String(res.error.message || "");
      if (msg.indexOf("deja joue") !== -1) throw new Error("Tu as déjà joué ce lot aujourd'hui.");
      if (msg.indexOf("expire") !== -1) throw new Error("Ce lot a expiré : un nouveau lot est disponible.");
      throw res.error;
    }
    var data = res.data;
    profile.sg += data.sg;
    document.dispatchEvent(
      new CustomEvent("samquiz:cloud-score", { detail: { gained: data.sg, sg: profile.sg } })
    );
    return data;
  }

  /* ---- chat avec Samoloski AI ---- */

  async function chatAsk(message, turns) {
    if (!client) throw new Error("Le chat demande une connexion internet.");
    await ensureUser();
    var s = await client.auth.getSession();
    var token = s.data && s.data.session ? s.data.session.access_token : "";
    var r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ message: message, history: turns || [] })
    });
    var data = null;
    try {
      data = await r.json();
    } catch (e) {
      data = null;
    }
    if (!data) throw new Error("Réponse illisible, réessaie.");
    return data;
  }

  async function chatUsed() {
    if (!client) return null;
    var user = await ensureUser();
    var day = new Date().toISOString().slice(0, 10);
    var res = await client
      .from("chat_usage")
      .select("used")
      .eq("user_id", user.id)
      .eq("day", day)
      .maybeSingle();
    if (res.error) throw res.error;
    return res.data ? res.data.used : 0;
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
    localPseudo: localPseudo,
    loadProfile: loadProfile,
    createProfile: createProfile,
    submitScore: submitScore,
    getLeaderboard: getLeaderboard,
    getStats: getStats,
    prepareDaily: prepareDaily,
    getDailySet: getDailySet,
    dailyAttempt: dailyAttempt,
    submitDaily: submitDaily,
    chatAsk: chatAsk,
    chatUsed: chatUsed
  };
})();
