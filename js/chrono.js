/* sam quiz : chrono et anti-triche pour le quiz illimité (même principe que les niveaux) */
(function () {
  var level = 2;
  var timer = null;
  var deadline = 0;
  var secs = 0;
  var curBody = null;
  var away = false;
  var leaves = 0;
  var lastShown = -1;

  var st = document.createElement("style");
  st.textContent =
    ".ct-timer{display:flex;align-items:center;gap:10px;margin:0 0 14px}" +
    ".ct-track{flex:1;height:10px;border-radius:99px;background:rgba(127,127,127,.25);overflow:hidden}" +
    ".ct-bar{height:100%;width:100%;border-radius:99px;background:#2563eb;transition:background .2s}" +
    ".ct-timer.low .ct-bar{background:#dc2626}" +
    ".ct-num{min-width:46px;text-align:right;font-weight:800;font-size:1rem}" +
    ".ct-timer.low .ct-num{color:#dc2626}" +
    ".ct-warn{margin:0 0 14px;padding:12px 14px;border-radius:12px;background:#fef3c7;color:#92400e;font-weight:700;font-size:.9rem}";
  document.head.appendChild(st);

  function secondsFor(l) {
    if (l === 1) return 30;
    if (l === 2) return 40;
    return 50;
  }

  /* retient le niveau choisi dans les réglages du quiz illimité */
  document.addEventListener(
    "click",
    function (e) {
      var b = e.target.closest && e.target.closest("[data-level]");
      if (!b) return;
      var v = parseInt(b.getAttribute("data-level"), 10);
      if (v > 0) level = v;
    },
    true
  );

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  /* la question à l'écran, si elle n'est pas encore répondue */
  function activeBody() {
    var q = document.querySelector(".inf-q");
    if (!q) return null;
    var body = q.closest(".inf-body");
    if (!body || body.querySelector(".inf-expl")) return null;
    return body.querySelector("[data-pick]") ? body : null;
  }

  function forceWrong(why) {
    var body = curBody;
    stopTimer();
    if (!body || !document.body.contains(body)) return;
    var f = document.createElement("button");
    f.type = "button";
    f.hidden = true;
    f.setAttribute("data-pick", "99");
    body.appendChild(f);
    f.click();
    var s = document.querySelector(".inf-expl strong");
    if (s) s.textContent = why === "leave" ? "🚫 Tu as quitté l'écran du quiz" : "⏱ Temps écoulé";
  }

  function tick() {
    if (!curBody || !document.body.contains(curBody)) {
      stopTimer();
      return;
    }
    var left = Math.max(0, deadline - Date.now());
    var s = Math.ceil(left / 1000);
    var bar = curBody.querySelector(".ct-bar");
    var num = curBody.querySelector(".ct-num");
    var box = curBody.querySelector(".ct-timer");
    if (bar) bar.style.width = Math.round((left / (secs * 1000)) * 100) + "%";
    if (num && s !== lastShown) {
      num.textContent = s + " s";
      lastShown = s;
    }
    if (box) box.classList.toggle("low", s <= 5);
    if (left <= 0) forceWrong("time");
  }

  function startFor(body) {
    stopTimer();
    curBody = body;
    secs = secondsFor(level);
    lastShown = -1;
    var count = body.querySelector(".inf-count");
    if (count && /\b1\s*$/.test(count.textContent || "")) leaves = 0;
    body.insertAdjacentHTML(
      "afterbegin",
      '<div class="ct-timer"><div class="ct-track"><div class="ct-bar"></div></div><span class="ct-num">' + secs + " s</span></div>"
    );
    deadline = Date.now() + secs * 1000;
    tick();
    timer = setInterval(tick, 200);
  }

  new MutationObserver(function () {
    var body = activeBody();
    if (body && body !== curBody) startFor(body);
    else if (!body && curBody) {
      stopTimer();
      curBody = null;
    }
  }).observe(document.body, { childList: true, subtree: true });

  /* sortie de l'écran du quiz */
  document.addEventListener("visibilitychange", function () {
    if (!curBody || !document.body.contains(curBody)) return;
    if (document.hidden) {
      away = true;
      return;
    }
    if (!away) {
      tick();
      return;
    }
    away = false;
    leaves += 1;
    if (leaves === 1) {
      if (!curBody.querySelector(".ct-warn")) {
        var t = curBody.querySelector(".ct-timer");
        var w = document.createElement("div");
        w.className = "ct-warn";
        w.textContent = "⚠️ Reste sur l'écran du quiz. La prochaine sortie comptera la question comme fausse.";
        if (t && t.nextSibling) t.parentNode.insertBefore(w, t.nextSibling);
        else curBody.appendChild(w);
      }
      tick();
    } else {
      forceWrong("leave");
    }
  });
})();
