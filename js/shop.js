/* sam quiz : boutique (on l'ouvre en touchant la pastille SG du haut) */
(function () {
  var LS_KEY = "samquiz:shop";
  var DEFAULT_BG = "linear-gradient(135deg,#1e3a8a,#3b82f6)";

  var BGS = [
    { id: "bg_ocean", name: "Océan", price: 300, rar: "common", css: "linear-gradient(135deg,#0ea5e9,#1d4ed8)" },
    { id: "bg_sunset", name: "Coucher de soleil", price: 300, rar: "common", css: "linear-gradient(135deg,#f97316,#db2777)" },
    { id: "bg_forest", name: "Forêt", price: 300, rar: "common", css: "linear-gradient(135deg,#16a34a,#065f46)" },
    { id: "bg_cherry", name: "Cerise", price: 300, rar: "common", css: "linear-gradient(135deg,#be123c,#fb7185)" },
    { id: "bg_aurora", name: "Aurore", price: 350, rar: "rare", css: "linear-gradient(135deg,#06b6d4,#7c3aed)" },
    { id: "bg_night", name: "Nuit étoilée", price: 400, rar: "rare", css: "linear-gradient(135deg,#4338ca,#0f172a)" },
    { id: "bg_lava", name: "Lave", price: 450, rar: "epic", css: "linear-gradient(135deg,#450a0a,#dc2626,#f97316)" },
    { id: "bg_galaxy", name: "Galaxie", price: 500, rar: "epic", css: "linear-gradient(135deg,#0f172a,#581c87,#be185d)" },
    { id: "bg_gold", name: "Or royal", price: 600, rar: "leg", css: "linear-gradient(135deg,#f59e0b,#b45309)" },
    { id: "bg_diamond", name: "Diamant", price: 900, rar: "leg", css: "linear-gradient(135deg,#0ea5e9,#8b5cf6,#d946ef)" }
  ];
  var FXS = [
    { id: "name_pulse", name: "Pulsation", price: 350, rar: "rare", fx: "pulse" },
    { id: "name_glow", name: "Lueur", price: 400, rar: "rare", fx: "glow" },
    { id: "name_neon", name: "Néon", price: 450, rar: "rare", fx: "neon" },
    { id: "name_rainbow", name: "Arc-en-ciel", price: 500, rar: "epic", fx: "rainbow" },
    { id: "name_fire", name: "Feu", price: 550, rar: "epic", fx: "fire" },
    { id: "name_gold", name: "Or pur", price: 700, rar: "leg", fx: "gold" }
  ];
  var EMS = [
    { id: "em_fire", name: "Flamme", price: 300, rar: "common", em: "🔥" },
    { id: "em_bolt", name: "Éclair", price: 300, rar: "common", em: "⚡" },
    { id: "em_brain", name: "Cerveau", price: 350, rar: "common", em: "🧠" },
    { id: "em_rocket", name: "Fusée", price: 400, rar: "rare", em: "🚀" },
    { id: "em_star", name: "Étoile", price: 450, rar: "rare", em: "🌟" },
    { id: "em_lion", name: "Lion", price: 500, rar: "rare", em: "🦁" },
    { id: "em_diamond", name: "Diamant", price: 600, rar: "epic", em: "💎" },
    { id: "em_crown", name: "Couronne", price: 800, rar: "leg", em: "👑" }
  ];
  var PACKS = [
    { id: "ai_5", name: "5 messages IA", n: 5, price: 150, rar: "common" },
    { id: "ai_20", name: "20 messages IA", n: 20, price: 500, rar: "rare" },
    { id: "ai_50", name: "50 messages IA", n: 50, price: 1000, rar: "leg", best: true }
  ];
  var RAR = { common: "Commun", rare: "Rare", epic: "Épique", leg: "Légendaire" };
  var FX_KEYS = ["glow", "rainbow", "neon", "fire", "gold", "pulse"];

  var css = [
    ".sg-pill{cursor:pointer}",
    "#shop-page{position:fixed;top:0;right:0;bottom:0;left:0;z-index:1800;overflow-y:auto;-webkit-overflow-scrolling:touch}",
    "#shop-page[hidden]{display:none}",
    ".shop-top{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff}",
    ".shop-top h2{margin:0;font-size:20px;color:#fff}",
    ".shop-back{background:rgba(255,255,255,.2);border:0;color:#fff;font-size:20px;width:38px;height:38px;border-radius:12px;cursor:pointer}",
    ".shop-hero{padding:18px 16px 22px;text-align:center;color:#fff;background:linear-gradient(160deg,#4c1d95,#1e1b4b);border-radius:0 0 26px 26px}",
    ".shop-bal-n{font-size:44px;font-weight:800;line-height:1.1;text-shadow:0 2px 14px rgba(251,191,36,.45)}",
    ".shop-bal-n span{display:inline-block;animation:shopSpin 3.2s ease-in-out infinite}",
    ".shop-bal-l{opacity:.85;margin-top:2px}",
    ".shop-goal{margin:14px auto 0;max-width:340px;font-size:14px}",
    ".shop-goal b{color:#fde68a}",
    ".shop-bar{height:8px;border-radius:99px;background:rgba(255,255,255,.2);margin-top:7px;overflow:hidden}",
    ".shop-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#fbbf24,#f59e0b);transition:width .6s}",
    ".shop-hero small{display:block;opacity:.7;margin-top:12px;font-size:12px}",
    ".shop-tabs{position:sticky;top:66px;z-index:2;display:flex;gap:8px;padding:12px 16px;overflow-x:auto;background:var(--shop-bg,#fff)}",
    ".shop-tab{flex:0 0 auto;border:0;padding:10px 16px;border-radius:999px;font-size:14px;font-weight:700;cursor:pointer;background:rgba(128,128,128,.18);color:inherit}",
    ".shop-tab.on{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 4px 12px rgba(79,70,229,.4)}",
    ".shop-body{padding:4px 16px 40px;max-width:560px;margin:0 auto}",
    ".shop-note{opacity:.75;font-size:14px;margin:4px 0 10px}",
    ".shop-prev{border-radius:20px;padding:22px 16px;text-align:center;color:#fff;margin:6px 0 4px;box-shadow:0 8px 22px rgba(0,0,0,.25)}",
    ".shop-prev-h{font-size:12px;letter-spacing:.3em;font-weight:700;opacity:.85}",
    ".shop-prev-e{font-size:32px;line-height:1.1;margin-top:4px}",
    ".shop-prev-n{font-size:34px;font-weight:800;margin:6px 0 2px;word-break:break-word}",
    ".shop-prev-s{font-size:13px;opacity:.9}",
    ".shop-prevlab{font-size:12px;opacity:.65;text-align:center;margin-bottom:12px}",
    ".shop-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
    ".shop-card{position:relative;overflow:hidden;padding:10px;border-radius:16px;background:rgba(128,128,128,.12);display:flex;flex-direction:column;gap:8px;border:2px solid transparent;cursor:pointer}",
    ".shop-card.sel{outline:3px solid rgba(124,58,237,.55)}",
    ".shop-card.r-common{border-color:#94a3b8}",
    ".shop-card.r-rare{border-color:#3b82f6}",
    ".shop-card.r-epic{border-color:#a855f7}",
    ".shop-card.r-leg{border-color:#f59e0b;box-shadow:0 0 16px rgba(245,158,11,.5)}",
    ".shop-card.r-leg::after{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-20deg);animation:shopShine 2.8s linear infinite;pointer-events:none}",
    ".shop-rar{position:absolute;top:6px;left:6px;z-index:2;font-size:10px;font-weight:800;padding:3px 8px;border-radius:99px;color:#fff;background:#64748b}",
    ".r-rare .shop-rar{background:#3b82f6}.r-epic .shop-rar{background:#a855f7}.r-leg .shop-rar{background:linear-gradient(135deg,#f59e0b,#ef4444)}",
    ".shop-mini{height:74px;border-radius:11px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:7px;color:#fff;font-weight:800;font-size:15px}",
    ".shop-fxbox{height:74px;border-radius:11px;background:#1e1b4b;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;padding:0 6px;overflow:hidden}",
    ".shop-name{font-weight:700;font-size:14px}",
    ".shop-prog{height:6px;border-radius:99px;background:rgba(128,128,128,.28);overflow:hidden}",
    ".shop-prog i{display:block;height:100%;background:linear-gradient(90deg,#a78bfa,#7c3aed);border-radius:99px}",
    ".shop-act{border:0;border-radius:12px;padding:11px 8px;font-size:14px;font-weight:800;cursor:pointer;width:100%}",
    ".shop-buy{color:#fff;background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 4px 12px rgba(16,185,129,.4)}",
    ".shop-lock{color:inherit;background:rgba(128,128,128,.22);font-weight:700}",
    ".shop-equip{color:#fff;background:linear-gradient(135deg,#4f46e5,#7c3aed)}",
    ".shop-off{color:inherit;background:transparent;border:2px solid rgba(124,58,237,.6)}",
    ".shop-pack{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;background:rgba(128,128,128,.12);border:2px solid #94a3b8;margin-bottom:12px}",
    ".shop-pack.r-rare{border-color:#3b82f6}",
    ".shop-pack.r-leg{border-color:#f59e0b;box-shadow:0 0 16px rgba(245,158,11,.5)}",
    ".shop-pack-n{font-size:34px;font-weight:800;min-width:74px;text-align:center}",
    ".shop-pack-c{flex:1}",
    ".shop-pack .shop-act{width:auto;min-width:104px}",
    ".shop-tag{display:inline-block;font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px;color:#fff;background:linear-gradient(135deg,#f59e0b,#ef4444);margin-left:6px}",
    ".shop-chip{display:inline-block;padding:6px 12px;border-radius:99px;background:rgba(124,58,237,.18);font-weight:700;font-size:14px;margin:4px 0 12px}",
    ".shop-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:2200;background:#111827;color:#fff;padding:10px 16px;border-radius:12px;font-size:14px;max-width:86%;text-align:center}",
    ".shop-confetti{position:fixed;top:0;right:0;bottom:0;left:0;z-index:2100;pointer-events:none;overflow:hidden}",
    ".shop-confetti i{position:absolute;top:-16px;width:9px;height:14px;border-radius:2px;animation:shopFall 2.3s ease-in forwards}",
    "@keyframes shopFall{to{transform:translateY(108vh) rotate(720deg)}}",
    "@keyframes shopShine{from{left:-60%}to{left:140%}}",
    "@keyframes shopSpin{0%,100%{transform:rotateY(0)}50%{transform:rotateY(180deg)}}",
    "@keyframes shopPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}",
    ".shop-fx{display:inline-block}",
    ".wl-name.fx-glow,.shop-fx.fx-glow{text-shadow:0 0 8px #fff,0 0 20px #a78bfa,0 0 34px #7c3aed !important}",
    ".wl-name.fx-rainbow,.shop-fx.fx-rainbow{background:linear-gradient(90deg,#ef4444,#f59e0b,#16a34a,#3b82f6,#a855f7) !important;-webkit-background-clip:text !important;background-clip:text !important;-webkit-text-fill-color:transparent !important;color:transparent !important}",
    ".wl-name.fx-neon,.shop-fx.fx-neon{background:none !important;-webkit-text-fill-color:#a5f3fc !important;color:#a5f3fc !important;text-shadow:0 0 6px #22d3ee,0 0 16px #06b6d4,0 0 30px #0891b2 !important}",
    ".wl-name.fx-fire,.shop-fx.fx-fire{background:linear-gradient(180deg,#fde047,#f97316,#dc2626) !important;-webkit-background-clip:text !important;background-clip:text !important;-webkit-text-fill-color:transparent !important;color:transparent !important;filter:drop-shadow(0 0 8px rgba(249,115,22,.7))}",
    ".wl-name.fx-gold,.shop-fx.fx-gold{background:linear-gradient(90deg,#fde68a,#f59e0b,#fef3c7,#d97706) !important;-webkit-background-clip:text !important;background-clip:text !important;-webkit-text-fill-color:transparent !important;color:transparent !important;filter:drop-shadow(0 0 6px rgba(245,158,11,.6))}",
    ".wl-name.fx-pulse,.shop-fx.fx-pulse{animation:shopPulse 1.6s ease-in-out infinite}"
  ].join("");
  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var page = null;
  var data = null;
  var err = "";
  var busy = false;
  var tab = "bg";
  var tryBg = null;
  var tryFx = null;
  var tryEm = null;
  var shownBal = 0;

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function local() {
    try {
      var v = JSON.parse(localStorage.getItem(LS_KEY));
      if (v && typeof v === "object") return { bg: v.bg || "", fx: v.fx || "", em: v.em || "" };
    } catch (e) {}
    return { bg: "", fx: "", em: "" };
  }
  function setLocal(v) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) {}
  }

  function myName() {
    var s = window.SamWelcome && window.SamWelcome.getStyle ? window.SamWelcome.getStyle() : null;
    if (s && s.name && String(s.name).trim()) return String(s.name).trim();
    try {
      var p = localStorage.getItem("samquiz:pseudo");
      if (p) return p;
    } catch (e) {}
    return "Toi";
  }

  function cssOf(id) {
    for (var i = 0; i < BGS.length; i++) if (BGS[i].id === id) return BGS[i].css;
    return "";
  }
  function emojiOf(id) {
    for (var i = 0; i < EMS.length; i++) if (EMS[i].id === id) return EMS[i].em;
    return "";
  }

  /* applique fx + emblème sur la carte Bienvenue */
  function applyLooks() {
    var name = document.querySelector(".wl-name");
    if (!name) return;
    var l = local();
    FX_KEYS.forEach(function (x) {
      name.classList.toggle("fx-" + x, l.fx === x);
    });
    var emoji = emojiOf(l.em);
    var el = document.getElementById("shop-emb");
    if (!emoji) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      return;
    }
    if (!el && name.parentNode) {
      el = document.createElement("div");
      el.id = "shop-emb";
      el.style.cssText = "text-align:center;font-size:30px;line-height:1.1;margin:2px 0";
      name.parentNode.insertBefore(el, name);
    }
    if (el) el.textContent = emoji;
  }

  function findItem(id) {
    var all = BGS.concat(FXS, EMS, PACKS);
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

  function confetti() {
    var colors = ["#4f46e5", "#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899"];
    var box = document.createElement("div");
    box.className = "shop-confetti";
    var html = "";
    for (var i = 0; i < 44; i++) {
      html += "<i style='left:" + Math.round(Math.random() * 100) + "%;background:" + colors[i % colors.length] +
        ";animation-delay:" + (Math.random() * 0.7).toFixed(2) + "s;animation-duration:" +
        (1.8 + Math.random() * 1.2).toFixed(2) + "s'></i>";
    }
    box.innerHTML = html;
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 3600);
    try { if (navigator.vibrate) navigator.vibrate([40, 30, 60]); } catch (e) {}
  }

  /* ---------- affichage ---------- */

  function isOwned(id) {
    return !!(data && data.owned && data.owned.indexOf(id) !== -1);
  }

  function actBtn(it, equipped) {
    var owned = isOwned(it.id);
    if (!owned) {
      if (data.balance >= it.price) {
        return "<button class='shop-act shop-buy' data-act='buy' data-id='" + it.id + "' type='button'>Acheter · " + it.price + " SG</button>";
      }
      var pct = Math.max(4, Math.min(100, Math.round((data.balance / it.price) * 100)));
      return "<div class='shop-prog'><i style='width:" + pct + "%'></i></div>" +
        "<button class='shop-act shop-lock' data-act='buy' data-id='" + it.id + "' type='button'>🔒 Il manque " +
        (it.price - data.balance) + " SG</button>";
    }
    if (equipped) {
      return "<button class='shop-act shop-off' data-act='off' data-id='" + it.id + "' type='button'>✓ Équipé · Retirer</button>";
    }
    return "<button class='shop-act shop-equip' data-act='equip' data-id='" + it.id + "' type='button'>Équiper</button>";
  }

  function nextGoal() {
    var best = null;
    BGS.concat(FXS, EMS).forEach(function (it) {
      if (!isOwned(it.id) && it.price > data.balance && (!best || it.price < best.price)) best = it;
    });
    if (best) {
      var pct = Math.max(3, Math.round((data.balance / best.price) * 100));
      return "<div class='shop-goal'>Encore <b>" + (best.price - data.balance) + " SG</b> pour « " + esc(best.name) + " »" +
        "<div class='shop-bar'><i style='width:" + pct + "%'></i></div></div>";
    }
    var can = 0;
    BGS.concat(FXS, EMS).forEach(function (it) {
      if (!isOwned(it.id) && data.balance >= it.price) can++;
    });
    return "<div class='shop-goal'>" + (can ? "🎉 Tu peux acheter <b>" + can + " objet" + (can > 1 ? "s" : "") + "</b> !" : "Tu as tout acheté, bravo ! 👑") + "</div>";
  }

  function bigPreview(bgCss, fxKey, emoji) {
    return "<div class='shop-prev' style='background:" + (bgCss || DEFAULT_BG) + "'>" +
      "<div class='shop-prev-h'>BIENVENUE</div>" +
      (emoji ? "<div class='shop-prev-e'>" + emoji + "</div>" : "") +
      "<div class='shop-prev-n'><span class='shop-fx" + (fxKey ? " fx-" + fxKey : "") + "'>" + esc(myName()) + "</span></div>" +
      "<div class='shop-prev-s'>Prêt à réviser ?</div></div>" +
      "<div class='shop-prevlab'>Aperçu : touche un objet pour l'essayer</div>";
  }

  function tabBg() {
    var l = local();
    var cur = tryBg || l.bg;
    var html = bigPreview(cssOf(cur), l.fx, emojiOf(l.em)) + "<div class='shop-grid'>";
    BGS.forEach(function (it) {
      html += "<div class='shop-card r-" + it.rar + (cur === it.id ? " sel" : "") + "' data-try='" + it.id + "'>" +
        "<span class='shop-rar'>" + RAR[it.rar] + "</span>" +
        "<div class='shop-mini' style='background:" + it.css + "'>" + esc(it.name) + "</div>" +
        actBtn(it, l.bg === it.id) + "</div>";
    });
    return html + "</div>";
  }

  function tabFx() {
    var l = local();
    var cur = tryFx !== null ? tryFx : l.fx;
    var html = bigPreview(cssOf(l.bg), cur, emojiOf(l.em)) + "<div class='shop-grid'>";
    FXS.forEach(function (it) {
      html += "<div class='shop-card r-" + it.rar + (cur === it.fx ? " sel" : "") + "' data-tryfx='" + it.fx + "'>" +
        "<span class='shop-rar'>" + RAR[it.rar] + "</span>" +
        "<div class='shop-fxbox'><span class='shop-fx fx-" + it.fx + "'>" + esc(myName()) + "</span></div>" +
        "<div class='shop-name'>" + esc(it.name) + "</div>" +
        actBtn(it, l.fx === it.fx) + "</div>";
    });
    return html + "</div>";
  }

  function tabEm() {
    var l = local();
    var cur = tryEm !== null ? tryEm : l.em;
    var html = bigPreview(cssOf(l.bg), l.fx, emojiOf(cur)) + "<div class='shop-grid'>";
    EMS.forEach(function (it) {
      html += "<div class='shop-card r-" + it.rar + (cur === it.id ? " sel" : "") + "' data-tryem='" + it.id + "'>" +
        "<span class='shop-rar'>" + RAR[it.rar] + "</span>" +
        "<div class='shop-fxbox' style='font-size:38px'>" + it.em + "</div>" +
        "<div class='shop-name'>" + esc(it.name) + "</div>" +
        actBtn(it, l.em === it.id) + "</div>";
    });
    return html + "</div>";
  }

  function tabAi() {
    var html = "<div class='shop-chip'>🤖 Tu as " + data.ai_credits + " message" + (data.ai_credits > 1 ? "s" : "") + " en plus</div>" +
      "<p class='shop-note'>Quand tu as utilisé tes messages du jour avec Samoloski AI, ceux-ci prennent le relais.</p>";
    PACKS.forEach(function (it) {
      var affordable = data.balance >= it.price;
      var btn = affordable
        ? "<button class='shop-act shop-buy' data-act='buy' data-id='" + it.id + "' type='button'>" + it.price + " SG</button>"
        : "<button class='shop-act shop-lock' data-act='buy' data-id='" + it.id + "' type='button'>🔒 " + it.price + " SG</button>";
      html += "<div class='shop-pack r-" + it.rar + "'>" +
        "<div class='shop-pack-n'>+" + it.n + "</div>" +
        "<div class='shop-pack-c'><div class='shop-name'>" + it.name + (it.best ? "<span class='shop-tag'>MEILLEUR PRIX</span>" : "") + "</div>" +
        "<div class='shop-note' style='margin:2px 0 0'>" + Math.round(it.price / it.n) + " SG par message</div></div>" + btn + "</div>";
    });
    return html;
  }

  function render() {
    if (!page) return;
    var head =
      "<div class='shop-top'><button class='shop-back' id='shop-back' type='button'>←</button><h2>🛍️ Boutique</h2></div>";

    if (err === "offline") {
      page.innerHTML = head + "<div class='shop-body'><p class='shop-note'>La boutique demande une connexion internet. Vérifie ta connexion puis rouvre-la.</p></div>";
      return;
    }
    if (err === "noprofile") {
      page.innerHTML = head + "<div class='shop-body'><p class='shop-note'>Crée d'abord ton pseudo (au classement) et gagne tes premiers SG pour ouvrir la boutique.</p></div>";
      return;
    }
    if (!data) {
      page.innerHTML = head + "<div class='shop-body'><p class='shop-note'>Chargement…</p></div>";
      return;
    }

    function tabBtn(k, label) {
      return "<button class='shop-tab" + (tab === k ? " on" : "") + "' data-tab='" + k + "' type='button'>" + label + "</button>";
    }
    var body = tab === "bg" ? tabBg() : tab === "fx" ? tabFx() : tab === "em" ? tabEm() : tabAi();

    page.innerHTML = head +
      "<div class='shop-hero'><div class='shop-bal-n'><span>⭐</span> <b id='shop-bal'>" + shownBal + "</b> SG</div>" +
      "<div class='shop-bal-l'>à dépenser</div>" + nextGoal() +
      "<small>Total gagné : " + data.sg + " SG · tes achats ne baissent jamais ton classement</small></div>" +
      "<div class='shop-tabs'>" + tabBtn("bg", "🎨 Fonds") + tabBtn("fx", "✨ Effets") +
      tabBtn("em", "👑 Emblèmes") + tabBtn("ai", "🤖 Messages IA") + "</div>" +
      "<div class='shop-body'>" + body + "</div>";
    countUp();
  }

  function countUp() {
    var el = document.getElementById("shop-bal");
    if (!el || !data) return;
    var from = shownBal;
    var to = data.balance;
    if (from === to) { el.textContent = to; return; }
    var t0 = Date.now();
    var dur = 700;
    function step() {
      var k = Math.min(1, (Date.now() - t0) / dur);
      var v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      var e2 = document.getElementById("shop-bal");
      if (e2) e2.textContent = v;
      if (k < 1) requestAnimationFrame(step);
    }
    shownBal = to;
    requestAnimationFrame(step);
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
    } else if (it.em) {
      l.em = it.id;
    }
    setLocal(l);
    applyLooks();
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
    } else if (it.em) {
      l.em = "";
    }
    setLocal(l);
    applyLooks();
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
      confetti();
      if (it.css || it.fx || it.em) {
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
        if (b) {
          if (b.id === "shop-back") { closeShop(); return; }
          var tb = b.getAttribute("data-tab");
          if (tb) { tab = tb; render(); return; }
          var it = findItem(b.getAttribute("data-id"));
          var act = b.getAttribute("data-act");
          if (!it || !act) return;
          if (act === "buy") buy(it);
          else if (act === "equip") { equip(it); render(); toast("Équipé ✓"); }
          else if (act === "off") { unequip(it); render(); }
          return;
        }
        var card = e.target.closest("[data-try],[data-tryfx],[data-tryem]");
        if (card) {
          if (card.hasAttribute("data-try")) tryBg = card.getAttribute("data-try");
          else if (card.hasAttribute("data-tryfx")) tryFx = card.getAttribute("data-tryfx");
          else tryEm = card.getAttribute("data-tryem");
          render();
        }
      });
      document.body.appendChild(page);
    }
    var bg = bgOf(document.body) || bgOf(document.documentElement) || "#ffffff";
    page.style.background = bg;
    page.style.setProperty("--shop-bg", bg);
    page.style.color = getComputedStyle(document.body).color;
    page.hidden = false;
    document.body.classList.add("no-scroll");
    if (!history.state || history.state.screen !== "shop") {
      history.pushState({ screen: "shop" }, "");
    }
    tryBg = null;
    tryFx = null;
    tryEm = null;
    shownBal = 0;
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

  applyLooks();
  setTimeout(applyLooks, 700);
  setTimeout(applyLooks, 1800);
})();
