/* sam quiz : Samoloski AI - defi du jour (questions generees chaque jour, correction par le serveur) */
(function () {
  var cloud = window.SamCloud;
  var LEVELS = {
    1: { icon: "🌱", name: "Facile" },
    2: { icon: "🔥", name: "Moyen" },
    3: { icon: "🚀", name: "Difficile" }
  };

  var root = document.createElement("div");
  root.className = "quiz-screen";
  root.hidden = true;
  document.body.appendChild(root);

  var state = null;
  var runId = 0;

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function show(html) {
    root.innerHTML = html;
    root.scrollTop = 0;
  }

  function topBar(pct, count) {
    return (
      "<div class='quiz-top'>" +
      "<button class='quiz-close' id='dl-close' type='button' aria-label='Quitter'>✕</button>" +
      "<div class='quiz-progress'><div class='quiz-progress-bar' style='width:" + pct + "%'></div></div>" +
      (count ? "<span class='quiz-count'>" + count + "</span>" : "") +
      "</div>"
    );
  }

  function message(emoji, title, text, withLevels) {
    show(
      topBar(0, "") +
      "<div class='quiz-body quiz-result'>" +
      "<div class='quiz-result-emoji'>" + emoji + "</div>" +
      "<h2 class='dl-title'>" + esc(title) + "</h2>" +
      "<p class='quiz-result-msg'>" + esc(text) + "</p>" +
      "<div class='quiz-result-actions'>" +
      (withLevels ? "<button class='btn btn-secondary' id='dl-levels' type='button'>Choisir un niveau</button>" : "") +
      "<button class='btn btn-primary' id='dl-quit' type='button'>Retour</button>" +
      "</div></div>"
    );
  }

  function loading(title, text) {
    show(
      topBar(0, "") +
      "<div class='quiz-body quiz-result'>" +
      "<div class='dl-spinner'></div>" +
      "<h2 class='dl-title'>" + esc(title) + "</h2>" +
      "<p class='quiz-result-msg'>" + esc(text || "") + "</p></div>"
    );
  }

  function renderLevels() {
    var html = topBar(0, "") + "<div class='quiz-body'>";
    html += "<span class='chip'>🤖 Samoloski AI</span>";
    html += "<h2 class='quiz-question'>" + esc(state.name) + " : défi du jour</h2>";
    html +=
      "<p class='hint'>Les mêmes questions pour tous les joueurs, renouvelées chaque jour. " +
      "Un seul essai par niveau et par jour. Les bonnes réponses s'affichent à la fin.</p>";
    [1, 2, 3].forEach(function (l) {
      html +=
        "<button class='level-card' type='button' data-dl-level='" + l + "'>" +
        "<span class='level-icon'>" + LEVELS[l].icon + "</span>" +
        "<span><span class='level-title'>Niveau " + l + " · " + LEVELS[l].name + "</span><br>" +
        "<span class='level-sub'>Jusqu'à " + 120 * l + " SG</span></span></button>";
    });
    html += "</div>";
    show(html);
  }

  function renderQuestion() {
    var total = state.questions.length;
    var item = state.questions[state.index];
    var last = state.index === total - 1;
    var html = topBar(Math.round((state.index / total) * 100), state.index + 1 + "/" + total);

    html += "<div class='quiz-body'>";
    html += "<span class='chip'>🤖 " + esc(state.name) + " · Niveau " + state.level + "</span>";
    html += "<h2 class='quiz-question'>" + esc(item.q) + "</h2>";
    html += "<div class='quiz-choices'>";
    item.c.forEach(function (c, j) {
      html +=
        "<button class='quiz-choice' type='button' data-j='" + j + "'>" +
        "<span class='quiz-letter'>" + "ABCD".charAt(j) + "</span>" +
        "<span>" + esc(c) + "</span></button>";
    });
    html += "</div>";
    html +=
      "<button class='btn btn-primary btn-block dl-next' id='dl-next' type='button' disabled>" +
      (last ? "Terminer" : "Suivant") + "</button></div>";
    show(html);
  }

  function pick(button) {
    state.picked = parseInt(button.getAttribute("data-j"), 10);
    root.querySelectorAll(".quiz-choice").forEach(function (b) {
      b.classList.remove("picked");
    });
    button.classList.add("picked");
    var next = document.getElementById("dl-next");
    if (next) next.disabled = false;
  }

  function confetti() {
    var colors = ["#4f46e5", "#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];
    var html = "";
    for (var i = 0; i < 28; i++) {
      html +=
        "<i class='confetti' style='left:" + Math.round(Math.random() * 100) +
        "%;background:" + colors[i % colors.length] +
        ";animation-delay:" + (Math.random() * 0.8).toFixed(2) + "s'></i>";
    }
    var box = document.createElement("div");
    box.className = "confetti-box";
    box.innerHTML = html;
    root.appendChild(box);
    setTimeout(function () {
      if (box.parentNode) box.parentNode.removeChild(box);
    }, 3500);
  }

  function renderResult(res) {
    var ratio = res.total ? res.correct / res.total : 0;
    var emoji = ratio === 1 ? "🏆" : ratio >= 0.6 ? "🎉" : "💪";
    var msg =
      ratio === 1 ? "Sans faute !" :
      ratio >= 0.6 ? "Bien joué !" :
      "Continue, tu vas y arriver !";

    var html = topBar(100, "");
    html += "<div class='quiz-body quiz-result'>";
    html += "<div class='quiz-result-emoji'>" + emoji + "</div>";
    html += "<h2 class='quiz-result-score'>" + res.correct + " / " + res.total + "</h2>";
    html += "<p class='quiz-result-msg'>" + msg + "</p>";
    if (res.sg > 0) {
      html += "<div class='quiz-sg'>+" + res.sg + " SG</div>";
    } else if (res.correct > 0) {
      html += "<p class='dl-note'>Plafond quotidien de SG atteint : reviens demain.</p>";
    }

    html += "<h3 class='dl-section'>Correction</h3>";
    state.questions.forEach(function (q, i) {
      var r = res.results[i] || {};
      var mine = state.answers[i];
      var ok = mine === r.a;
      html +=
        "<div class='dl-review " + (ok ? "ok" : "ko") + "'>" +
        "<div class='item-main'>" + (i + 1) + ". " + esc(q.q) + "</div>" +
        "<div class='item-sub'>Ta réponse : " + esc(q.c[mine] || "") + (ok ? " ✔" : " ✘") + "</div>" +
        (ok ? "" : "<div class='item-sub'>Bonne réponse : " + esc(q.c[r.a] || "") + "</div>") +
        (r.e ? "<div class='item-sub'>" + esc(r.e) + "</div>" : "") +
        "</div>";
    });

    html +=
      "<div class='quiz-result-actions'>" +
      "<button class='btn btn-secondary' id='dl-levels' type='button'>Autre niveau</button>" +
      "<button class='btn btn-primary' id='dl-quit' type='button'>Retour</button>" +
      "</div></div>";

    show(html);
    if (ratio >= 0.8) confetti();
  }

  async function startLevel(level) {
    var id = ++runId;
    state.level = level;
    loading(
      "Samoloski AI prépare tes questions…",
      "La première fois de la journée, ça peut prendre jusqu'à une minute. Ne ferme pas cet écran."
    );

    try {
      var ready = await cloud.prepareDaily(state.subjectId, level);
      if (id !== runId) return;
      if (!ready) {
        message("⏳", "Pas encore prêt", "Les questions ne sont pas encore prêtes. Réessaie dans une minute.", true);
        return;
      }

      var set = await cloud.getDailySet(state.subjectId, level);
      if (id !== runId) return;
      if (!set || !set.questions || !set.questions.length) {
        message("🤔", "Aucune question", "Aucune question disponible pour le moment. Réessaie plus tard.", true);
        return;
      }

      var prev = await cloud.dailyAttempt(set.set_id);
      if (id !== runId) return;
      if (prev) {
        message(
          "✅",
          "Déjà joué aujourd'hui",
          "Tu as fait " + prev.correct + "/" + prev.total + " (+" + prev.sg + " SG). " +
            "Reviens demain pour de nouvelles questions, ou choisis un autre niveau.",
          true
        );
        return;
      }

      state.setId = set.set_id;
      state.questions = set.questions;
      state.answers = [];
      state.index = 0;
      state.picked = null;
      renderQuestion();
    } catch (e) {
      if (id !== runId) return;
      message("⚠️", "Oups", e.message || "Une erreur est survenue. Réessaie.", true);
    }
  }

  async function submit() {
    var id = ++runId;
    loading("Correction en cours…", "");
    try {
      var res = await cloud.submitDaily(state.setId, state.answers);
      if (id !== runId) return;
      renderResult(res);
    } catch (e) {
      if (id !== runId) return;
      message("⚠️", "Envoi impossible", e.message || "Une erreur est survenue.", true);
    }
  }

  function next() {
    if (state.picked === null) return;
    state.answers.push(state.picked);
    state.picked = null;
    state.index++;
    if (state.index >= state.questions.length) submit();
    else renderQuestion();
  }

  async function open(subjectId, name) {
    var id = ++runId;
    state = { subjectId: subjectId, name: name, level: 0 };
    root.hidden = false;
    document.body.classList.add("no-scroll");
    if (!history.state || history.state.screen !== "daily") {
      history.pushState({ screen: "daily" }, "");
    }

    if (!cloud || !cloud.available()) {
      message("📡", "Défi indisponible", "Le défi du jour demande une connexion internet.", false);
      return;
    }

    loading("Connexion…", "");
    try {
      if (!cloud.getProfile()) await cloud.loadProfile();
      if (id !== runId) return;
      if (!cloud.getProfile()) {
        message(
          "🏷️",
          "Choisis ton pseudo",
          "Ferme cet écran, touche 🏆 en haut à droite, puis « Choisir mon pseudo ». Ensuite, reviens ici.",
          false
        );
        return;
      }
      renderLevels();
    } catch (e) {
      if (id !== runId) return;
      message("⚠️", "Connexion impossible", "Vérifie ta connexion internet puis réessaie.", false);
    }
  }

  function hide() {
    runId++;
    root.hidden = true;
    root.innerHTML = "";
    state = null;
    document.body.classList.remove("no-scroll");
  }

  function close() {
    if (history.state && history.state.screen === "daily") history.back();
    else hide();
  }

  root.addEventListener("click", function (e) {
    if (e.target.closest("#dl-close") || e.target.closest("#dl-quit")) {
      close();
      return;
    }
    if (e.target.closest("#dl-levels")) {
      runId++;
      renderLevels();
      return;
    }
    var lv = e.target.closest("[data-dl-level]");
    if (lv) {
      startLevel(parseInt(lv.getAttribute("data-dl-level"), 10));
      return;
    }
    var choice = e.target.closest(".quiz-choice");
    if (choice) {
      pick(choice);
      return;
    }
    if (e.target.closest("#dl-next")) next();
  });

  window.addEventListener("popstate", function () {
    if (!root.hidden) hide();
  });

  document.addEventListener("samquiz:open-daily", function (e) {
    open(e.detail.id, e.detail.name);
  });

  document.addEventListener("samquiz:cloud-score", function (e) {
    var pill = document.querySelector(".sg-pill");
    if (pill) pill.textContent = "⭐ " + e.detail.sg + " SG";
  });
})();
