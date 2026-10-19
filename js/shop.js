/* sam quiz : boutique (on l'ouvre en touchant la pastille SG du haut) */
(function () {
  var LS_KEY = "samquiz:shop";

  var BGS = [
    { id: "bg_ocean", name: "Océan", price: 300, css: "linear-gradient(135deg,#0ea5e9,#1d4ed8)" },
    { id: "bg_sunset", name: "Coucher de soleil", price: 300, css: "linear-gradient(135deg,#f97316,#db2777)" },
    { id: "bg_forest", name: "Forêt", price: 300, css: "linear-gradient(135deg,#16a34a,#065f46)" },
    { id: "bg_night", name: "Nuit étoilée", price: 400, css: "linear-gradient(135deg,#4338ca,#0f172a)" },
    { id: "bg_gold", name: "Or royal", price: 600, css: "linear-gradient(135deg,#f59e0b,#b45309)" }
  ];
  var FXS = [
    { id: "name_glow", name: "Lueur", price: 400, fx: "glow" },
    { id: "name_rainbow", name: "Arc-en-ciel", price: 500, fx: "rainbow" }
  ];
  var PACKS = [
    { id: "ai_5", name: "+5 messages IA", price: 150 },
    { id: "ai_20", name: "+20 messages IA", price: 500 }
  ];

  var css =
    ".sg-pill{cursor:pointer}" +
    "#shop-page{position:fixed;top:0;right:0;bottom:0;left:0;z-index:1800;overflow-y:auto;-webkit-overflow-scrolling:touch}" +
    "#shop-page[hidden]{display:none}" +
    ".shop-top{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:12px;padding:14px 16px;" +
    "background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff}" +
    ".shop-top h2{margin:0;font-size:20px;color:#fff}" +
    ".shop-back{background:rgba(255,255,255,.2);border:0;color:#fff;font-size:20px;width:38px;height:38px;border-radius:12px;cursor:pointer}" +
    ".shop-body{padding:16px;max-width:560px;margin:0 auto}" +
    ".shop-bal{text-align:center;padding:16px;border-radius:16px;background:rgba(128,128,128,.14);margin-bottom:18px}" +
    ".shop-bal-n{font-size:34px;font-weight:800}" +
    ".shop-bal small{display:block;opacity:.7;margin-top:6px}" +
    ".shop-body h3{margin:22px 0 4px;font-size:18px}" +
    ".shop-body h4{margin:14px 0 8px;font-size:14px;opacity:.75;font-weight:600}" +
    ".shop-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}" +
    ".shop-card{padding:10px;border-radius:14px;background:rgba(128,128,128,.12);display:flex;flex-direction:column;gap:8px}" +
    ".shop-sw{height:58px;border-radius:10px}" +
    ".shop-fxbox{height:58px;border-radius:10px;background:#1e1b4b;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800}" +
    ".shop-name{font-weight:700;font-size:14px}" +
    ".shop-btn{padding:9px 6px !important;font-size:14px !important}" +
    ".shop-low{opacity:.55}" +
    ".shop-row{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:rgba(128,128,128,.12);margin-bottom:10px}" +
    ".shop-row .shop-name{flex:1;font-size:15px}" +
    ".shop-row .shop-btn{width:auto;min-width:96px}" +
    ".shop-note{opacity:.75;font-size:14px;margin:6px 0}" +
    ".shop-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:2000;background:#111827;color:#fff;" +
    "padding:10px 16px;border-radius:12px;font-size:14px;max-width:86%;text-align:center}" +
    ".wl-name.fx-glow,.shop-fx.fx-glow{text-shadow:0 0 8px #fff,0 0 20px #a78bfa,0 0 34px #7c3aed !important}" +
    ".wl-name.fx-rainbow,.shop-fx.fx-rainbow{background:linear-gradient(90deg,#ef4444,#f59e0b,#16a34a,#3b82f6,#a855f7) !important;" +
    "-webkit-background-clip:text !important;background-clip:text !important;" +
    "-webkit-text-fill-color:transparent !important;color:transparent !important}";
  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var page = null;
  var data = null;
  var err = "";
  var busy = false;

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function local() {
    try {
      var v = JSON.parse(localStorage.getItem(LS_KEY));
      if (v && typeof v === "object") return { bg: v.bg || "", fx: v.fx || "" };
    } catch (e) {}
    return { bg: "", fx: "" };
  }
  function setLocal(v) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) {}
  }

  function applyFx() {
    var el = document.querySelector(".wl-name");
    if (!el) return;
    var l = local();
    ["glow", "rainbow"].forEach(function (x) {
      el.classList.toggle("fx-" + x, l.fx === x);
    });
  }

  function findItem(id) {
    var all = BGS.concat(FXS, PACKS);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function toast(text) {
    var t = document.createElement("div");
    t.className = "shop-toast";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
  }

  /* ---------- affichage ---------- */

  function ownedList() {
    return data && data.owned ? data.owned : [];
  }

  function lookBtn(it, equipped) {
    var owned = ownedList().indexOf(it.id) !== -1;
    if (!owned) {
      var low = data.balance < it.price ? " shop-low" : "";
      return "<button class='btn btn-primary btn-block shop-btn" + low + "' data-act='buy' data-id='" + it.id +
        "' type='button'>" + it.price + " SG</button>";
    }
    if (equipped) {
      return "<button class='btn btn-secondary btn-block shop-btn' data-act='off' data-id='" + it.id +
        "' type='button'>✓ Équipé · Retirer</button>";
    }
    return "<button class='btn btn-primary btn-block shop-btn' data-act='equip' data-id='" + it.id +
      "' type='button'>Équiper</button>";
  }

  function render() {
    if (!page) return;
    var html =
      "<div class='shop-top'><button class='shop-back' id='shop-back' type='button'>←</button>" +
      "<h2>🛍️ Boutique</h2></div><div class='shop-body'>";

    if (err === "offline") {
      html += "<p class='shop-note'>La boutique demande une connexion internet. Vérifie ta connexion puis rouvre-la.</p></div>";
      page.innerHTML = html;
      return;
    }
    if (err === "noprofile") {
      html += "<p class='shop-note'>Crée d'abord ton pseudo (au classement) et gagne tes premiers SG pour ouvrir la boutique.</p></div>";
      page.innerHTML = html;
      return;
    }
    if (!data) {
      html += "<p class='shop-note'>Chargement…</p></div>";
      page.innerHTML = html;
      return;
    }

    var l = local();
    html +=
      "<div class='shop-bal'><div class='shop-bal-n'>⭐ " + data.balance + " SG</div>" +
      "<div>Solde à dépenser</div>" +
      "<small>Total gagné : " + data.sg + " SG. Tes achats ne baissent jamais ton classement.</small></div>";

    html += "<h3>Looks du profil</h3><h4>Fonds de la carte Bienvenue</h4><div class='shop-grid'>";
    BGS.forEach(function (it) {
      html += "<div class='shop-card'><div class='shop-sw' style='background:" + it.css + "'></div>" +
        "<div class='shop-name'>" + esc(it.name) + "</div>" + lookBtn(it, l.bg === it.id) + "</div>";
    });
    html += "</div><h4>Effets sur ton nom</h4><div class='shop-grid'>";
    FXS.forEach(function (it) {
      html += "<div class='shop-card'><div class='shop-fxbox'><span class='shop-fx fx-" + it.fx + "'>Samoloski</span></div>" +
        "<div class='shop-name'>" + esc(it.name) + "</div>" + lookBtn(it, l.fx === it.fx) + "</div>";
    });
    html += "</div>";

    html += "<h3>Messages IA en plus</h3>" +
      "<p class='shop-note'>Quand tu as utilisé tes messages du jour avec Samoloski AI, ces messages prennent le relais. " +
      "Il t'en reste : <strong>" + data.ai_credits + "</strong>.</p>";
    PACKS.forEach(function (it) {
      var low = data.balance < it.price ? " shop-low" : "";
      html += "<div class='shop-row'><div class='shop-name'>🤖 " + esc(it.name) + "</div>" +
        "<button class='btn btn-primary shop-btn" + low + "' data-act='buy' data-id='" + it.id + "' type='button'>" +
        it.price + " SG</button></div>";
    });

    html += "</div>";
    page.innerHTML = html;
  }

  function refresh() {
    if (!window.SamCloud || !window.SamCloud.available() || !window.SamCloud.getShop) {
      err = "offline";
      render();
      return;
    }
    window.SamCloud.getShop().then(function (d) {
      data = d;
      err = d ? "" : "noprofile";
      render();
    }).catch(function () {
      err = "offline";
      render();
    });
  }

  /* ---------- achat et equipement ---------- */

  function equip(it) {
    var l = local();
    if (it.css) {
      if (window.SamWelcome) window.SamWelcome.setStyle({ back: it.css, dark: it.css });
      l.bg = it.id;
    } else if (it.fx) {
      l.fx = it.fx;
    }
    setLocal(l);
    applyFx();
  }

  function unequip(it) {
    var l = local();
    if (it.css) {
      if (window.SamWelcome) {
        var st = window.SamWelcome.getStyle();
        if (st && st.back === it.css) window.SamWelcome.setStyle({ back: "", dark: "" });
      }
      l.bg = "";
    } else if (it.fx) {
      l.fx = "";
    }
    setLocal(l);
    applyFx();
  }

  function errText(e) {
    var m = String((e && e.message) || "");
    if (/solde/i.test(m)) return "Solde insuffisant.";
    if (/deja/i.test(m)) return "Tu as déjà cet objet.";
    return "Achat impossible, réessaie.";
  }

  function buy(it) {
    if (busy || !data) return;
    if (data.balance < it.price) {
      toast("Il te manque " + (it.price - data.balance) + " SG pour cet objet.");
      return;
    }
    if (!window.confirm("Acheter « " + it.name + " » pour " + it.price + " SG ?")) return;
    busy = true;
    window.SamCloud.buyItem(it.id).then(function (d) {
      busy = false;
      data = d;
      if (it.css || it.fx) {
        equip(it);
        toast("Acheté et équipé ✓");
      } else {
        toast("Acheté ✓ Tu as maintenant " + d.ai_credits + " messages IA en plus.");
      }
      render();
    }).catch(function (e) {
      busy = false;
      toast(errText(e));
      refresh();
    });
  }

  /* ---------- ouverture / fermeture ---------- */

  function bgOf(el) {
    var c = getComputedStyle(el).backgroundColor;
    return c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent" ? c : "";
  }

  function hide() {
    if (page) page.hidden = true;
    document.body.classList.remove("no-scroll");
  }

  function closeShop() {
    if (history.state && history.state.screen === "shop") history.back();
    else hide();
  }

  function openShop() {
    if (!page) {
      page = document.createElement("div");
      page.id = "shop-page";
      page.hidden = true;
      page.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        if (b.id === "shop-back") { closeShop(); return; }
        var it = findItem(b.getAttribute("data-id"));
        var act = b.getAttribute("data-act");
        if (!it || !act) return;
        if (act === "buy") buy(it);
        else if (act === "equip") { equip(it); render(); toast("Équipé ✓"); }
        else if (act === "off") { unequip(it); render(); }
      });
      document.body.appendChild(page);
    }
    page.style.background = bgOf(document.body) || bgOf(document.documentElement) || "#ffffff";
    page.style.color = getComputedStyle(document.body).color;
    page.hidden = false;
    document.body.classList.add("no-scroll");
    if (!history.state || history.state.screen !== "shop") {
      history.pushState({ screen: "shop" }, "");
    }
    render();
    refresh();
  }

  window.addEventListener("popstate", function () {
    if (page && !page.hidden) hide();
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".sg-pill")) openShop();
  });

  window.SamShop = { open: openShop };

  applyFx();
  setTimeout(applyFx, 700);
  setTimeout(applyFx, 1800);
})();
