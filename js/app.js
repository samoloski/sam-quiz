/* sam quiz : navigation entre les ecrans */
(function () {
  var home = document.getElementById("screen-home");
  var subjectEl = document.getElementById("screen-subject");
  var backBtn = document.getElementById("btn-back");
  var fab = document.getElementById("btn-add-subject");
  var toastEl = document.getElementById("toast");
  var currentId = null;
  var toastTimer = null;

  var AI_MAP = {
    mathematiques: "maths",
    maths: "maths",
    physiquechimie: "physique",
    physique: "physique",
    svt: "svt",
    francais: "francais",
    anglais: "anglais",
    histoiregeographie: "histgeo",
    histoiregeo: "histgeo",
    histgeo: "histgeo"
  };

  function aiId(name) {
    var key = String(name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    return AI_MAP[key] || null;
  }

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function plural(n, word) {
    return n + " " + word + (n > 1 ? "s" : "");
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 2200);
  }

  function renderSubject() {
    var s = window.SamStore.getSubject(currentId);
    if (!s) {
      showHome();
      return;
    }

    var html = "";
    html += '<span class="chip">' + esc(s.category) + "</span>";
    html += '<h2 class="subject-title">' + esc(s.name) + "</h2>";
    html +=
      '<p class="subject-sub">' +
      plural(s.cards.length, "carte") + " · " +
      plural(s.questions.length, "question") + "</p>";

    html += '<div class="mode-grid">';
    html +=
      '<button class="mode-card" type="button" data-mode="flashcards">' +
      '<span class="mode-icon">🃏</span>' +
      '<span class="mode-title">Flashcards</span>' +
      '<span class="mode-desc">Retourne et révise</span></button>';
    html +=
      '<button class="mode-card" type="button" data-mode="quiz">' +
      '<span class="mode-icon">🎯</span>' +
      '<span class="mode-title">Quiz</span>' +
      '<span class="mode-desc">Teste-toi en QCM</span></button>';
    html += "</div>";

    if (aiId(s.name)) {
      html +=
        '<button class="ai-card" type="button" data-ai="1">' +
        '<span class="ai-icon">🤖</span>' +
        "<span><strong>Samoloski AI</strong>" +
        "<small>Défi du jour : de nouvelles questions chaque jour</small></span></button>";
    }

    html +=
      '<div class="add-row">' +
      '<button class="btn btn-secondary" type="button" data-add="card">+ Carte</button>' +
      '<button class="btn btn-secondary" type="button" data-add="question">+ Question</button>' +
      "</div>";

    html += '<h3 class="section-title">Cartes (' + s.cards.length + ")</h3>";
    if (s.cards.length === 0) {
      html += '<p class="subject-sub">Aucune carte pour l\'instant.</p>';
    } else {
      html += '<div class="item-list">';
      s.cards.forEach(function (c) {
        html +=
          '<div class="item"><div class="item-text">' +
          '<div class="item-main">' + esc(c.front) + "</div>" +
          '<div class="item-sub">' + esc(c.back) + "</div></div>" +
          '<button class="item-del" type="button" data-del-card="' + c.id + '" aria-label="Supprimer">✕</button>' +
          "</div>";
      });
      html += "</div>";
    }

    html += '<h3 class="section-title">Questions (' + s.questions.length + ")</h3>";
    if (s.questions.length === 0) {
      html += '<p class="subject-sub">Aucune question pour l\'instant.</p>';
    } else {
      html += '<div class="item-list">';
      s.questions.forEach(function (q) {
        html +=
          '<div class="item"><div class="item-text">' +
          '<div class="item-main">' + esc(q.question) + "</div>" +
          '<div class="item-sub">✔ ' + esc(q.choices[q.answer] || "") + "</div></div>" +
          '<button class="item-del" type="button" data-del-question="' + q.id + '" aria-label="Supprimer">✕</button>' +
          "</div>";
      });
      html += "</div>";
    }

    html +=
      '<div class="subject-actions">' +
      '<button class="btn btn-danger btn-block" type="button" data-del-subject="1">Supprimer cette matière</button>' +
      "</div>";

    subjectEl.innerHTML = html;
  }

  function showSubject(id) {
    currentId = id;
    renderSubject();
    home.hidden = true;
    subjectEl.hidden = false;
    fab.hidden = true;
    backBtn.classList.add("visible");
    window.scrollTo(0, 0);
    if (!history.state || history.state.screen !== "subject") {
      history.pushState({ screen: "subject" }, "");
    }
  }

  function showHome() {
    currentId = null;
    subjectEl.hidden = true;
    home.hidden = false;
    fab.hidden = false;
    backBtn.classList.remove("visible");
    document.dispatchEvent(new CustomEvent("samquiz:show-home"));
    window.scrollTo(0, 0);
  }

  document.addEventListener("samquiz:open-subject", function (e) {
    showSubject(e.detail.id);
  });

  document.addEventListener("samquiz:subject-changed", function () {
    if (currentId) renderSubject();
  });

  backBtn.addEventListener("click", function () {
    if (history.state && history.state.screen === "subject") {
      history.back();
    } else {
      showHome();
    }
  });

  window.addEventListener("popstate", function () {
    var onSubject = history.state && history.state.screen === "subject";
    if (currentId && !onSubject) showHome();
  });

  subjectEl.addEventListener("click", function (e) {
    var aiBtn = e.target.closest("[data-ai]");
    if (aiBtn) {
      var s = window.SamStore.getSubject(currentId);
      var id = s ? aiId(s.name) : null;
      if (id) {
        document.dispatchEvent(
          new CustomEvent("samquiz:open-daily", { detail: { id: id, name: s.name } })
        );
      }
      return;
    }

    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      document.dispatchEvent(
        new CustomEvent("samquiz:add", {
          detail: { type: addBtn.getAttribute("data-add"), id: currentId }
        })
      );
      return;
    }

    var modeBtn = e.target.closest("[data-mode]");
    if (modeBtn) {
      var ev = new CustomEvent("samquiz:start-mode", {
        detail: { mode: modeBtn.getAttribute("data-mode"), id: currentId },
        cancelable: true
      });
      document.dispatchEvent(ev);
      if (!ev.defaultPrevented) toast("Bientôt disponible");
      return;
    }

    var delCard = e.target.closest("[data-del-card]");
    if (delCard) {
      window.SamStore.deleteCard(currentId, delCard.getAttribute("data-del-card"));
      renderSubject();
      return;
    }

    var delQuestion = e.target.closest("[data-del-question]");
    if (delQuestion) {
      window.SamStore.deleteQuestion(currentId, delQuestion.getAttribute("data-del-question"));
      renderSubject();
      return;
    }

    if (e.target.closest("[data-del-subject]")) {
      if (confirm("Supprimer cette matière et tout son contenu ?")) {
        window.SamStore.deleteSubject(currentId);
        if (history.state && history.state.screen === "subject") {
          history.back();
        } else {
          showHome();
        }
        toast("Matière supprimée");
      }
    }
  });
})();
