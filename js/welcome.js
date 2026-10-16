/* sam quiz : bloc de bienvenue avec le pseudo du joueur */
(function () {
  var home = document.getElementById("screen-home");
  if (!home) return;

  var card = document.createElement("section");
  card.className = "wl-card";
  card.innerHTML =
    "<p class='wl-hello'>Bienvenue</p>" +
    "<h2 class='wl-name'></h2>" +
    "<p class='wl-sub'>Prêt à réviser ?</p>";
  home.insertBefore(card, home.firstChild);

  var nameEl = card.querySelector(".wl-name");
  var last = null;

  function pseudo() {
    try {
      return localStorage.getItem("samquiz:pseudo") || "";
    } catch (e) {
      return "";
    }
  }

  function update() {
    var p = pseudo();
    if (p === last) return;
    last = p;
    nameEl.textContent = p;
    card.classList.toggle("has-name", !!p);
    if (p) {
      nameEl.classList.remove("pop");
      void nameEl.offsetWidth;
      nameEl.classList.add("pop");
    }
  }

  document.addEventListener("samquiz:cloud-score", update);
  document.addEventListener("samquiz:show-home", update);
  window.addEventListener("storage", update);
  window.addEventListener("load", update);

  var tries = 0;
  var poll = setInterval(function () {
    update();
    tries += 1;
    if (tries > 20 || last) clearInterval(poll);
  }, 1000);

  update();
})();
