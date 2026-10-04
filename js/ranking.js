/* sam quiz : classement des joueurs et pseudo obligatoire */
(function () {
  var cloud = window.SamCloud;
  var topbar = document.getElementById("topbar");
  if (!cloud || !topbar) return;

  var PERIODS = [
    ["all", "Général"],
    ["week", "Semaine"],
    ["day", "Aujourd'hui"]
  ];
  var PERIOD_LABEL = { all: "", week: "cette semaine", day: "aujourd'hui" };

  var cache = {};
  var period = "all";
  var loading = false;
  var failed = false;

  var btn = document.createElement("button");
  btn.className = "rank-btn";
  btn.type = "button";
  btn.textContent = "🏆";
  btn.setAttribute("aria-label", "Classement");
  topbar.appendChild(btn);

  var screen = document.createElement("div");
  screen.className = "rank-screen";
  screen.hidden = true;
  document.body.appendChild(screen);

  var gate = document.createElement("div");
  gate.className = "gate";
  gate.hidden = true;
  document.body.appendChild(gate);

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function scoreText(v) {
    return (period === "all" ? "" : "+") + v + " SG";
  }

  /* ---------- classement ---------- */

  function shell(inner) {
    var tabs = "<div class='rk-tabs'>";
    PERIODS.forEach(function (p) {
      tabs +=
        "<button class='rk-tab" + (p[0] === period ? " on" : "") + "' type='button' data-p='" + p[0] + "'>" +
        p[1] + "</button>";
    });
    tabs += "</div>";
    return (
      "<div class='rank-top'><h2>🏆 Classement</h2><div class='rk-actions'>" +
      "<button class='rk-refresh" + (loading ? " spin" : "") + "' id='rk-refresh' type='button' aria-label='Actualiser'>🔄</button>" +
      "<button class='quiz-close' id='rk-close' type='button' aria-label='Fermer'>✕</button></div></div>" +
      "<div class='rank-body'>" + tabs + inner + "</div>"
    );
  }

  function skeleton() {
    return "<div class='rk-skel'></div><div class='rk-skel'></div><div class='rk-skel'></div><div class='rk-skel'></div>";
  }

  function meCard(data) {
    if (data.me) {
      return (
        "<div class='rk-me'><div><small>Ton rang</small><b>#" + data.me.rank + "</b></div>" +
        "<div class='rk-me-name'>" + esc(data.me.pseudo) + "</div>" +
        "<div class='rk-me-score'>" + scoreText(data.me.score) + "</div></div>"
      );
    }
    var label = PERIOD_LABEL[period];
    return (
      "<div class='rk-me rk-me-empty'>" +
      (label ? "Aucun point " + label + " : " : "") + "joue un quiz pour entrer au classement !</div>"
    );
  }

  function podium(top) {
    if (!top.length) return "";
    var slots = [top[1], top[0], top[2]];
    var cls = ["p2", "p1", "p3"];
    var medals = ["🥈", "🥇", "🥉"];
    var html = "<div class='rk-podium'>";
    slots.forEach(function (r, i) {
      if (!r) {
        html += "<div class='rk-pod empty'></div>";
        return;
      }
      html +=
        "<div class='rk-pod " + cls[i] + (r.me ? " me" : "") + "'>" +
        "<span class='rk-medal'>" + medals[i] + "</span>" +
        "<span class='rk-pname'>" + esc(r.pseudo) + "</span>" +
        "<span class='rk-pscore'>" + scoreText(r.score) + "</span>" +
        "<div class='rk-step'></div></div>";
    });
    return html + "</div>";
  }

  function list(top) {
    var rest = top.slice(3);
    if (!rest.length) return "";
    var html = "<div class='rank-list'>";
    rest.forEach(function (r) {
      html +=
        "<div class='rank-row" + (r.me ? " me" : "") + "'>" +
        "<span class='rank-pos'>" + r.rank + "</span>" +
        "<span class='rank-name'>" + esc(r.pseudo) + (r.me ? " (toi)" : "") + "</span>" +
        "<span class='rank-sg'>" + scoreText(r.score) + "</span></div>";
    });
    return html + "</div>";
  }

  function render() {
    if (screen.hidden) return;
    var scroll = screen.scrollTop;
    var data = cache[period];
    var inner = "";

    if (!data) {
      inner = failed
        ? "<p class='rank-empty'>Impossible de charger le classement.<br>Vérifie ta connexion puis touche 🔄.</p>"
        : skeleton();
    } else {
      inner = meCard(data);
      inner += "<p class='rk-total'>" + data.total + " joueur" + (data.total > 1 ? "s" : "") + " classé" + (data.total > 1 ? "s" : "") + "</p>";
      if (!data.top.length) {
        var label = PERIOD_LABEL[period];
        inner += "<p class='rank-empty'>Personne n'a encore marqué de points" + (label ? " " + label : "") + ". Sois le premier !</p>";
      } else {
        inner += podium(data.top) + list(data.top);
      }
    }

    screen.innerHTML = shell(inner);
    screen.scrollTop = scroll;
  }

  async function load(p) {
    if (!cloud.available()) {
      failed = true;
      render();
      return;
    }
    loading = true;
    failed = false;
    render();
    try {
      if (!cloud.getProfile()) await cloud.loadProfile();
      cache[p] = await cloud.getLeaderboard(p);
    } catch (e) {
      console.error("Classement indisponible :", e);
      if (!cache[p]) failed = true;
    }
    loading = false;
    render();
  }

  function openRanking() {
    if (!screen.hidden) return;
    screen.hidden = false;
    document.body.classList.add("no-scroll");
    if (!history.state || history.state.screen !== "ranking") {
      history.pushState({ screen: "ranking" }, "");
    }
    failed = false;
    render();
    load(period);
  }

  function hideRanking() {
    screen.hidden = true;
    screen.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function closeRanking() {
    if (history.state && history.state.screen === "ranking") history.back();
    else hideRanking();
  }

  btn.addEventListener("click", openRanking);

  screen.addEventListener("click", function (e) {
    if (e.target.closest("#rk-close")) {
      closeRanking();
      return;
    }
    if (e.target.closest("#rk-refresh")) {
      load(period);
      return;
    }
    var tab = e.target.closest("[data-p]");
    if (tab) {
      period = tab.getAttribute("data-p");
      failed = false;
      render();
      load(period);
    }
  });

  window.addEventListener("popstate", function () {
    if (!screen.hidden) hideRanking();
  });

  document.addEventListener("samquiz:cloud-score", function () {
    cache = {};
    if (!screen.hidden) load(period);
  });

  /* ---------- pseudo obligatoire ---------- */

  function gateLogo() {
    return "<img src='/icons/icon-192.png' alt=''>";
  }

  function showGate(mode) {
    document.body.classList.add("no-scroll");
    if (mode === "offline") {
      gate.innerHTML =
        "<div class='gate-box'>" + gateLogo() +
        "<h2>Connexion requise</h2>" +
        "<p>Pour choisir ton pseudo, l'appli a besoin d'internet la première fois. Connecte-toi puis réessaie.</p>" +
        "<button class='gate-btn' id='gt-retry' type='button'>Réessayer</button></div>";
    } else {
      gate.innerHTML =
        "<div class='gate-box'>" + gateLogo() +
        "<h2>Choisis ton pseudo</h2>" +
        "<p>C'est le nom qui apparaîtra dans le classement, visible par tous les joueurs.</p>" +
        "<input id='gt-input' type='text' maxlength='16' autocomplete='off' autocapitalize='off' spellcheck='false' placeholder='Ex : Samo_01'>" +
        "<div class='gate-meta'><span>3 à 16 caractères : lettres, chiffres ou _</span><span id='gt-count'>0/16</span></div>" +
        "<p class='gate-tip'>Évite ton vrai nom. Ton pseudo est définitif.</p>" +
        "<p class='gate-error' id='gt-error' hidden></p>" +
        "<button class='gate-btn' id='gt-save' type='button' disabled>Valider mon pseudo</button></div>";
    }
    gate.hidden = false;
    var input = document.getElementById("gt-input");
    if (input) setTimeout(function () { input.focus(); }, 150);
  }

  function hideGate() {
    gate.hidden = true;
    gate.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function gateError(text) {
    var err = document.getElementById("gt-error");
    if (!err) return;
    err.textContent = text;
    err.hidden = false;
  }

  async function savePseudo() {
    var input = document.getElementById("gt-input");
    var save = document.getElementById("gt-save");
    if (!input || !save) return;
    var value = input.value.trim();

    if (!/^[A-Za-z0-9_]{3,16}$/.test(value)) {
      gateError("Pseudo invalide : 3 à 16 caractères (lettres, chiffres, _).");
      return;
    }
    if (!confirm("Ton pseudo sera définitif : « " + value + " ». Continuer ?")) return;

    save.disabled = true;
    try {
      var p = await cloud.createProfile(value);
      hideGate();
      document.dispatchEvent(
        new CustomEvent("samquiz:cloud-score", { detail: { gained: 0, sg: p.sg } })
      );
    } catch (e) {
      gateError((e && e.message) || "Erreur, réessaie.");
      save.disabled = input.value.trim().length < 3;
    }
  }

  gate.addEventListener("input", function (e) {
    if (e.target.id !== "gt-input") return;
    var clean = e.target.value.replace(/[^A-Za-z0-9_]/g, "");
    if (clean !== e.target.value) e.target.value = clean;
    var count = document.getElementById("gt-count");
    if (count) count.textContent = clean.length + "/16";
    var save = document.getElementById("gt-save");
    if (save) save.disabled = clean.length < 3;
    var err = document.getElementById("gt-error");
    if (err) err.hidden = true;
  });

  gate.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.id === "gt-input") {
      e.preventDefault();
      var save = document.getElementById("gt-save");
      if (save && !save.disabled) savePseudo();
    }
  });

  gate.addEventListener("click", function (e) {
    if (e.target.closest("#gt-save")) savePseudo();
    else if (e.target.closest("#gt-retry")) location.reload();
  });

  (async function boot() {
    if (!cloud.available()) {
      if (!cloud.localPseudo()) showGate("offline");
      return;
    }
    try {
      var p = await cloud.loadProfile();
      if (!p) showGate("pseudo");
    } catch (e) {
      console.error(e);
      if (!cloud.localPseudo()) showGate("offline");
    }
  })();
})();
