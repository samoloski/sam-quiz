/* sam quiz : classement et choix du pseudo */
(function () {
  var cloud = window.SamCloud;
  var ASKED = "samquiz:pseudo-asked";
  var topbar = document.getElementById("topbar");

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

  var pseudoBox = document.createElement("div");
  pseudoBox.className = "modal pseudo-modal";
  pseudoBox.hidden = true;
  document.body.appendChild(pseudoBox);

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function online() {
    return cloud && cloud.available();
  }

  function shell(inner) {
    return (
      "<div class='rank-top'><h2>🏆 Classement</h2>" +
      "<button class='quiz-close' id='rk-close' type='button' aria-label='Fermer'>✕</button></div>" +
      "<div class='rank-body'>" + inner + "</div>"
    );
  }

  function medal(i) {
    return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);
  }

  function rowsHtml(rows, me) {
    if (!rows.length) {
      return "<p class='rank-empty'>Personne dans le classement pour l'instant. Sois le premier !</p>";
    }
    var html = "<div class='rank-list'>";
    rows.forEach(function (r, i) {
      var mine = me && r.pseudo === me.pseudo;
      html +=
        "<div class='rank-row" + (mine ? " me" : "") + "'>" +
        "<span class='rank-pos'>" + medal(i) + "</span>" +
        "<span class='rank-name'>" + esc(r.pseudo) + (mine ? " (toi)" : "") + "</span>" +
        "<span class='rank-sg'>" + r.sg + " SG</span></div>";
    });
    return html + "</div>";
  }

  async function openRanking() {
    screen.hidden = false;
    document.body.classList.add("no-scroll");
    screen.innerHTML = shell("<p class='rank-empty'>Chargement…</p>");

    if (!online()) {
      screen.innerHTML = shell("<p class='rank-empty'>Classement indisponible pour le moment.</p>");
      return;
    }

    try {
      if (!cloud.getProfile()) await cloud.loadProfile();
      var rows = await cloud.leaderboard();
      var me = cloud.getProfile();
      var banner = me
        ? ""
        : "<div class='rank-banner'><p>Choisis un pseudo pour apparaître dans le classement.</p>" +
          "<button class='btn btn-primary' id='rk-pseudo' type='button'>Choisir mon pseudo</button></div>";
      screen.innerHTML = shell(banner + rowsHtml(rows, me));
    } catch (e) {
      console.error(e);
      screen.innerHTML = shell("<p class='rank-empty'>Impossible de charger le classement. Vérifie ta connexion.</p>");
    }
  }

  function closeRanking() {
    screen.hidden = true;
    screen.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function openPseudo() {
    try { localStorage.setItem(ASKED, "1"); } catch (e) {}
    pseudoBox.innerHTML =
      "<div class='modal-box'><h2>Choisis ton pseudo</h2>" +
      "<p class='hint'>Il sera visible de tous dans le classement. 3 à 16 caractères : lettres, chiffres ou _. Évite ton nom complet.</p>" +
      "<label class='field'><span>Pseudo</span>" +
      "<input type='text' id='ps-input' maxlength='16' autocomplete='off' autocapitalize='off'></label>" +
      "<p id='ps-error' class='field-error' hidden></p>" +
      "<div class='modal-actions'>" +
      "<button class='btn btn-secondary' id='ps-later' type='button'>Plus tard</button>" +
      "<button class='btn btn-primary' id='ps-save' type='button'>Valider</button></div></div>";
    pseudoBox.hidden = false;
    setTimeout(function () {
      var input = document.getElementById("ps-input");
      if (input) input.focus();
    }, 80);
  }

  function closePseudo() {
    pseudoBox.hidden = true;
    pseudoBox.innerHTML = "";
  }

  async function savePseudo() {
    var input = document.getElementById("ps-input");
    var err = document.getElementById("ps-error");
    var value = input.value.trim();

    if (!/^[A-Za-z0-9_]{3,16}$/.test(value)) {
      err.textContent = "Pseudo invalide : 3 à 16 caractères (lettres, chiffres, _).";
      err.hidden = false;
      return;
    }

    try {
      await cloud.createProfile(value);
      closePseudo();
      if (!screen.hidden) openRanking();
    } catch (e) {
      err.textContent = e.message || "Erreur, réessaie.";
      err.hidden = false;
    }
  }

  btn.addEventListener("click", openRanking);

  screen.addEventListener("click", function (e) {
    if (e.target.closest("#rk-close")) closeRanking();
    else if (e.target.closest("#rk-pseudo")) openPseudo();
  });

  pseudoBox.addEventListener("click", function (e) {
    if (e.target === pseudoBox || e.target.closest("#ps-later")) closePseudo();
    else if (e.target.closest("#ps-save")) savePseudo();
  });

  if (online()) {
    cloud
      .loadProfile()
      .then(function (p) {
        var asked = false;
        try { asked = localStorage.getItem(ASKED) === "1"; } catch (e) {}
        if (!p && !asked) openPseudo();
      })
      .catch(function (e) {
        console.error(e);
      });
  }
})();
