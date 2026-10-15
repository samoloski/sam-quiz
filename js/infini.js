/* sam quiz : quiz illimite (questions generees a la demande) */
(function () {
  var SUBJECTS = [
    { id: "maths", name: "Maths", icon: "📐", topics: ["Second degré", "Dérivation", "Suites", "Trigonométrie", "Dénombrement", "Probabilités", "Statistiques"] },
    { id: "physique", name: "Physique-Chimie", icon: "⚗️", topics: ["Mécanique", "Électricité", "Chimie des solutions", "Gravitation et poids", "Mouvements"] },
    { id: "svt", name: "SVT", icon: "🧬", topics: ["Génétique", "Immunologie", "Nutrition", "Reproduction", "Écologie"] },
    { id: "francais", name: "Français", icon: "📖", topics: ["Figures de style", "Genres et registres", "Grammaire", "Conjugaison", "Vocabulaire", "Mouvements littéraires"] },
    { id: "anglais", name: "Anglais", icon: "🗣️", topics: ["Verb tenses", "Modal verbs", "Conditionals", "Vocabulary", "Reported speech", "Passive voice", "Prepositions"] },
    { id: "histgeo", name: "Hist-Géo", icon: "🌍", topics: ["Monde contemporain", "Colonisation et décolonisation", "Histoire du Togo", "Population et développement", "Organisations internationales"] }
  ];
  var LEVELS = [
    { id: 1, icon: "🌱", name: "Facile" },
    { id: 2, icon: "🔥", name: "Moyen" },
    { id: 3, icon: "🚀", name: "Difficile" }
  ];

  var st = { sub: null, topic: null, level: 2, queue: [], seen: {}, fetching: false, error: "", cur: null, score: 0, answered: 0, view: "setup" };

  function esc(t) {
    var d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }

  var screen = document.createElement("div");
  screen.className = "inf-screen";
  screen.hidden = true;
  document.body.appendChild(screen);

  var home = document.getElementById("screen-home");
  var list = document.getElementById("home-list");
  if (home && list) {
    var entry = document.createElement("button");
    entry.type = "button";
    entry.className = "inf-entry";
    entry.innerHTML = "<span class='inf-entry-ico'>♾️</span><span><strong>Quiz illimité</strong><small>Des questions générées sans fin, par chapitre</small></span><span class='inf-entry-go'>›</span>";
    entry.addEventListener("click", openSetup);
    home.insertBefore(entry, list);
  }

  function topBar(title, showClose) {
    return "<div class='inf-top'><button class='inf-close' type='button' data-act='close' aria-label='Fermer'>✕</button><h2>" + esc(title) + "</h2>" +
      (showClose ? "<span class='inf-score'>" + st.score + "/" + st.answered + "</span>" : "<span></span>") + "</div>";
  }

  function openSetup() {
    st.view = "setup";
    if (!st.sub) st.sub = SUBJECTS[0];
    screen.hidden = false;
    renderSetup();
  }

  function renderSetup() {
    var h = topBar("Quiz illimité", false) + "<div class='inf-body'>";
    h += "<p class='inf-label'>1. Matière</p><div class='inf-grid'>";
    SUBJECTS.forEach(function (s) {
      h += "<button type='button' class='inf-chip" + (st.sub.id === s.id ? " on" : "") + "' data-sub='" + s.id + "'><span>" + s.icon + "</span>" + esc(s.name) + "</button>";
    });
    h += "</div><p class='inf-label'>2. Chapitre</p><div class='inf-pills'>";
    h += "<button type='button' class='inf-pill" + (st.topic === null ? " on" : "") + "' data-topic='all'>Mélange</button>";
    st.sub.topics.forEach(function (t, i) {
      h += "<button type='button' class='inf-pill" + (st.topic === i ? " on" : "") + "' data-topic='" + i + "'>" + esc(t) + "</button>";
    });
    h += "</div><p class='inf-label'>3. Niveau</p><div class='inf-levels'>";
    LEVELS.forEach(function (l) {
      h += "<button type='button' class='inf-level" + (st.level === l.id ? " on" : "") + "' data-level='" + l.id + "'><span>" + l.icon + "</span>" + l.name + "</button>";
    });
    h += "</div><button type='button' class='inf-start' data-act='start'>Commencer</button>";
    h += "<p class='inf-note'>Questions créées par l'IA et vérifiées deux fois, mais une erreur reste possible : en cas de doute, vérifie dans ton cours.</p></div>";
    screen.innerHTML = h;
  }

  function loadBatch() {
    if (st.fetching) return;
    st.fetching = true;
    st.error = "";
    var url = "/api/quiz?subject=" + st.sub.id + "&level=" + st.level + (st.topic !== null ? "&topic=" + st.topic : "");
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 70000);
    var mySub = st.sub.id, myTopic = st.topic, myLevel = st.level;
    fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (mySub !== st.sub.id || myTopic !== st.topic || myLevel !== st.level) return;
        if (!d.ok) throw new Error(d.error || "erreur");
        d.questions.forEach(function (q) {
          var key = q.q.toLowerCase();
          if (!st.seen[key]) { st.seen[key] = 1; st.queue.push(q); }
        });
      })
      .catch(function (e) { st.error = String((e && e.message) || e); })
      .then(function () {
        clearTimeout(timer);
        st.fetching = false;
        if (st.view === "loading") next();
      });
  }

  function start() {
    st.queue = [];
    st.seen = {};
    st.score = 0;
    st.answered = 0;
    st.error = "";
    next();
  }

  function next() {
    if (st.queue.length === 0) {
      st.view = "loading";
      if (st.error && !st.fetching) { renderError(); return; }
      renderLoading();
      loadBatch();
      return;
    }
    st.cur = st.queue.shift();
    st.view = "question";
    renderQuestion(-1);
    if (st.queue.length <= 3) loadBatch();
  }

  function renderLoading() {
    screen.innerHTML = topBar(st.sub.name, true) +
      "<div class='inf-body inf-center'><div class='inf-spin'></div><p>Samoloski AI prépare tes questions…</p><small>Cela peut prendre jusqu'à 30 secondes.</small></div>";
  }

  function renderError() {
    screen.innerHTML = topBar(st.sub.name, true) +
      "<div class='inf-body inf-center'><p>😕 Impossible de générer les questions pour le moment.</p><small>" + esc(st.error) + "</small>" +
      "<button type='button' class='inf-start' data-act='retry'>Réessayer</button>" +
      "<button type='button' class='inf-ghost' data-act='setup'>Changer de réglages</button></div>";
  }

  function renderQuestion(picked) {
    var q = st.cur;
    var done = picked >= 0;
    var h = topBar(st.sub.name, true) + "<div class='inf-body'>";
    h += "<p class='inf-count'>Question " + (st.answered + (done ? 0 : 1)) + "</p>";
    h += "<h3 class='inf-q'>" + esc(q.q) + "</h3><div class='inf-choices'>";
    q.c.forEach(function (c, i) {
      var cls = "inf-choice";
      if (done && i === q.a) cls += " good";
      else if (done && i === picked) cls += " bad";
      h += "<button type='button' class='" + cls + "' data-pick='" + i + "'" + (done ? " disabled" : "") + "><b>" + "ABCD".charAt(i) + "</b><span>" + esc(c) + "</span></button>";
    });
    h += "</div>";
    if (done) {
      h += "<div class='inf-expl " + (picked === q.a ? "ok" : "ko") + "'><strong>" + (picked === q.a ? "✅ Bonne réponse" : "❌ Mauvaise réponse") + "</strong><p>" + esc(q.e || "") + "</p></div>";
      h += "<button type='button' class='inf-start' data-act='next'>Question suivante</button>";
      h += "<button type='button' class='inf-ghost' data-act='finish'>Terminer</button>";
    }
    h += "</div>";
    screen.innerHTML = h;
    screen.scrollTop = 0;
  }

  function renderSummary() {
    var pct = st.answered ? Math.round((st.score / st.answered) * 100) : 0;
    screen.innerHTML = topBar("Résultat", false) +
      "<div class='inf-body inf-center'><div class='inf-big'>" + pct + " %</div>" +
      "<p>" + st.score + " bonne" + (st.score > 1 ? "s" : "") + " réponse" + (st.score > 1 ? "s" : "") + " sur " + st.answered + "</p>" +
      "<button type='button' class='inf-start' data-act='start'>Rejouer</button>" +
      "<button type='button' class='inf-ghost' data-act='setup'>Changer de réglages</button></div>";
    st.view = "summary";
  }

  function pick(i) {
    if (st.view !== "question") return;
    st.view = "answered";
    st.answered += 1;
    if (i === st.cur.a) st.score += 1;
    renderQuestion(i);
  }

  screen.addEventListener("click", function (e) {
    var b;
    if ((b = e.target.closest("[data-sub]"))) {
      for (var i = 0; i < SUBJECTS.length; i++) if (SUBJECTS[i].id === b.getAttribute("data-sub")) st.sub = SUBJECTS[i];
      st.topic = null;
      renderSetup();
    } else if ((b = e.target.closest("[data-topic]"))) {
      var v = b.getAttribute("data-topic");
      st.topic = v === "all" ? null : parseInt(v, 10);
      renderSetup();
    } else if ((b = e.target.closest("[data-level]"))) {
      st.level = parseInt(b.getAttribute("data-level"), 10);
      renderSetup();
    } else if ((b = e.target.closest("[data-pick]"))) {
      pick(parseInt(b.getAttribute("data-pick"), 10));
    } else if ((b = e.target.closest("[data-act]"))) {
      var a = b.getAttribute("data-act");
      if (a === "start") start();
      else if (a === "next") next();
      else if (a === "retry") { st.error = ""; st.view = "loading"; renderLoading(); loadBatch(); }
      else if (a === "setup") { st.view = "setup"; renderSetup(); }
      else if (a === "finish") renderSummary();
      else if (a === "close") {
        if (st.view === "setup" || st.view === "summary" || st.answered === 0) { screen.hidden = true; st.view = "setup"; }
        else renderSummary();
      }
    }
  });
})();
