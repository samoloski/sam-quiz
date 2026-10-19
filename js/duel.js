/* sam quiz : duel entre amis (lien a partager, memes questions, sans SG) */
(function () {
  var Q = window.SamQuiz;
  if (!Q || !Q.start) return;

  var origStart = Q.start;
  var last = null;
  var activeDuel = null;

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /* generateur de hasard reproductible : meme graine = meme melange */
  function rngFrom(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function bankById(id) {
    var bank = window.SamBank || [];
    for (var i = 0; i < bank.length; i++) {
      if (bank[i].id === id) return bank[i];
    }
    return null;
  }

  function myName() {
    try {
      var p = JSON.parse(localStorage.getItem("samquiz:profil"));
      if (p && p.name) return String(p.name).slice(0, 20);
    } catch (e) {}
    return "Un ami";
  }

  /* chaque partie d'un niveau recoit une graine, gardee pour le lien de duel */
  Q.start = function (opts) {
    opts = opts || {};
    var b = opts.level > 0 ? bankById(opts.subjectId) : null;
    if (!b) {
      activeDuel = null;
      last = null;
      return origStart(opts);
    }
    if (opts.duel) {
      activeDuel = opts.duel;
    } else {
      activeDuel = null;
      opts.seed = Math.floor(Math.random() * 4294967294) + 1;
    }
    last = { b: b.id, l: opts.level, s: opts.seed };
    var saved = Math.random;
    Math.random = rngFrom(opts.seed);
    try {
      return origStart(opts);
    } finally {
      Math.random = saved;
    }
  };

  function encode(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function decode(code) {
    try {
      code = code.replace(/-/g, "+").replace(/_/g, "/");
      while (code.length % 4) code += "=";
      var d = JSON.parse(decodeURIComponent(escape(atob(code))));
      var l = parseInt(d.l, 10);
      var s = parseInt(d.s, 10);
      var c = parseInt(d.c, 10);
      var t = parseInt(d.t, 10);
      if (typeof d.b !== "string" || !(l >= 1 && l <= 3) || !(s > 0)) return null;
      if (!(t >= 1 && t <= 20) || !(c >= 0 && c <= t)) return null;
      return { b: d.b, l: l, s: s, c: c, t: t, n: String(d.n || "Un ami").slice(0, 20) };
    } catch (e) {
      return null;
    }
  }

  function makeLink(info, correct, total) {
    return location.origin + "/?duel=" + encode({
      b: info.b, l: info.l, s: info.s, n: myName(), c: correct, t: total
    });
  }

  function share(link, text) {
    if (navigator.share) {
      navigator.share({ text: text, url: link }).catch(function () {});
      return;
    }
    window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + link), "_blank");
  }

  /* bouton sur l'ecran de resultat */
  document.addEventListener("samquiz:quiz-finished", function (e) {
    var d = e.detail || {};
    if (!last || d.subjectId !== last.b || d.level !== last.l) return;
    var actions = document.querySelector(".quiz-result-actions");
    if (!actions || !actions.parentNode) return;

    var info = { b: last.b, l: last.l, s: last.s };
    var html = "";
    if (activeDuel) {
      var other = activeDuel.c;
      var verdict =
        d.correct > other ? "🏆 Tu as battu " + esc(activeDuel.n) :
        d.correct === other ? "🤝 Égalité avec " + esc(activeDuel.n) :
        "💪 " + esc(activeDuel.n) + " gagne cette fois";
      html +=
        "<p class='quiz-result-msg'><strong>" + verdict + "</strong><br>" +
        "Toi " + d.correct + " / " + d.total + " · " + esc(activeDuel.n) + " " + other + " / " + activeDuel.t +
        "</p>";
    }
    html +=
      "<button class='btn btn-secondary btn-block' id='duel-share' type='button'>" +
      (activeDuel ? "⚔️ Renvoyer le défi" : "⚔️ Défier un ami") + "</button>";

    var holder = document.createElement("div");
    holder.style.margin = "12px 0";
    holder.innerHTML = html;
    actions.parentNode.insertBefore(holder, actions);

    var name = myName();
    holder.querySelector("#duel-share").addEventListener("click", function () {
      var text = "⚔️ " + name + " te défie sur sam quiz : j'ai fait " + d.correct + "/" + d.total +
        ". Même questions, saurais-tu faire mieux ?";
      share(makeLink(info, d.correct, d.total), text);
    });
  });

  /* ouverture d'un lien de duel */
  function showInvite(d, b) {
    var m = document.createElement("div");
    m.className = "modal";
    m.innerHTML =
      "<div class='modal-box'><h2>⚔️ Défi de " + esc(d.n) + "</h2>" +
      "<p>" + esc(b.name) + " · Niveau " + d.l + "<br>Son score : <strong>" + d.c + " / " + d.t + "</strong></p>" +
      "<p>Vous avez exactement les mêmes questions. Un duel ne donne pas de SG.</p>" +
      "<div class='modal-actions'>" +
      "<button class='btn btn-secondary' id='dl-no' type='button'>Plus tard</button>" +
      "<button class='btn btn-primary' id='dl-go' type='button'>Relever le défi</button>" +
      "</div></div>";
    document.body.appendChild(m);

    m.querySelector("#dl-no").addEventListener("click", function () {
      m.parentNode.removeChild(m);
    });
    m.querySelector("#dl-go").addEventListener("click", function () {
      m.parentNode.removeChild(m);
      Q.start({
        title: b.name,
        subjectId: b.id,
        level: d.l,
        rewarded: false,
        questions: b.levels[d.l] || [],
        limit: 10,
        seed: d.s,
        duel: d
      });
    });
  }

  function checkLink() {
    var m = /[?&]duel=([^&]+)/.exec(location.search);
    if (!m) return;
    var d = decode(m[1]);
    try {
      history.replaceState(history.state, "", location.pathname);
    } catch (e) {}
    if (!d) return;
    var b = bankById(d.b);
    if (!b || !b.levels || !b.levels[d.l] || !b.levels[d.l].length) return;
    showInvite(d, b);
  }

  setTimeout(checkLink, 700);
})();
