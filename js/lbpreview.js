/* sam quiz : apercu du classement dans la carte Samoloski AI */
(function () {
  var cloud = window.SamCloud;
  var hub = document.getElementById("ai-hub");
  if (!cloud || !hub) return;

  var anchor = hub.querySelector(".hub-label");
  var card = document.createElement("div");
  card.className = "lb-card";
  hub.insertBefore(card, anchor);

  var busy = false;
  var data = null;
  var failed = false;

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function openRanking() {
    var b = document.querySelector(".rank-btn");
    if (b) b.click();
  }

  function render() {
    var html =
      "<div class='lb-head'><span>🏆 Classement des joueurs</span>" +
      "<button class='lb-all' type='button'>Voir tout ›</button></div>";

    if (!cloud.available()) {
      html += "<p class='lb-note'>Le classement demande une connexion internet.</p>";
    } else if (!data) {
      html += failed
        ? "<p class='lb-note'>Touche « Voir tout » pour ouvrir le classement.</p>"
        : "<div class='lb-skel'></div><div class='lb-skel'></div><div class='lb-skel'></div>";
    } else if (!data.top.length) {
      html += "<p class='lb-note'>Personne n'est encore classé. Sois le premier !</p>";
    } else {
      var medals = ["🥇", "🥈", "🥉"];
      data.top.slice(0, 3).forEach(function (r, i) {
        html +=
          "<div class='lb-row" + (r.me ? " me" : "") + "'>" +
          "<span class='lb-medal'>" + medals[i] + "</span>" +
          "<span class='lb-name'>" + esc(r.pseudo) + (r.me ? " (toi)" : "") + "</span>" +
          "<span class='lb-sg'>" + r.score + " SG</span></div>";
      });
      if (data.me && data.me.rank > 3) {
        html += "<p class='lb-note'>Ton rang : #" + data.me.rank + " · " + data.me.score + " SG</p>";
      }
    }

    card.innerHTML = html;
  }

  function refresh() {
    if (busy || !cloud.available()) return;
    busy = true;
    cloud
      .getLeaderboard("all")
      .then(function (d) {
        data = d;
        failed = false;
      })
      .catch(function (e) {
        console.error("Aperçu du classement indisponible :", e);
        if (!data) failed = true;
      })
      .then(function () {
        busy = false;
        render();
      });
  }

  card.addEventListener("click", openRanking);

  hub.addEventListener("click", function (e) {
    var tile = e.target.closest(".stat-tile");
    if (tile && tile.parentElement && tile.parentElement.children[1] === tile) openRanking();
  });

  document.addEventListener("samquiz:cloud-score", refresh);
  document.addEventListener("samquiz:show-home", refresh);

  render();
  refresh();
})();
