/* sam quiz : niveaux illimites (questions generees, questions de depart en secours) */
(function () {
  var Q = window.SamQuiz;
  if (!Q || typeof Q.start !== "function") return;
  var original = Q.start;
  var busy = false;

  var box = document.createElement("div");
  box.className = "dyn-load";
  box.hidden = true;
  box.innerHTML =
    "<div class='dyn-card'><div class='inf-spin'></div>" +
    "<strong>Samoloski AI prépare tes questions…</strong>" +
    "<small>Jusqu'à 30 secondes. Elles sont vérifiées avant d'être affichées.</small>" +
    "<button type='button' class='dyn-skip'>Utiliser les questions de départ</button></div>";
  document.body.appendChild(box);

  var skip = box.querySelector(".dyn-skip");

  function isLevelCall(opts) {
    if (!opts || !opts.rewarded) return false;
    var bank = window.SamBank || [];
    for (var i = 0; i < bank.length; i++) {
      if (bank[i].id === opts.subjectId && bank[i].levels && bank[i].levels[opts.level] === opts.questions) return true;
    }
    return false;
  }

  function launch(opts, generated) {
    var qs = opts.questions;
    if (generated && generated.length) {
      qs = generated.length >= 8 ? generated : generated.concat(opts.questions);
    }
    var next = {};
    for (var k in opts) {
      if (Object.prototype.hasOwnProperty.call(opts, k)) next[k] = opts[k];
    }
    next.questions = qs;
    original.call(Q, next);
  }

  Q.start = function (opts) {
    if (busy || !isLevelCall(opts) || navigator.onLine === false) {
      return original.call(Q, opts);
    }
    busy = true;
    box.hidden = false;
    var finished = false;
    var timer = null;
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;

    function finish(generated) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      box.hidden = true;
      busy = false;
      skip.onclick = null;
      launch(opts, generated);
    }

    timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
      finish(null);
    }, 45000);

    skip.onclick = function () {
      if (ctrl) ctrl.abort();
      finish(null);
    };

    fetch(
      "/api/quiz?subject=" + encodeURIComponent(opts.subjectId) + "&level=" + opts.level,
      ctrl ? { signal: ctrl.signal } : undefined
    )
      .then(function (r) { return r.json(); })
      .then(function (d) { return d && d.ok && Array.isArray(d.questions) ? d.questions : null; })
      .catch(function () { return null; })
      .then(finish);
  };
})();
