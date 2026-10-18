/* sam quiz : bloc de bienvenue personnalisable (nom affiché, couleurs, style d'écriture) */
(function () {
  var home = document.getElementById("screen-home");
  if (!home) return;

  var PSEUDO_KEY = "samquiz:pseudo";
  var STYLE_KEY = "samquiz:profil";

  var BACKS = [
    { c: "", dark: false, label: "Blanc" },
    { c: "#eef2ff", dark: false, label: "Indigo clair" },
    { c: "#ecfdf5", dark: false, label: "Vert clair" },
    { c: "#fff7ed", dark: false, label: "Orange clair" },
    { c: "#fdf2f8", dark: false, label: "Rose clair" },
    { c: "#1e3a8a", dark: true, label: "Bleu nuit" },
    { c: "#065f46", dark: true, label: "Vert profond" },
    { c: "#0f172a", dark: true, label: "Noir" }
  ];
  var COLORS = ["", "#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#db2777", "#7c3aed", "#ffffff", "#111827"];
  var FONTS = [
    { k: "script", label: "Manuscrit", css: "'Pacifico','Dancing Script','Brush Script MT',cursive", w: "400", i: "normal" },
    { k: "serif", label: "Élégant", css: "Georgia,'Times New Roman',serif", w: "700", i: "italic" },
    { k: "sans", label: "Moderne", css: "'Poppins',system-ui,-apple-system,sans-serif", w: "800", i: "normal" },
    { k: "mono", label: "Code", css: "ui-monospace,Menlo,Consolas,monospace", w: "700", i: "normal" }
  ];

  function readJSON(k) {
    try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STYLE_KEY, JSON.stringify(st)); } catch (e) {}
  }
  function cloudPseudo() {
    try { return localStorage.getItem(PSEUDO_KEY) || ""; } catch (e) { return ""; }
  }

  var st = readJSON(STYLE_KEY); // { name, back, color, font }

  /* ---- carte ---- */
  var card = document.createElement("section");
  card.className = "wl-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", "Personnaliser mon profil");
  card.innerHTML =
    "<span class='wl-edit' aria-hidden='true'>✏️ Modifier</span>" +
    "<p class='wl-hello'>Bienvenue</p>" +
    "<h2 class='wl-name'></h2>" +
    "<p class='wl-sub'>Prêt à réviser ?</p>";
  home.insertBefore(card, home.firstChild);
  var nameEl = card.querySelector(".wl-name");
  var last = null;

  function displayName() {
    return (st.name && st.name.trim()) || cloudPseudo();
  }

  function applyStyle() {
    var b = null;
    for (var i = 0; i < BACKS.length; i++) if (BACKS[i].c === (st.back || "")) b = BACKS[i];
    if (st.back) card.style.setProperty("background", st.back, "important");
    else card.style.removeProperty("background");
    card.classList.toggle("wl-dark", !!(b && b.dark));

    var f = FONTS[0];
    for (var j = 0; j < FONTS.length; j++) if (FONTS[j].k === st.font) f = FONTS[j];
    nameEl.style.fontFamily = f.css;
    nameEl.style.fontWeight = f.w;
    nameEl.style.fontStyle = f.i;

    if (st.color) {
      nameEl.classList.add("solid");
      nameEl.style.setProperty("--wl-solid", st.color);
    } else {
      nameEl.classList.remove("solid");
      nameEl.style.removeProperty("--wl-solid");
    }
  }

  function update(force) {
    var p = displayName();
    if (p === last && !force) return;
    last = p;
    nameEl.textContent = p;
    card.classList.toggle("has-name", !!p);
    if (p) {
      nameEl.classList.remove("pop");
      void nameEl.offsetWidth;
      nameEl.classList.add("pop");
    }
  }

  /* ---- fenêtre de personnalisation ---- */
  var sheet = document.createElement("div");
  sheet.className = "wl-sheet";
  sheet.hidden = true;
  sheet.innerHTML =
    "<div class='wl-back'></div>" +
    "<div class='wl-panel' role='dialog' aria-modal='true' aria-label='Mon profil'>" +
    "<div class='wl-grip'></div>" +
    "<h3>Personnaliser mon profil</h3>" +
    "<label class='wl-lbl' for='wl-input'>Nom affiché</label>" +
    "<input id='wl-input' class='wl-input' type='text' maxlength='20' autocomplete='off' placeholder='Ton nom'>" +
    "<p class='wl-note'>Ce nom s'affiche dans ton tableau de bord. Ton pseudo du classement ne change pas.</p>" +
    "<div class='wl-lbl'>Couleur du fond</div><div class='wl-row' data-g='back'></div>" +
    "<div class='wl-lbl'>Couleur du nom</div><div class='wl-row' data-g='color'></div>" +
    "<div class='wl-lbl'>Style d'écriture</div><div class='wl-row wl-fonts' data-g='font'></div>" +
    "<div class='wl-actions'><button type='button' class='wl-btn ghost' data-a='reset'>Réinitialiser</button>" +
    "<button type='button' class='wl-btn' data-a='close'>Terminé</button></div>" +
    "</div>";
  document.body.appendChild(sheet);

  var input = sheet.querySelector("#wl-input");
  var rows = {
    back: sheet.querySelector("[data-g=back]"),
    color: sheet.querySelector("[data-g=color]"),
    font: sheet.querySelector("[data-g=font]")
  };

  BACKS.forEach(function (b) {
    var x = document.createElement("button");
    x.type = "button";
    x.className = "wl-sw" + (b.c ? "" : " white");
    x.style.background = b.c || "#ffffff";
    x.title = b.label;
    x.setAttribute("aria-label", b.label);
    x.dataset.v = b.c;
    rows.back.appendChild(x);
  });
  COLORS.forEach(function (c) {
    var x = document.createElement("button");
    x.type = "button";
    x.className = "wl-sw" + (c ? "" : " rainbow");
    if (c) x.style.background = c;
    x.title = c ? c : "Dégradé animé";
    x.setAttribute("aria-label", c ? "Couleur " + c : "Dégradé animé");
    x.dataset.v = c;
    rows.color.appendChild(x);
  });
  var pick = document.createElement("input");
  pick.type = "color";
  pick.className = "wl-pick";
  pick.value = "#2563eb";
  pick.setAttribute("aria-label", "Couleur personnalisée");
  rows.color.appendChild(pick);
  FONTS.forEach(function (f) {
    var x = document.createElement("button");
    x.type = "button";
    x.className = "wl-font";
    x.textContent = f.label;
    x.style.fontFamily = f.css;
    x.style.fontWeight = f.w;
    x.style.fontStyle = f.i;
    x.dataset.v = f.k;
    rows.font.appendChild(x);
  });

  function mark() {
    [].forEach.call(rows.back.children, function (e) {
      e.classList.toggle("on", (e.dataset.v || "") === (st.back || ""));
    });
    [].forEach.call(rows.color.querySelectorAll(".wl-sw"), function (e) {
      e.classList.toggle("on", (e.dataset.v || "") === (st.color || ""));
    });
    [].forEach.call(rows.font.children, function (e) {
      e.classList.toggle("on", e.dataset.v === (st.font || "script"));
    });
  }

  function open() {
    input.value = st.name || cloudPseudo();
    mark();
    sheet.hidden = false;
    document.body.classList.add("wl-lock");
  }
  function close() {
    sheet.hidden = true;
    document.body.classList.remove("wl-lock");
  }

  card.addEventListener("click", open);
  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
  sheet.querySelector(".wl-back").addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !sheet.hidden) close();
  });

  input.addEventListener("input", function () {
    var v = input.value.replace(/\s+/g, " ").slice(0, 20);
    st.name = v.trim() === cloudPseudo() ? "" : v;
    save();
    update(true);
  });

  rows.back.addEventListener("click", function (e) {
    var b = e.target.closest(".wl-sw");
    if (!b) return;
    st.back = b.dataset.v; save(); applyStyle(); mark();
  });
  rows.color.addEventListener("click", function (e) {
    var b = e.target.closest(".wl-sw");
    if (!b) return;
    st.color = b.dataset.v; save(); applyStyle(); mark();
  });
  pick.addEventListener("input", function () {
    st.color = pick.value; save(); applyStyle(); mark();
  });
  rows.font.addEventListener("click", function (e) {
    var b = e.target.closest(".wl-font");
    if (!b) return;
    st.font = b.dataset.v; save(); applyStyle(); mark();
    update(true);
  });
  sheet.querySelector("[data-a=close]").addEventListener("click", close);
  sheet.querySelector("[data-a=reset]").addEventListener("click", function () {
    st = {};
    save();
    input.value = cloudPseudo();
    applyStyle(); mark(); update(true);
  });

  /* ---- mises à jour ---- */
  document.addEventListener("samquiz:cloud-score", function () { update(); });
  document.addEventListener("samquiz:show-home", function () { update(); });
  window.addEventListener("storage", function () { st = readJSON(STYLE_KEY); applyStyle(); update(true); });
  window.addEventListener("load", function () { update(); });

  var tries = 0;
  var poll = setInterval(function () {
    update();
    tries += 1;
    if (tries > 20 || last) clearInterval(poll);
  }, 1000);

  applyStyle();
  update(true);
})();
