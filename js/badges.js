/* sam quiz : badges SG et scenes animees de deblocage */
(function () {
  var KEY = "samquiz:badges:v1";
  var BADGES = [
    { id: "b1", sg: 1000, name: "Étincelle", icon: "✨", c1: "#f59e0b", c2: "#ef4444", fx: "embers", tag: "Ton premier pas vers les sommets." },
    { id: "b2", sg: 2500, name: "Explorateur", icon: "🧭", c1: "#06b6d4", c2: "#6366f1", fx: "confetti", tag: "Tu avances en terrain inconnu." },
    { id: "b3", sg: 5000, name: "Stratège", icon: "♟️", c1: "#8b5cf6", c2: "#ec4899", fx: "stars", tag: "Chaque réponse est un coup bien joué." },
    { id: "b4", sg: 10000, name: "Expert", icon: "🎓", c1: "#10b981", c2: "#0ea5e9", fx: "fireworks", tag: "Peu de gens vont aussi loin." },
    { id: "b5", sg: 20000, name: "Maître", icon: "⚡", c1: "#facc15", c2: "#f97316", fx: "lightning", tag: "Ta rapidité fait trembler le classement." },
    { id: "b6", sg: 35000, name: "Légende", icon: "👑", c1: "#fbbf24", c2: "#b45309", fx: "legend", tag: "Ton nom restera dans la mémoire du jeu." },
    { id: "b7", sg: 50000, name: "Samoloski Suprême", icon: "🌌", c1: "#a78bfa", c2: "#22d3ee", fx: "nova", tag: "Tu as atteint le sommet de l'univers." }
  ];
  var COLORS = {
    embers: ["#fbbf24", "#f97316", "#ef4444", "#fde68a"],
    confetti: ["#f43f5e", "#22d3ee", "#facc15", "#a78bfa", "#34d399", "#fb923c"],
    stars: ["#ffffff", "#fde68a", "#c4b5fd", "#f0abfc"],
    fireworks: ["#34d399", "#38bdf8", "#facc15", "#f472b6", "#ffffff"],
    lightning: ["#fef08a", "#ffffff", "#fdba74"],
    legend: ["#fde68a", "#fbbf24", "#f59e0b", "#ffffff"],
    nova: ["#a78bfa", "#22d3ee", "#f472b6", "#ffffff", "#facc15"]
  };

  var cloudSG = 0;
  var scene = null;
  var stopFx = null;
  var timer = null;

  function esc(t) {
    var d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }
  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(d) ? d : [];
    } catch (e) {
      return [];
    }
  }
  function save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {}
  }
  function currentSG() {
    var local = 0;
    try {
      if (window.SamProgress) local = window.SamProgress.getSG() || 0;
    } catch (e) {}
    return Math.max(local, cloudSG);
  }
  function nextLocked(got) {
    for (var i = 0; i < BADGES.length; i++) {
      if (got.indexOf(BADGES[i].id) === -1) return BADGES[i];
    }
    return null;
  }
  function badgeAfter(b) {
    for (var i = 0; i < BADGES.length; i++) {
      if (BADGES[i].sg > b.sg) return BADGES[i];
    }
    return null;
  }

  /* ---------- moteur de particules ---------- */
  function drawStar(ctx, x, y, r, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.45 : r;
      var a = (i * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function startFx(canvas, type, colors) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cx = w / 2;
    var cy = h * 0.38;
    var parts = [];
    var bolts = [];
    var flash = 0;
    var st = {};
    var t0 = performance.now();
    var last = t0;
    var raf = 0;
    var alive = true;

    function add(o) {
      if (parts.length > 800) return;
      var p = { x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 1, age: 0, life: 80, size: 3, color: "#fff", shape: "c", rot: 0, vr: 0, grow: 0, fade: true, die: null };
      for (var k in o) p[k] = o[k];
      parts.push(p);
    }
    function burst(x, y, n, speed, cols, o) {
      o = o || {};
      var sz = o.sz || [1.5, 3.5];
      var lf = o.lf || [50, 95];
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2;
        var s = speed * rnd(0.25, 1);
        add({
          x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          g: o.g == null ? 0.06 : o.g, drag: o.drag || 0.985,
          life: rnd(lf[0], lf[1]), size: rnd(sz[0], sz[1]),
          color: pick(cols), shape: o.shape || "c", vr: o.vr || 0
        });
      }
    }
    function once(k, t, at) {
      if (st[k] || t < at) return false;
      st[k] = 1;
      return true;
    }
    function every(k, now, gap) {
      if (!st[k]) st[k] = now;
      if (now - st[k] >= gap) {
        st[k] = now;
        return true;
      }
      return false;
    }

    var FX = {
      embers: function (t, now, dt) {
        if (once("o1", t, 350)) {
          burst(cx, cy, 70, 6, colors, { g: 0.02, lf: [60, 110] });
          flash = 0.5;
        }
        for (var i = 0; i < 2 * dt; i++) {
          add({ x: rnd(0, w), y: h + 8, vx: rnd(-0.6, 0.6), vy: -rnd(1.2, 3.6), g: -0.004, drag: 0.998, life: rnd(110, 200), size: rnd(1.5, 4), color: pick(colors) });
        }
      },
      confetti: function (t, now) {
        if (once("c1", t, 250)) {
          for (var i = 0; i < 70; i++) {
            add({ x: 0, y: h, vx: rnd(4, 11), vy: -rnd(9, 17), g: 0.22, drag: 0.99, life: rnd(110, 170), size: rnd(4, 8), color: pick(colors), shape: "k", rot: rnd(0, 6), vr: rnd(-0.3, 0.3) });
            add({ x: w, y: h, vx: -rnd(4, 11), vy: -rnd(9, 17), g: 0.22, drag: 0.99, life: rnd(110, 170), size: rnd(4, 8), color: pick(colors), shape: "k", rot: rnd(0, 6), vr: rnd(-0.3, 0.3) });
          }
          flash = 0.3;
        }
        if (t > 900 && every("c2", now, 45)) {
          for (var j = 0; j < 2; j++) {
            add({ x: rnd(0, w), y: -10, vx: rnd(-1, 1), vy: rnd(2, 4.5), g: 0.01, life: 220, size: rnd(4, 7), color: pick(colors), shape: "k", rot: rnd(0, 6), vr: rnd(-0.2, 0.2), fade: false });
          }
        }
      },
      stars: function (t, now) {
        if (once("s1", t, 300)) {
          burst(cx, cy, 50, 7, colors, { shape: "s", sz: [4, 9], g: 0.03, lf: [70, 120], vr: 0.1 });
          flash = 0.4;
        }
        if (every("s2", now, 90)) {
          add({ x: rnd(0, w), y: -12, vx: rnd(-0.5, 0.5), vy: rnd(1.5, 3.5), life: 260, size: rnd(3, 8), color: pick(colors), shape: "s", vr: rnd(-0.05, 0.05), fade: false });
        }
        if (every("s3", now, 700)) {
          add({ x: rnd(w * 0.4, w + 40), y: rnd(-20, h * 0.3), vx: -rnd(9, 13), vy: rnd(5, 8), life: 40, size: 2, color: "#ffffff", shape: "l" });
        }
      },
      fireworks: function (t, now) {
        if (once("f0", t, 350)) {
          burst(cx, cy, 80, 7, colors, { g: 0.05, lf: [60, 110] });
          flash = 0.5;
        }
        if (t > 500 && every("f1", now, 520)) {
          var tx = rnd(w * 0.15, w * 0.85);
          var col = pick(colors);
          add({
            x: rnd(w * 0.3, w * 0.7), y: h + 5, vx: (tx - w / 2) / 60, vy: -rnd(11, 14), g: 0.18,
            life: 60, size: 3, color: "#ffffff", shape: "r", fade: false,
            die: function () {
              burst(this.x, this.y, 60, rnd(4, 7), [col, "#ffffff", pick(colors)], { g: 0.07 });
              flash = 0.18;
            }
          });
        }
      },
      lightning: function (t, now) {
        if (once("l0", t, 300)) flash = 0.5;
        if (t > 300 && every("l1", now, 650)) {
          var x = rnd(w * 0.15, w * 0.85);
          var limit = h * rnd(0.45, 0.7);
          var y = 0;
          var pts = [{ x: x, y: 0 }];
          while (y < limit) {
            y += rnd(25, 55);
            x += rnd(-35, 35);
            pts.push({ x: x, y: y });
          }
          bolts.push({ pts: pts, age: 0, life: 14 });
          flash = 0.75;
          burst(x, y, 30, 6, colors, { g: 0.1 });
        }
        if (every("l2", now, 40)) {
          add({ x: rnd(0, w), y: h + 5, vx: rnd(-0.5, 0.5), vy: -rnd(2, 5), life: 90, size: rnd(1.5, 3), color: pick(colors) });
        }
      },
      legend: function (t, now) {
        if (once("g1", t, 300)) {
          burst(cx, cy, 90, 7, colors, { g: 0.02, lf: [70, 120] });
          flash = 0.6;
        }
        if (every("g2", now, 330)) add({ x: cx, y: cy, shape: "o", size: 20, grow: 5, life: 60, color: pick(colors) });
        var a = t * 0.012;
        add({ x: cx, y: cy, vx: Math.cos(a) * 2.4, vy: Math.sin(a) * 2.4, drag: 0.992, life: 110, size: rnd(1.5, 3.2), color: pick(colors) });
        add({ x: cx, y: cy, vx: Math.cos(a + Math.PI) * 2.4, vy: Math.sin(a + Math.PI) * 2.4, drag: 0.992, life: 110, size: rnd(1.5, 3.2), color: pick(colors) });
      },
      nova: function (t, now) {
        if (once("n1", t, 300)) {
          burst(cx, cy, 220, 13, colors, { g: 0.01, drag: 0.99, lf: [80, 140], sz: [1.5, 4] });
          flash = 1;
        }
        if (once("n2", t, 1100)) {
          burst(cx, cy, 120, 9, colors, { shape: "s", sz: [4, 9], g: 0.02, lf: [90, 150] });
          flash = 0.5;
        }
        if (every("n3", now, 260)) add({ x: cx, y: cy, shape: "o", size: 10, grow: 7, life: 70, color: pick(colors) });
        if (every("n4", now, 70)) {
          add({ x: rnd(0, w), y: -10, vx: rnd(-0.6, 0.6), vy: rnd(2, 4), life: 240, size: rnd(3, 7), color: pick(colors), shape: "s", vr: rnd(-0.06, 0.06), fade: false });
        }
      }
    };

    function frame(now) {
      if (!alive) return;
      var dt = Math.min(2.5, (now - last) / 16.667);
      last = now;
      var t = now - t0;
      (FX[type] || FX.embers)(t, now, dt);

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      if (flash > 0.01) {
        ctx.fillStyle = "rgba(255,255,255," + flash.toFixed(3) + ")";
        ctx.fillRect(0, 0, w, h);
        flash *= Math.pow(0.9, dt);
      }

      ctx.globalCompositeOperation = "lighter";
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.age += dt;
        if (p.age >= p.life) {
          if (p.die) p.die();
          parts.splice(i, 1);
          continue;
        }
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        var d = Math.pow(p.drag, dt);
        p.vx *= d;
        p.vy *= d;
        p.rot += p.vr * dt;
        p.size += p.grow * dt;

        var rem = 1 - p.age / p.life;
        ctx.globalAlpha = Math.max(0, p.fade === false ? Math.min(1, rem * 6) : rem);

        if (p.shape === "o") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0, p.size), 0, 6.2832);
          ctx.stroke();
        } else if (p.shape === "k") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
          ctx.restore();
        } else if (p.shape === "s") {
          drawStar(ctx, p.x, p.y, p.size, p.rot, p.color);
        } else if (p.shape === "l") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
          ctx.stroke();
        } else if (p.shape === "r") {
          ctx.strokeStyle = "#fde68a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, 6.2832);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      for (var j = bolts.length - 1; j >= 0; j--) {
        var b = bolts[j];
        b.age += dt;
        if (b.age >= b.life) {
          bolts.splice(j, 1);
          continue;
        }
        ctx.strokeStyle = "rgba(255,247,170," + (1 - b.age / b.life).toFixed(3) + ")";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#fde047";
        ctx.beginPath();
        for (var k = 0; k < b.pts.length; k++) {
          if (k === 0) ctx.moveTo(b.pts[k].x, b.pts[k].y);
          else ctx.lineTo(b.pts[k].x, b.pts[k].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return function () {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }

  /* ---------- scene de deblocage ---------- */
  function closeScene() {
    if (!scene) return;
    var el = scene;
    scene = null;
    if (stopFx) stopFx();
    stopFx = null;
    el.classList.add("out");
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 320);
    updateEntry();
    if (!screen.hidden) renderScreen();
  }

  function play(b, mode) {
    if (scene) closeScene();
    var nb = badgeAfter(b);
    var sg = currentSG();
    var teaser = nb
      ? "Prochain badge : " + nb.icon + " " + esc(nb.name) + " à " + fmt(nb.sg) + " SG" +
        (mode !== "preview" && sg < nb.sg ? " · encore " + fmt(nb.sg - sg) + " SG" : "")
      : "Tu as débloqué tous les badges. Légende vivante !";

    var el = document.createElement("div");
    el.className = "bd-scene";
    el.style.setProperty("--c1", b.c1);
    el.style.setProperty("--c2", b.c2);
    el.innerHTML =
      "<canvas class='bd-canvas'></canvas>" +
      "<div class='bd-rays'></div>" +
      "<div class='bd-center'><div class='bd-ring'></div><div class='bd-ring r2'></div>" +
      "<div class='bd-medal'><span>" + b.icon + "</span></div></div>" +
      "<div class='bd-text'>" +
      "<p class='bd-kicker'>" + (mode === "preview" ? "Aperçu du badge" : "Badge débloqué") + "</p>" +
      "<h2 class='bd-name'>" + esc(b.name) + "</h2>" +
      "<p class='bd-sgline'>" + fmt(b.sg) + " SG</p>" +
      "<p class='bd-tag'>" + esc(b.tag) + "</p>" +
      "<p class='bd-next'>" + teaser + "</p>" +
      "<button type='button' class='bd-go'>Continuer</button></div>";
    document.body.appendChild(el);
    scene = el;

    stopFx = startFx(el.querySelector(".bd-canvas"), b.fx, COLORS[b.fx] || COLORS.embers);
    try {
      if (navigator.vibrate) navigator.vibrate([80, 50, 80, 50, 220]);
    } catch (e) {}
    setTimeout(function () {
      if (el.parentNode) el.classList.add("ready");
    }, 2300);
    el.querySelector(".bd-go").addEventListener("click", closeScene);
  }

  /* ---------- verification des seuils ---------- */
  function check(delay) {
    clearTimeout(timer);
    timer = setTimeout(doCheck, delay || 0);
  }

  function doCheck() {
    if (scene) {
      check(1500);
      return;
    }
    var sg = currentSG();
    var got = load();
    var fresh = [];
    BADGES.forEach(function (b) {
      if (sg >= b.sg && got.indexOf(b.id) === -1) fresh.push(b);
    });
    if (!fresh.length) {
      updateEntry();
      return;
    }
    fresh.forEach(function (b) { got.push(b.id); });
    save(got);
    updateEntry();
    play(fresh[fresh.length - 1], "new");
  }

  /* ---------- carte sur l'accueil ---------- */
  var home = document.getElementById("screen-home");
  var list = document.getElementById("home-list");
  var entry = null;

  if (home && list) {
    entry = document.createElement("button");
    entry.type = "button";
    entry.className = "bd-entry";
    entry.innerHTML =
      "<span class='bd-entry-ico'>🏅</span>" +
      "<span class='bd-entry-txt'><strong>Mes badges</strong><span class='bd-entry-sub'></span>" +
      "<span class='bd-entry-bar'><i></i></span></span>" +
      "<span class='bd-entry-count'></span>";
    var inf = home.querySelector(".inf-entry");
    if (inf && inf.parentNode === home) home.insertBefore(entry, inf.nextSibling);
    else home.insertBefore(entry, list);
    entry.addEventListener("click", openScreen);
  }

  function updateEntry() {
    if (!entry) return;
    var got = load();
    var sg = currentSG();
    var nb = nextLocked(got);
    var sub;
    var pct;
    if (nb) {
      sub = "Prochain : " + nb.icon + " " + nb.name + " · " + fmt(Math.min(sg, nb.sg)) + " / " + fmt(nb.sg) + " SG";
      pct = Math.min(100, Math.round((sg / nb.sg) * 100));
    } else {
      sub = "Tous les badges sont débloqués 👑";
      pct = 100;
    }
    entry.querySelector(".bd-entry-sub").textContent = sub;
    entry.querySelector(".bd-entry-bar i").style.width = pct + "%";
    entry.querySelector(".bd-entry-count").textContent = got.length + "/" + BADGES.length;
  }

  /* ---------- ecran des badges ---------- */
  var screen = document.createElement("div");
  screen.className = "bd-screen";
  screen.hidden = true;
  document.body.appendChild(screen);

  function renderScreen() {
    var got = load();
    var sg = currentSG();
    var nb = nextLocked(got);
    var h =
      "<div class='bd-top'><button class='bd-x' type='button' data-x='1' aria-label='Fermer'>✕</button><h2>Mes badges</h2><span></span></div>" +
      "<div class='bd-body'><div class='bd-sum'><b>" + got.length + " / " + BADGES.length + "</b>" +
      "<span>badges débloqués · " + fmt(sg) + " SG</span></div><div class='bd-grid'>";
    BADGES.forEach(function (b) {
      var on = got.indexOf(b.id) !== -1;
      var pct = on ? 100 : Math.min(100, Math.round((sg / b.sg) * 100));
      h +=
        "<button type='button' class='bd-card " + (on ? "on" : "off") + "' data-id='" + b.id + "' style='--c1:" + b.c1 + ";--c2:" + b.c2 + "'>" +
        "<span class='bd-ico'>" + b.icon + "</span>" +
        "<span class='bd-cname'>" + esc(b.name) + "</span>" +
        "<span class='bd-csg'>" + fmt(b.sg) + " SG</span>" +
        (on
          ? "<span class='bd-replay'>Revoir la scène ✨</span>"
          : "<span class='bd-pbar'><i style='width:" + pct + "%'></i></span><span class='bd-ptxt'>" +
            (nb && nb.id === b.id ? "Prochain objectif · " : "") + pct + " %</span>") +
        "</button>";
    });
    h += "</div><p class='bd-hint' id='bd-hint'></p></div>";
    screen.innerHTML = h;
  }

  function openScreen() {
    renderScreen();
    screen.hidden = false;
  }

  screen.addEventListener("click", function (e) {
    if (e.target.closest("[data-x]")) {
      screen.hidden = true;
      return;
    }
    var card = e.target.closest(".bd-card");
    if (!card) return;
    var id = card.getAttribute("data-id");
    for (var i = 0; i < BADGES.length; i++) {
      if (BADGES[i].id !== id) continue;
      if (load().indexOf(id) !== -1) {
        play(BADGES[i], "replay");
      } else {
        var hint = document.getElementById("bd-hint");
        if (hint) hint.textContent = "Encore " + fmt(Math.max(0, BADGES[i].sg - currentSG())) + " SG pour débloquer « " + BADGES[i].name + " ».";
      }
    }
  });

  /* ---------- evenements ---------- */
  document.addEventListener("samquiz:quiz-finished", function () {
    check(1700);
  });
  document.addEventListener("samquiz:cloud-score", function (e) {
    var s = e && e.detail ? e.detail.sg : null;
    if (typeof s === "number") cloudSG = s;
    check(1200);
  });
  document.addEventListener("samquiz:show-home", updateEntry);
  window.addEventListener("load", function () {
    updateEntry();
    check(2500);
  });

  var m = /^#badge([1-7])$/.exec(location.hash || "");
  if (m) {
    setTimeout(function () {
      play(BADGES[parseInt(m[1], 10) - 1], "preview");
    }, 900);
  }

  updateEntry();
})();
