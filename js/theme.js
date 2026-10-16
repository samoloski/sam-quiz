/* sam quiz : bascule clair / sombre */
(function () {
  var KEY = "samquiz:theme";
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "th-toggle";

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function refresh() {
    var dark = current() === "dark";
    btn.textContent = dark ? "☀️ Clair" : "🌙 Sombre";
    btn.setAttribute("aria-label", dark ? "Passer en mode clair" : "Passer en mode sombre");
    if (meta) meta.setAttribute("content", dark ? "#1e1b4b" : "#3730a3");
  }

  function apply(theme, remember) {
    root.classList.add("th-fade");
    root.setAttribute("data-theme", theme);
    if (remember) {
      try {
        localStorage.setItem(KEY, theme);
      } catch (e) {}
    }
    refresh();
    setTimeout(function () {
      root.classList.remove("th-fade");
    }, 400);
  }

  btn.addEventListener("click", function () {
    apply(current() === "dark" ? "light" : "dark", true);
  });

  var card = document.querySelector(".wl-card");
  if (card) {
    card.appendChild(btn);
  } else {
    btn.classList.add("floating");
    document.body.appendChild(btn);
  }

  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      if (!stored()) apply(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  refresh();
})();
