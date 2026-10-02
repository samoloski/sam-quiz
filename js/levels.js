/* sam quiz : matieres officielles et choix du niveau */
(function () {
  var bank = window.SamBank || [];
  var SEED_KEY = "samquiz:seeded:v1";
  var LEVELS = {
    1: { icon: "🌱", name: "Facile" },
    2: { icon: "🔥", name: "Moyen" },
    3: { icon: "🚀", name: "Difficile" }
  };

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function norm(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function findBank(subject) {
    var n = norm(subject.name);
    for (var i = 0; i < bank.length; i++) {
      if (norm(bank[i].name) === n) return bank[i];
    }
    return null;
  }

  function seed() {
    var seeded = [];
    try {
      seeded = JSON.parse(localStorage.getItem(SEED_KEY)) || [];
    } catch (e) {}

    var names = window.SamStore.getSubjects().map(function (s) {
      return norm(s.name);
    });
    var added = false;

    bank.forEach(function (b) {
      if (seeded.indexOf(b.id) !== -1) return;
      if (names.indexOf(norm(b.name)) === -1) {
        window.SamStore.addSubject(b.name, b.category);
        added = true;
      }
      seeded.push(b.id);
    });

    try {
      localStorage.setItem(SEED_KEY, JSON.stringify(seeded));
    } catch (e) {}
    if (added) document.dispatchEvent(new CustomEvent("samquiz:show-home"));
  }

  var sheet = document.createElement("div");
  sheet.className = "modal";
  sheet.hidden = true;
  document.body.appendChild(sheet);

  var current = null;

  function openSheet(subject, b) {
    current = b;
    var html = "<div class='modal-box'><h2>" + esc(subject.name) + " : choisis un niveau</h2>";

    [1, 2, 3].forEach(function (l) {
      var list = b.levels[l] || [];
      var unlocked = window.SamProgress.isUnlocked(b.id, l);
      var best = window.SamProgress.getBest(b.id, l);
      var maxSG = list.length * 10 * l + 20 * l;
      var sub;

      if (!unlocked) {
        sub = "🔒 Réussis " + window.SamProgress.pass + " % au niveau " + (l - 1);
      } else {
        sub = list.length + " questions · jusqu'à " + maxSG + " SG" +
          (best ? " · Record " + best + " %" : "");
      }

      html +=
        "<button class='level-card" + (unlocked ? "" : " locked") + "' type='button' data-level='" + l + "'" +
        (unlocked ? "" : " disabled") + ">" +
        "<span class='level-icon'>" + LEVELS[l].icon + "</span>" +
        "<span><span class='level-title'>Niveau " + l + " · " + LEVELS[l].name + "</span><br>" +
        "<span class='level-sub'>" + sub + "</span></span></button>";
    });

    html +=
      "<div class='modal-actions'>" +
      "<button class='btn btn-secondary' id='lv-cancel' type='button'>Annuler</button></div></div>";

    sheet.innerHTML = html;
    sheet.hidden = false;
  }

  function closeSheet() {
    sheet.hidden = true;
    sheet.innerHTML = "";
  }

  sheet.addEventListener("click", function (e) {
    if (e.target === sheet || e.target.id === "lv-cancel") {
      closeSheet();
      return;
    }
    var btn = e.target.closest("[data-level]");
    if (!btn || !current) return;
    var level = parseInt(btn.getAttribute("data-level"), 10);
    var b = current;
    closeSheet();
    window.SamQuiz.start({
      title: b.name,
      subjectId: b.id,
      level: level,
      rewarded: true,
      questions: b.levels[level] || [],
      limit: 10
    });
  });

  document.addEventListener("samquiz:start-mode", function (e) {
    if (e.detail.mode !== "quiz") return;
    var s = window.SamStore.getSubject(e.detail.id);
    var b = s ? findBank(s) : null;
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openSheet(s, b);
  });

  seed();
})();
