/* sam quiz : barre de navigation du bas (5 pages) */
(function () {
  var ITEMS = [
    { id: "home", icon: "🏠", label: "Accueil" },
    { id: "subjects", icon: "📚", label: "Matières" },
    { id: "ranking", icon: "🏆", label: "Classement" },
    { id: "stats", icon: "📊", label: "Stats" },
    { id: "ai", icon: "🤖", label: "Samoloski" }
  ];

  var bar = document.createElement("nav");
  bar.id = "bottom-nav";
  bar.setAttribute("aria-label", "Navigation principale");

  var html = "";
  ITEMS.forEach(function (it) {
    html +=
      '<button type="button" class="nav-item" data-nav="' + it.id + '">' +
      '<span class="nav-ico">' + it.icon + "</span>" +
      '<span class="nav-label">' + it.label + "</span></button>";
  });
  bar.innerHTML = html;
  document.body.appendChild(bar);

  function setActive(id) {
    var all = bar.querySelectorAll(".nav-item");
    for (var i = 0; i < all.length; i++) {
      all[i].classList.toggle("active", all[i].getAttribute("data-nav") === id);
    }
  }

  function backToHome() {
    var b = document.getElementById("btn-back");
    if (b && b.classList.contains("visible")) b.click();
  }

  function clickIfFound(el) {
    if (el) el.click();
  }

  function findStatsButton() {
    var btns = document.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      if (bar.contains(btns[i])) continue;
      if (/statistiques/i.test(btns[i].textContent)) return btns[i];
    }
    return null;
  }

  bar.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-nav]");
    if (!btn) return;
    var id = btn.getAttribute("data-nav");

    if (id === "home") {
      setActive("home");
      backToHome();
      setTimeout(function () { window.scrollTo({ top: 0, behavior: "smooth" }); }, 80);
    } else if (id === "subjects") {
      setActive("subjects");
      backToHome();
      setTimeout(function () {
        var list = document.getElementById("home-list");
        if (list) list.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } else if (id === "ranking") {
      clickIfFound(document.querySelector(".rank-btn"));
    } else if (id === "stats") {
      clickIfFound(findStatsButton());
    } else if (id === "ai") {
      clickIfFound(document.querySelector(".chat-fab"));
    }
  });

  setActive("home");
})();
