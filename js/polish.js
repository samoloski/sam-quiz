/* sam quiz : finitions (effet d'onde, icones des matieres, chiffres qui comptent, chargement) */
(function () {
  var reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. effet d'onde au toucher ---- */
  var SELECTOR =
    ".btn, .hub-chip, .subject-card, .mode-card, .level-card, .quiz-choice, " +
    ".stat-link, .install-btn, .ai-card, .quiz-close, .item-del";

  document.addEventListener(
    "pointerdown",
    function (e) {
      if (reduce) return;
      var el = e.target.closest(SELECTOR);
      if (!el || el.disabled) return;
      el.classList.add("ripple-host");
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var r = document.createElement("span");
      r.className = "ripple";
      r.style.width = size + "px";
      r.style.height = size + "px";
      r.style.left = e.clientX - rect.left - size / 2 + "px";
      r.style.top = e.clientY - rect.top - size / 2 + "px";
      el.appendChild(r);
      setTimeout(function () {
        if (r.parentNode) r.parentNode.removeChild(r);
      }, 650);
    },
    { passive: true }
  );

  /* ---- 2. icones des matieres ---- */
  var ICONS = [
    [/math/, "📐"],
    [/physique|chimie/, "⚗️"],
    [/svt|vie|terre/, "🧬"],
    [/fran/, "📖"],
    [/angl/, "🗣️"],
    [/hist|geo/, "🌍"]
  ];

  function norm(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function iconFor(name) {
    var n = norm(name);
    for (var i = 0; i < ICONS.length; i++) {
      if (ICONS[i][0].test(n)) return ICONS[i][1];
    }
    return "📘";
  }

  function decorate() {
    document.querySelectorAll("#home-list .subject-card").forEach(function (card) {
      if (card.querySelector(".subject-ico")) return;
      var nm = card.querySelector(".subject-name");
      var ico = document.createElement("span");
      ico.className = "subject-ico";
      ico.textContent = iconFor(nm ? nm.textContent : "");
      card.insertBefore(ico, card.firstChild);
    });
  }

  var list = document.getElementById("home-list");
  if (list) {
    new MutationObserver(decorate).observe(list, { childList: true, subtree: true });
    decorate();
  }

  /* ---- 3. total de SG qui compte jusqu'a sa valeur ---- */
  var pill = document.querySelector(".sg-pill");
  if (pill) {
    var shown = null;
    var token = 0;
    var selfChange = false;

    var write = function (v) {
      selfChange = true;
      pill.textContent = "⭐ " + v + " SG";
      Promise.resolve().then(function () { selfChange = false; });
    };

    var pillValue = function () {
      var m = /(\d+)/.exec(pill.textContent);
      return m ? parseInt(m[1], 10) : null;
    };

    var run = function (target) {
      var from = shown;
      var id = ++token;
      var t0 = null;
      write(from);
      var frame = function (now) {
        if (id !== token) return;
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / 700);
        var e = 1 - Math.pow(1 - p, 3);
        var v = Math.round(from + (target - from) * e);
        shown = v;
        write(v);
        if (p < 1) requestAnimationFrame(frame);
        else shown = target;
      };
      requestAnimationFrame(frame);
    };

    new MutationObserver(function () {
      if (selfChange) return;
      var target = pillValue();
      if (target === null) return;
      if (shown === null || reduce) {
        shown = target;
        return;
      }
      if (target === shown) return;
      run(target);
    }).observe(pill, { childList: true, characterData: true, subtree: true });

    shown = pillValue();
  }

  /* ---- 4. chiffres des tuiles (serie, rang, reussite) + chargement ---- */
  var slot = document.getElementById("hub-slot-top");
  if (slot) {
    var last = [];

    var animateTile = function (b, i) {
      var text = b.textContent;
      var m = /(\d+)/.exec(text);
      if (!m) {
        last[i] = undefined;
        return;
      }
      var prefix = text.slice(0, m.index);
      var suffix = text.slice(m.index + m[0].length);
      var target = parseInt(m[0], 10);
      var from = last[i] === undefined ? 0 : last[i];
      last[i] = target;
      if (reduce || from === target) return;

      var t0 = null;
      var frame = function (now) {
        if (!b.isConnected) return;
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / 800);
        var e = 1 - Math.pow(1 - p, 3);
        b.textContent = prefix + Math.round(from + (target - from) * e) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      };
      b.textContent = prefix + from + suffix;
      requestAnimationFrame(frame);
    };

    new MutationObserver(function () {
      var bs = slot.querySelectorAll(".stat-tile b");
      bs.forEach(animateTile);
    }).observe(slot, { childList: true });

    if (!slot.firstChild) {
      slot.innerHTML =
        '<div class="stat-tiles skeleton">' +
        '<div class="stat-tile"></div><div class="stat-tile"></div><div class="stat-tile"></div></div>';
      setTimeout(function () {
        var sk = slot.querySelector(".skeleton");
        if (sk && sk.parentNode) sk.parentNode.removeChild(sk);
      }, 8000);
    }
  }
})();
