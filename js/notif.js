/* sam quiz : notifications (bouton dans la fenetre de personnalisation du profil) */
(function () {
  var VAPID_PUBLIC = "BPNh5btfIx-T2nsrxMkefLJ7LtgLbAtYGIieLBfUFn6HRwHaXcI_vPSVNjyhMmWwaOJflnFENtNyqVc4IaXIpsQ";
  var SYNC_KEY = "samquiz:push-sync";
  var supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  var busy = false;

  function toBytes(b64) {
    var s = b64.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  var block = document.createElement("div");
  block.innerHTML =
    "<div class='wl-lbl'>Notifications</div>" +
    "<div style='display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px'>" +
    "<span id='nf-text' style='flex:1;min-width:160px;font-size:14px'></span>" +
    "<button type='button' class='btn btn-secondary' id='nf-btn'>…</button></div>";

  function mount() {
    if (block.parentNode) return true;
    var row = document.querySelector(".wl-panel [data-g=font]");
    if (!row || !row.parentNode) return false;
    row.parentNode.insertBefore(block, row.nextSibling);
    return true;
  }

  function setText(text) {
    var t = document.getElementById("nf-text");
    if (t) t.textContent = text;
  }

  async function currentSub() {
    try {
      var reg = await navigator.serviceWorker.ready;
      return await reg.pushManager.getSubscription();
    } catch (e) {
      return null;
    }
  }

  async function refresh() {
    var b = document.getElementById("nf-btn");
    if (!b) return;
    if (!supported) {
      setText("Non disponible sur ce navigateur.");
      b.hidden = true;
      return;
    }
    if (Notification.permission === "denied") {
      setText("🚫 Bloquées. Réactive-les dans les réglages du site (le cadenas à côté de l'adresse).");
      b.hidden = true;
      return;
    }
    var sub = await currentSub();
    var on = Notification.permission === "granted" && !!sub;
    setText(on
      ? "🔔 Activées : défi du jour, série, classement et annonces."
      : "🔕 Désactivées. Active-les pour ne rien rater.");
    b.textContent = on ? "Désactiver" : "Activer";
    b.setAttribute("data-on", on ? "1" : "");
    b.hidden = false;
  }

  async function enable() {
    var perm = await Notification.requestPermission();
    if (perm !== "granted") return refresh();
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toBytes(VAPID_PUBLIC)
      });
    }
    await window.SamCloud.savePushSub(sub.endpoint);
    try { localStorage.setItem(SYNC_KEY, String(Date.now())); } catch (e) {}
    await refresh();
    setText("🔔 Activées ! Tu recevras le défi du jour, ta série, le classement et les annonces.");
  }

  async function disable() {
    var sub = await currentSub();
    if (sub) {
      try { await window.SamCloud.dropPushSub(sub.endpoint); } catch (e) {}
      try { await sub.unsubscribe(); } catch (e) {}
    }
    await refresh();
  }

  block.addEventListener("click", function (e) {
    var b = e.target.closest("#nf-btn");
    if (!b || busy) return;
    busy = true;
    b.disabled = true;
    var job = b.getAttribute("data-on") ? disable() : enable();
    job.catch(function (err) {
      var m = String((err && err.message) || "");
      setText(/profil/i.test(m)
        ? "Crée d'abord ton pseudo (au classement), puis réessaie."
        : "Impossible d'activer pour le moment. Réessaie plus tard.");
    }).then(function () {
      busy = false;
      b.disabled = false;
    });
  });

  /* garde l'abonnement a jour dans la base (une fois par jour) */
  async function sync() {
    if (!supported || Notification.permission !== "granted" || !window.SamCloud) return;
    var last = 0;
    try { last = +localStorage.getItem(SYNC_KEY) || 0; } catch (e) {}
    if (Date.now() - last < 86400000) return;
    var sub = await currentSub();
    if (!sub) return;
    try {
      await window.SamCloud.savePushSub(sub.endpoint);
      localStorage.setItem(SYNC_KEY, String(Date.now()));
    } catch (e) {}
  }

  function init() {
    if (mount()) refresh();
  }
  init();
  setTimeout(init, 600);
  setTimeout(init, 1800);
  setTimeout(sync, 4000);

  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".wl-card")) setTimeout(init, 150);
  });
})();
