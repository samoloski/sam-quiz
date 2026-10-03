/* sam quiz : carte Samoloski AI sur l'accueil (logo + defis du jour en acces rapide) */
(function () {
  var home = document.getElementById("screen-home");
  if (!home) return;

  var SUBJECTS = [
    { id: "maths", name: "Mathématiques", short: "Maths", icon: "📐" },
    { id: "physique", name: "Physique-Chimie", short: "Physique", icon: "⚗️" },
    { id: "svt", name: "SVT", short: "SVT", icon: "🧬" },
    { id: "francais", name: "Français", short: "Français", icon: "📖" },
    { id: "anglais", name: "Anglais", short: "Anglais", icon: "🗣️" },
    { id: "histgeo", name: "Histoire-Géographie", short: "Hist-Géo", icon: "🌍" }
  ];

  var LOGO =
    '<svg class="hub-logo" viewBox="0 0 64 64" aria-hidden="true">' +
    '<defs><linearGradient id="hubGrad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#a78bfa"/>' +
    "</linearGradient></defs>" +
    '<line x1="32" y1="6" x2="32" y2="14" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="32" cy="5" r="3.5" fill="#fbbf24"/>' +
    '<rect x="4" y="26" width="6" height="12" rx="3" fill="#fff" opacity="0.85"/>' +
    '<rect x="54" y="26" width="6" height="12" rx="3" fill="#fff" opacity="0.85"/>' +
    '<rect x="10" y="14" width="44" height="38" rx="14" fill="url(#hubGrad)"/>' +
    '<rect x="15" y="21" width="34" height="24" rx="10" fill="#0f172a"/>' +
    '<g class="hub-eyes">' +
    '<circle cx="25" cy="32" r="4" fill="#38bdf8"/>' +
    '<circle cx="39" cy="32" r="4" fill="#38bdf8"/></g>' +
    '<path d="M26 40 Q32 45 38 40" stroke="#fbbf24" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    "</svg>";

  function build() {
    var chips = "";
    SUBJECTS.forEach(function (s) {
      chips +=
        '<button class="hub-chip" type="button" data-sub="' + s.id + '">' +
        "<span>" + s.icon + "</span>" + s.short + "</button>";
    });

    var hub = document.createElement("section");
    hub.className = "ai-hub";
    hub.id = "ai-hub";
    hub.innerHTML =
      '<div class="hub-head">' + LOGO +
      "<div><h2 class='hub-title'>Samoloski AI</h2>" +
      "<p class='hub-sub'>Ton coach de révision</p></div></div>" +
      '<div id="hub-slot-top"></div>' +
      '<p class="hub-label">⚡ Défis du jour</p>' +
      '<p class="hub-hint">De nouvelles questions chaque jour, les mêmes pour tous les joueurs.</p>' +
      '<div class="hub-chips">' + chips + "</div>" +
      '<div id="hub-slot-bottom"></div>';

    home.insertBefore(hub, home.firstChild);

    hub.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-sub]");
      if (!btn) return;
      var id = btn.getAttribute("data-sub");
      for (var i = 0; i < SUBJECTS.length; i++) {
        if (SUBJECTS[i].id === id) {
          document.dispatchEvent(
            new CustomEvent("samquiz:open-daily", {
              detail: { id: SUBJECTS[i].id, name: SUBJECTS[i].name }
            })
          );
          return;
        }
      }
    });
  }

  build();
})();
