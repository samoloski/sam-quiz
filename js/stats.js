/* sam quiz : serie de jours et statistiques */
(function () {
  var cloud = window.SamCloud;
  var top = document.getElementById("hub-slot-top");
  if (!cloud || !top) return;

  var NAMES = {
    maths: "Mathématiques",
    physique: "Physique-Chimie",
    svt: "SVT",
    francais: "Français",
    anglais: "Anglais",
    histgeo: "Histoire-Géographie"
  };

  var data = null;
  var busy = false;

  var screen = document.createElement("div");
  screen.className = "rank-screen";
  screen.hidden = true;
  document.body.appendChild(screen);

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function pct(correct, total) {
    return total ? Math.round((correct / total) * 100) : null;
  }

  function renderTop() {
    if (!data) {
      top.innerHTML = "";
      return;
    }

    var rate = pct(data.correct, data.total);
    var hint = "";
    if (data.streak === 0) {
      hint = "Joue aujourd'hui pour démarrer ta série 🔥";
    } else if (!data.played_today) {
      hint = "Joue aujourd'hui pour garder ta série 🔥";
    }

    top.innerHTML =
      '<div class="stat-tiles">' +
      '<div class="stat-tile"><b>🔥 ' + data.streak + "</b><span>jour" + (data.streak > 1 ? "s" : "") + " de série</span></div>" +
      '<div class="stat-tile"><b>🏅 ' + (data.rank ? "#" + data.rank : "–") + "</b><span>au classement</span></div>" +
      '<div class="stat-tile"><b>🎯 ' + (rate === null ? "–" : rate + " %") + "</b><span>de réussite</span></div>" +
      "</div>" +
      (hint ? '<p class="stat-hint">' + hint + "</p>" : "") +
      '<button class="stat-link" id="st-open" type="button">📊 Mes statistiques</button>';
  }

  function refresh() {
    if (busy || !cloud.available()) return;
    busy = true;
    cloud
      .getStats()
      .then(function (d) {
        data = d;
        renderTop();
      })
      .catch(function (e) {
        console.error("Statistiques indisponibles :", e);
      })
      .then(function () {
        busy = false;
      });
  }

  function shell(inner) {
    return (
      "<div class='rank-top'><h2>📊 Mes statistiques</h2>" +
      "<button class='quiz-close' id='st-close' type='button' aria-label='Fermer'>✕</button></div>" +
      "<div class='rank-body'>" + inner + "</div>"
    );
  }

  function renderScreen() {
    if (!data) {
      screen.innerHTML = shell("<p class='rank-empty'>Statistiques indisponibles pour le moment.</p>");
      return;
    }

    var rate = pct(data.correct, data.total);
    var html = "<div class='st-grid'>";
    html += "<div class='st-card'><b>⭐ " + data.sg + "</b><span>points SG</span></div>";
    html += "<div class='st-card'><b>🏅 " + (data.rank ? "#" + data.rank : "–") + "</b><span>au classement</span></div>";
    html += "<div class='st-card'><b>🔥 " + data.streak + "</b><span>série en cours</span></div>";
    html += "<div class='st-card'><b>🏆 " + data.best_streak + "</b><span>meilleure série</span></div>";
    html += "<div class='st-card'><b>🎮 " + data.games + "</b><span>parties jouées</span></div>";
    html += "<div class='st-card'><b>🎯 " + (rate === null ? "–" : rate + " %") + "</b><span>de réussite</span></div>";
    html += "</div>";

    html += "<h3 class='dl-section'>Par matière</h3><div class='st-subjects'>";
    if (!data.by_subject || data.by_subject.length === 0) {
      html += "<p class='rank-empty'>Joue un quiz ou un défi du jour pour voir tes statistiques.</p>";
    } else {
      data.by_subject.forEach(function (s) {
        var p = pct(s.correct, s.total) || 0;
        html +=
          "<div class='st-row'><div class='st-row-top'><span>" + esc(NAMES[s.subject] || s.subject) + "</span>" +
          "<small>" + p + " % · " + s.games + " partie" + (s.games > 1 ? "s" : "") + "</small></div>" +
          "<div class='st-bar'><i style='width:" + p + "%'></i></div></div>";
      });
    }
    html += "</div>";

    screen.innerHTML = shell(html);
  }

  function openScreen() {
    renderScreen();
    screen.hidden = false;
    document.body.classList.add("no-scroll");
    refresh();
    var wait = setInterval(function () {
      if (!busy) {
        clearInterval(wait);
        if (!screen.hidden) renderScreen();
      }
    }, 300);
  }

  function closeScreen() {
    screen.hidden = true;
    screen.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  top.addEventListener("click", function (e) {
    if (e.target.closest("#st-open")) openScreen();
  });

  screen.addEventListener("click", function (e) {
    if (e.target.closest("#st-close")) closeScreen();
  });

  document.addEventListener("samquiz:cloud-score", refresh);
  document.addEventListener("samquiz:show-home", refresh);

  refresh();
})();
