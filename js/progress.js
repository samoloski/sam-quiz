/* sam quiz : progression et points SG (stockes sur le telephone) */
(function () {
  var KEY = "samquiz:progress:v1";
  var PASS = 70;

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && typeof d.sg === "number" && d.best) return d;
    } catch (e) {}
    return { sg: 0, best: {} };
  }

  function save(d) {
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch (e) {}
  }

  function key(id, level) {
    return id + ":" + level;
  }

  var pill = document.createElement("span");
  pill.className = "sg-pill";
  document.getElementById("topbar").appendChild(pill);

  function refresh(pop) {
    pill.textContent = "⭐ " + load().sg + " SG";
    if (pop) {
      pill.classList.remove("pop");
      void pill.offsetWidth;
      pill.classList.add("pop");
    }
  }

  window.SamProgress = {
    pass: PASS,
    getSG: function () {
      return load().sg;
    },
    getBest: function (id, level) {
      return load().best[key(id, level)] || 0;
    },
    isUnlocked: function (id, level) {
      return level <= 1 || this.getBest(id, level - 1) >= PASS;
    }
  };

  document.addEventListener("samquiz:quiz-finished", function (e) {
    var r = e.detail;
    if (!r.rewarded || !r.total) return;
    var d = load();
    var pct = Math.round((r.correct / r.total) * 100);
    var k = key(r.subjectId, r.level);
    if (pct > (d.best[k] || 0)) d.best[k] = pct;
    d.sg += r.sg;
    save(d);
    refresh(true);
  });

  refresh(false);
})();
