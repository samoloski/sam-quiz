/* sam quiz : duel en direct (code a 5 lettres, temps reel Supabase, chat) */
(function () {
  var Q = window.SamQuiz;
  var cfg = window.SAMQUIZ_CONFIG || {};
  if (!Q || !Q.start) return;

  var LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var EMOJIS = ["👏", "🔥", "😱", "😂"];
  var S = null;
  var overlay = null;
  var pill = null;
  var obs = null;

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function myName() {
    try {
      var p = JSON.parse(localStorage.getItem("samquiz:profil"));
      if (p && p.name) return String(p.name).slice(0, 20);
    } catch (e) {}
    return "Un ami";
  }

  function bank() {
    return window.SamBank || [];
  }

  function bankById(id) {
    var list = bank();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function newCode() {
    var c = "";
    for (var i = 0; i < 5; i++) c += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
    return c;
  }

  /* ---------- fenetre ---------- */

  function openOverlay(html) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "modal";
      overlay.style.zIndex = "2147483600";
      overlay.addEventListener("click", onClick);
      overlay.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        if (e.target.id === "dl-msg") {
          e.preventDefault();
          sendChat();
        } else if (e.target.id === "dl-code") {
          e.preventDefault();
          joinRoom();
        }
      });
      document.body.appendChild(overlay);
    }
    overlay.hidden = false;
    overlay.innerHTML = "<div class='modal-box'>" + html + "</div>";
  }

  function closeOverlay() {
    if (overlay) {
      overlay.hidden = true;
      overlay.innerHTML = "";
    }
  }

  function stopAll() {
    if (obs) { obs.disconnect(); obs = null; }
    if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
    pill = null;
    if (S) {
      if (S.joinTimer) clearTimeout(S.joinTimer);
      if (S.resend) clearInterval(S.resend);
      if (S.reactTimer) clearTimeout(S.reactTimer);
      if (S.client && S.ch) {
        try { S.client.removeChannel(S.ch); } catch (e) {}
      }
    }
    S = null;
  }

  var BTN_COL = "style='display:flex;flex-direction:column;gap:10px;margin-top:14px'";

  function showMenu() {
    openOverlay(
      "<h2>⚔️ Duel en direct</h2>" +
      "<p>Affronte un ami sur les mêmes questions, en même temps. Pas de SG dans un duel.</p>" +
      "<div " + BTN_COL + ">" +
      "<button class='btn btn-primary btn-block' id='dl-create' type='button'>Créer un duel</button>" +
      "<button class='btn btn-secondary btn-block' id='dl-join' type='button'>Rejoindre avec un code</button>" +
      "<button class='btn btn-secondary btn-block' id='dl-close' type='button'>Fermer</button>" +
      "</div>"
    );
  }

  function showCreate() {
    var opts = "";
    bank().forEach(function (b) {
      opts += "<option value='" + esc(b.id) + "'>" + esc(b.name) + "</option>";
    });
    openOverlay(
      "<h2>Créer un duel</h2>" +
      "<p>Choisis la matière, puis le niveau.</p>" +
      "<select id='dl-subject' style='width:100%;padding:12px;font-size:16px;border-radius:10px'>" + opts + "</select>" +
      "<div " + BTN_COL + ">" +
      "<button class='btn btn-primary btn-block' data-lv='1' type='button'>🌱 Niveau 1 · Facile</button>" +
      "<button class='btn btn-primary btn-block' data-lv='2' type='button'>🔥 Niveau 2 · Moyen</button>" +
      "<button class='btn btn-primary btn-block' data-lv='3' type='button'>🚀 Niveau 3 · Difficile</button>" +
      "<button class='btn btn-secondary btn-block' id='dl-menu' type='button'>Retour</button>" +
      "</div>"
    );
  }

  function showJoin() {
    openOverlay(
      "<h2>Rejoindre un duel</h2>" +
      "<p>Entre le code de 5 caractères donné par ton ami.</p>" +
      "<input id='dl-code' maxlength='5' autocomplete='off' autocapitalize='characters' " +
      "style='width:100%;box-sizing:border-box;padding:14px;font-size:28px;text-align:center;" +
      "letter-spacing:0.3em;text-transform:uppercase;border-radius:10px' />" +
      "<div " + BTN_COL + ">" +
      "<button class='btn btn-primary btn-block' id='dl-go' type='button'>Rejoindre</button>" +
      "<button class='btn btn-secondary btn-block' id='dl-menu' type='button'>Retour</button>" +
      "</div>"
    );
  }

  function showMessage(title, text) {
    openOverlay(
      "<h2>" + title + "</h2><p>" + text + "</p>" +
      "<div " + BTN_COL + ">" +
      "<button class='btn btn-secondary btn-block' id='dl-close' type='button'>Fermer</button></div>"
    );
  }

  /* ---------- chat ---------- */

  function chatBlock() {
    return (
      "<div id='dl-log' style='height:150px;overflow-y:auto;margin:10px 0;padding:8px;border-radius:10px;" +
      "border:1px solid rgba(128,128,128,.3);font-size:14px;text-align:left'></div>" +
      "<div style='display:flex;gap:8px'>" +
      "<input id='dl-msg' maxlength='120' placeholder='Écris un message…' autocomplete='off' " +
      "style='flex:1;min-width:0;box-sizing:border-box;padding:10px;font-size:16px;border-radius:10px' />" +
      "<button class='btn btn-primary' id='dl-sendmsg' type='button'>➤</button></div>"
    );
  }

  function renderLog() {
    var box = document.getElementById("dl-log");
    if (!box || !S) return;
    var html = "";
    if (!S.log.length) {
      html = "<div style='opacity:.6'>Dis bonjour à " + esc(S.opp) + " 👋</div>";
    }
    S.log.forEach(function (x) {
      html += "<div style='margin:3px 0'><strong>" + (x.me ? "Toi" : esc(x.n)) + " :</strong> " + esc(x.m) + "</div>";
    });
    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;
  }

  function sendChat() {
    var input = document.getElementById("dl-msg");
    if (!input || !S) return;
    var text = input.value.trim().slice(0, 120);
    if (!text) return;
    var now = Date.now();
    if (now - S.lastSend < 800) return;
    S.lastSend = now;
    S.log.push({ me: true, n: "Toi", m: text });
    if (S.log.length > 200) S.log.shift();
    send({ k: "chat", n: myName(), m: text });
    input.value = "";
    renderLog();
    input.focus();
  }

  /* ---------- connexion temps reel ---------- */

  function connect(code, fields, onOpen) {
    var client = null;
    try {
      if (window.supabase && cfg.url && cfg.key) {
        client = window.supabase.createClient(cfg.url, cfg.key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storageKey: "samquiz-duel"
          }
        });
      }
    } catch (e) {
      client = null;
    }
    if (!client) {
      showMessage("Hors ligne", "Le duel en direct demande une connexion internet.");
      return;
    }
    stopAll();
    var me = {
      client: client,
      code: code,
      ch: null,
      state: fields.state,
      role: fields.role,
      b: fields.b || null,
      l: fields.l || 0,
      seed: fields.seed || 0,
      opp: "Ton ami",
      oppKnown: false,
      oppProg: 0,
      oppDone: null,
      mine: null,
      t0: 0,
      log: [],
      lastSend: 0,
      lastReact: 0,
      reactTxt: ""
    };
    S = me;
    var ch = client.channel("duel-" + code, { config: { broadcast: { self: false } } });
    me.ch = ch;
    ch.on("broadcast", { event: "msg" }, function (p) {
      if (S !== me) return;
      onMessage(p && p.payload ? p.payload : {});
    });
    ch.subscribe(function (status) {
      if (S !== me) return;
      if (status === "SUBSCRIBED") {
        onOpen();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        stopAll();
        showMessage("Connexion impossible", "Vérifie ta connexion internet, puis réessaie.");
      }
    });
  }

  function send(payload) {
    if (S && S.ch) {
      try {
        S.ch.send({ type: "broadcast", event: "msg", payload: payload });
      } catch (e) {}
    }
  }

  /* ---------- creer / rejoindre ---------- */

  function createRoom(bid, lv) {
    var b = bankById(bid);
    if (!b || !b.levels || !b.levels[lv] || !b.levels[lv].length) return;
    var code = newCode();
    var seed = Math.floor(Math.random() * 4294967294) + 1;
    openOverlay("<h2>Création du duel…</h2>");
    connect(code, { role: "host", state: "waiting", b: b, l: lv, seed: seed }, showWaiting);
  }

  function showWaiting() {
    if (!S) return;
    openOverlay(
      "<h2>⚔️ Duel prêt</h2>" +
      "<p>" + esc(S.b.name) + " · Niveau " + S.l + "</p>" +
      "<p>Donne ce code à ton ami :</p>" +
      "<div style='font-size:44px;font-weight:800;text-align:center;letter-spacing:0.25em;margin:10px 0'>" + S.code + "</div>" +
      "<p style='text-align:center'>En attente de ton ami…</p>" +
      "<div " + BTN_COL + ">" +
      "<button class='btn btn-primary btn-block' id='dl-share' type='button'>Envoyer le code</button>" +
      "<button class='btn btn-secondary btn-block' id='dl-copy' type='button'>Copier le code</button>" +
      "<button class='btn btn-secondary btn-block' id='dl-close' type='button'>Annuler</button>" +
      "</div>"
    );
  }

  function shareCode() {
    if (!S) return;
    var text = "⚔️ " + myName() + " te défie en direct sur sam quiz ! Ouvre " + location.origin +
      " , touche ⚔️ Duel, puis « Rejoindre » et entre le code : " + S.code;
    if (navigator.share) {
      navigator.share({ text: text }).catch(function () {});
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
    }
  }

  function copyCode(btn) {
    if (!S) return;
    var code = S.code;
    function done() {
      btn.textContent = "✅ Code copié";
      setTimeout(function () { btn.textContent = "Copier le code"; }, 2000);
    }
    function fallback() {
      var t = document.createElement("textarea");
      t.value = code;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(t);
      done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, fallback);
    } else {
      fallback();
    }
  }

  function joinRoom() {
    var input = document.getElementById("dl-code");
    var code = input ? input.value.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
    if (code.length !== 5) {
      if (input) input.focus();
      return;
    }
    openOverlay("<h2>Connexion au duel…</h2>");
    connect(code, { role: "guest", state: "joining" }, function () {
      if (!S) return;
      send({ k: "join", n: myName() });
      showLobby();
      var me = S;
      me.joinTimer = setTimeout(function () {
        if (S === me && me.state === "joining" && !me.oppKnown) {
          stopAll();
          showMessage("Duel introuvable", "Vérifie le code, ou demande à ton ami d'en créer un nouveau.");
        }
      }, 12000);
    });
  }

  /* salon d'attente avec chat */
  function showLobby() {
    if (!S) return;
    if (S.role === "host") {
      openOverlay(
        "<h2>⚔️ " + esc(S.opp) + " a rejoint !</h2>" +
        "<p>" + esc(S.b.name) + " · Niveau " + S.l + "</p>" +
        chatBlock() +
        "<div " + BTN_COL + ">" +
        "<button class='btn btn-primary btn-block' id='dl-start' type='button'>🚀 Lancer la partie</button>" +
        "<button class='btn btn-secondary btn-block' id='dl-close' type='button'>Annuler</button>" +
        "</div>"
      );
      renderLog();
    } else if (!S.oppKnown) {
      openOverlay(
        "<h2>Connecté</h2><p>Recherche du duel…</p>" +
        "<div " + BTN_COL + "><button class='btn btn-secondary btn-block' id='dl-close' type='button'>Annuler</button></div>"
      );
    } else {
      openOverlay(
        "<h2>⚔️ Duel avec " + esc(S.opp) + "</h2>" +
        "<p>En attente du départ…</p>" +
        chatBlock() +
        "<div " + BTN_COL + "><button class='btn btn-secondary btn-block' id='dl-close' type='button'>Annuler</button></div>"
      );
      renderLog();
    }
  }

  function startGame() {
    if (!S || S.role !== "host" || S.state !== "ready") return;
    S.state = "starting";
    send({ k: "start", b: S.b.id, l: S.l, s: S.seed, n: myName() });
    countdown();
  }

  /* ---------- messages ---------- */

  function onMessage(m) {
    if (!S) return;
    if (m.k === "join" && S.role === "host" && S.state === "waiting") {
      S.opp = String(m.n || "Ton ami").slice(0, 20);
      S.oppKnown = true;
      S.state = "ready";
      send({ k: "hello", n: myName() });
      showLobby();
    } else if (m.k === "hello" && S.role === "guest" && S.state === "joining") {
      if (S.joinTimer) clearTimeout(S.joinTimer);
      S.opp = String(m.n || "Ton ami").slice(0, 20);
      S.oppKnown = true;
      showLobby();
    } else if (m.k === "start" && S.role === "guest" && S.state === "joining") {
      var b = bankById(m.b);
      var l = parseInt(m.l, 10);
      var s = parseInt(m.s, 10);
      if (!b || !b.levels || !b.levels[l] || !b.levels[l].length || !(s > 0)) {
        stopAll();
        showMessage("Duel impossible", "Les questions ne sont pas à jour. Rouvre l'appli et réessaie.");
        return;
      }
      if (S.joinTimer) clearTimeout(S.joinTimer);
      S.b = b;
      S.l = l;
      S.seed = s;
      S.opp = String(m.n || S.opp).slice(0, 20);
      S.oppKnown = true;
      S.state = "starting";
      countdown();
    } else if (m.k === "chat") {
      var txt = String(m.m || "").trim().slice(0, 120);
      if (!txt) return;
      S.log.push({ me: false, n: String(m.n || S.opp).slice(0, 20), m: txt });
      if (S.log.length > 200) S.log.shift();
      renderLog();
    } else if (m.k === "react") {
      if (EMOJIS.indexOf(m.e) !== -1) flashReact(S.opp + " : " + m.e);
    } else if (m.k === "prog") {
      S.oppProg = parseInt(m.n, 10) || 0;
      updatePill();
    } else if (m.k === "done") {
      var wasNew = !S.oppDone;
      S.oppDone = { c: parseInt(m.c, 10) || 0, t: parseInt(m.t, 10) || 10, ms: parseInt(m.ms, 10) || 0 };
      if (wasNew && S.mine) send({ k: "done", c: S.mine.c, t: S.mine.t, ms: S.mine.ms });
      maybeResult();
    }
  }

  /* ---------- depart et partie ---------- */

  function countdown() {
    var n = 3;
    function tick() {
      if (!S) return;
      openOverlay(
        "<h2>⚔️ " + esc(S.b.name) + " · Niveau " + S.l + "</h2>" +
        "<p style='text-align:center'>Contre <strong>" + esc(S.opp) + "</strong></p>" +
        "<div style='font-size:64px;font-weight:800;text-align:center;margin:10px 0'>" + (n > 0 ? n : "GO") + "</div>"
      );
      if (n <= 0) {
        setTimeout(function () {
          if (S) {
            closeOverlay();
            begin();
          }
        }, 400);
        return;
      }
      n--;
      setTimeout(tick, 1000);
    }
    tick();
  }

  function begin() {
    S.state = "playing";
    S.t0 = Date.now();
    Q.start({
      title: S.b.name,
      subjectId: S.b.id,
      level: S.l,
      rewarded: false,
      questions: S.b.levels[S.l],
      limit: 10,
      seed: S.seed,
      duel: { live: true }
    });
    makePill();
    watchProgress();
  }

  /* bulle du haut : progression de l'adversaire + reactions rapides */
  function makePill() {
    pill = document.createElement("div");
    pill.style.cssText =
      "position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:2147483000;" +
      "background:#4f46e5;color:#fff;padding:5px 14px;border-radius:999px;" +
      "display:flex;align-items:center;gap:10px;white-space:nowrap;" +
      "font:600 13px system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.3)";
    pill.innerHTML =
      "<span id='dl-pilltxt'></span>" +
      EMOJIS.map(function (e) {
        return "<button type='button' data-em='" + e + "' style='background:none;border:0;padding:0;" +
          "font-size:17px;line-height:1;cursor:pointer'>" + e + "</button>";
      }).join("");
    pill.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-em]");
      if (b) sendReact(b.getAttribute("data-em"));
    });
    document.body.appendChild(pill);
    updatePill();
  }

  function updatePill() {
    var t = document.getElementById("dl-pilltxt");
    if (!t || !S) return;
    t.textContent = S.reactTxt ? "⚔️ " + S.reactTxt : "⚔️ " + S.opp + " : " + S.oppProg + "/10";
  }

  function flashReact(text) {
    if (!S) return;
    S.reactTxt = text;
    updatePill();
    if (S.reactTimer) clearTimeout(S.reactTimer);
    var me = S;
    me.reactTimer = setTimeout(function () {
      if (S === me) {
        me.reactTxt = "";
        updatePill();
      }
    }, 2500);
  }

  function sendReact(em) {
    if (!S || EMOJIS.indexOf(em) === -1) return;
    var now = Date.now();
    if (now - S.lastReact < 1500) return;
    S.lastReact = now;
    send({ k: "react", e: em });
    flashReact("Toi : " + em);
  }

  function watchProgress() {
    var lastN = -1;
    obs = new MutationObserver(function () {
      if (!S) return;
      var bar = document.querySelector(".quiz-progress-bar");
      if (!bar) return;
      var w = parseFloat(bar.style.width);
      if (isNaN(w)) return;
      var n = Math.round((w / 100) * 10);
      if (n !== lastN) {
        lastN = n;
        send({ k: "prog", n: n });
      }
    });
    obs.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style"]
    });
  }

  document.addEventListener("samquiz:quiz-finished", function (e) {
    if (!S || S.state !== "playing") return;
    var d = e.detail || {};
    if (d.subjectId !== S.b.id) return;
    S.state = "finished";
    S.mine = { c: d.correct, t: d.total, ms: Date.now() - S.t0 };
    if (obs) { obs.disconnect(); obs = null; }
    if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
    pill = null;
    send({ k: "done", c: S.mine.c, t: S.mine.t, ms: S.mine.ms });
    var me = S;
    me.resend = setInterval(function () {
      if (S !== me || me.oppDone) { clearInterval(me.resend); return; }
      send({ k: "done", c: me.mine.c, t: me.mine.t, ms: me.mine.ms });
    }, 2000);
    maybeResult();
  });

  /* ---------- resultat ---------- */

  function secs(ms) {
    return (ms / 1000).toFixed(1) + " s";
  }

  function maybeResult() {
    if (!S || !S.mine) return;
    var me = S.mine;
    if (!S.oppDone) {
      openOverlay(
        "<h2>Terminé !</h2><p>Ton score : <strong>" + me.c + " / " + me.t + "</strong> en " + secs(me.ms) + ".</p>" +
        "<p>En attente de <strong>" + esc(S.opp) + "</strong>…</p>" +
        "<div " + BTN_COL + "><button class='btn btn-secondary btn-block' id='dl-close' type='button'>Fermer</button></div>"
      );
      return;
    }
    var o = S.oppDone;
    var verdict;
    if (me.c !== o.c) {
      verdict = me.c > o.c ? "🏆 Tu as gagné !" : "💪 " + esc(S.opp) + " gagne cette fois";
    } else if (Math.abs(me.ms - o.ms) < 1000) {
      verdict = "🤝 Égalité parfaite";
    } else {
      verdict = me.ms < o.ms ? "🏆 Tu gagnes : même score, mais plus rapide !" :
        "💪 " + esc(S.opp) + " gagne : même score, mais plus rapide";
    }
    openOverlay(
      "<h2>" + verdict + "</h2>" +
      "<p>Toi : <strong>" + me.c + " / " + me.t + "</strong> en " + secs(me.ms) + "<br>" +
      esc(S.opp) + " : <strong>" + o.c + " / " + o.t + "</strong> en " + secs(o.ms) + "</p>" +
      chatBlock() +
      "<div " + BTN_COL + "><button class='btn btn-primary btn-block' id='dl-close' type='button'>Fermer</button></div>"
    );
    renderLog();
  }

  /* ---------- clics ---------- */

  function onClick(e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var id = btn.id;
    if (id === "dl-close") {
      stopAll();
      closeOverlay();
    } else if (id === "dl-create") {
      showCreate();
    } else if (id === "dl-join") {
      showJoin();
    } else if (id === "dl-menu") {
      stopAll();
      showMenu();
    } else if (id === "dl-go") {
      joinRoom();
    } else if (id === "dl-start") {
      startGame();
    } else if (id === "dl-sendmsg") {
      sendChat();
    } else if (id === "dl-copy") {
      copyCode(btn);
    } else if (id === "dl-share") {
      shareCode();
    } else if (btn.hasAttribute("data-lv")) {
      var sel = document.getElementById("dl-subject");
      if (sel) createRoom(sel.value, parseInt(btn.getAttribute("data-lv"), 10));
    }
  }

  /* ---------- carte sur l'accueil ---------- */

  function ensureCard() {
    var home = document.getElementById("screen-home");
    if (!home || home.querySelector("#duel-card")) return;
    var card = document.createElement("div");
    card.id = "duel-card";
    card.style.cssText =
      "display:flex;align-items:center;gap:14px;margin:14px 16px;padding:16px;border-radius:16px;" +
      "background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;cursor:pointer;" +
      "box-shadow:0 4px 14px rgba(79,70,229,.35)";
    card.innerHTML =
      "<div style='font-size:32px'>⚔️</div>" +
      "<div style='flex:1'><div style='font-weight:800;font-size:17px'>Duel en direct</div>" +
      "<div style='opacity:.9;font-size:13px'>Défie un ami avec un code</div></div>" +
      "<div style='font-size:22px'>›</div>";
    card.addEventListener("click", showMenu);
    home.insertBefore(card, home.children[2] || null);
  }

  function watchHome() {
    var home = document.getElementById("screen-home");
    if (home) new MutationObserver(ensureCard).observe(home, { childList: true });
    ensureCard();
  }

  watchHome();
  setTimeout(ensureCard, 600);
  setTimeout(ensureCard, 1800);
})();
