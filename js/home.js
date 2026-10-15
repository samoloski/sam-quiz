/* sam quiz : ecran d'accueil (liste compacte des matieres) */
(function () {
  var listEl = document.getElementById("home-list");
  var fab = document.getElementById("btn-add-subject");
  var modal = document.getElementById("modal-subject");
  var inputName = document.getElementById("input-subject-name");
  var inputCat = document.getElementById("input-subject-category");
  var datalist = document.getElementById("category-list");
  var btnCancel = document.getElementById("btn-cancel-subject");
  var btnSave = document.getElementById("btn-save-subject");

  var OFFICIAL = [
    { id: "maths", name: "Mathématiques", icon: "📐", alias: ["mathematiques", "maths"] },
    { id: "physique", name: "Physique-Chimie", icon: "⚗️", alias: ["physiquechimie", "physique"] },
    { id: "svt", name: "SVT", icon: "🧬", alias: ["svt"] },
    { id: "francais", name: "Français", icon: "📖", alias: ["francais"] },
    { id: "anglais", name: "Anglais", icon: "🗣️", alias: ["anglais"] },
    { id: "histgeo", name: "Histoire-Géographie", icon: "🌍", alias: ["histoiregeographie", "histoiregeo", "histgeo"] }
  ];

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function key(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function officialOf(name) {
    var k = key(name);
    for (var i = 0; i < OFFICIAL.length; i++) {
      if (OFFICIAL[i].alias.indexOf(k) !== -1) return OFFICIAL[i];
    }
    return null;
  }

  function hasBank(id) {
    var bank = window.SamBank || [];
    for (var i = 0; i < bank.length; i++) {
      if (bank[i].id === id) return true;
    }
    return false;
  }

  function progress(id) {
    var P = window.SamProgress;
    if (!P || !hasBank(id)) return null;
    var best = [1, 2, 3].map(function (l) { return P.getBest(id, l); });
    var sum = best.reduce(function (a, b) { return a + b; }, 0);
    var ok = best.filter(function (b) { return b >= P.pass; }).length;
    return { avg: Math.round(sum / 3), max: Math.max.apply(null, best), ok: ok };
  }

  function refreshCategories() {
    var html = "";
    window.SamStore.getCategories().forEach(function (cat) {
      html += '<option value="' + esc(cat) + '"></option>';
    });
    datalist.innerHTML = html;
  }

  function row(o, s) {
    var p = progress(o.id);
    var sub = p
      ? (p.max ? "Record " + p.max + " % · " + p.ok + "/3 niveaux validés" : "Pas encore joué")
      : "Questions générées par l'IA";

    var inner =
      '<span class="mrow-ico">' + o.icon + "</span>" +
      '<span class="mrow-txt"><span class="mrow-name">' + esc(o.name) + "</span>" +
      '<span class="mrow-sub">' + esc(sub) + "</span></span>";

    var head = s
      ? '<button class="mrow-head" type="button" data-open="' + s.id + '">' + inner + "</button>"
      : '<div class="mrow-head">' + inner + "</div>";

    var bar = p ? '<div class="mrow-bar"><i style="width:' + p.avg + '%"></i></div>' : "";

    var actions =
      '<button class="mrow-btn main" type="button" data-inf="' + o.id + '">♾️ Illimité</button>' +
      (s && hasBank(o.id)
        ? '<button class="mrow-btn alt" type="button" data-levels="' + s.id + '">Niveaux</button>'
        : "");

    return '<div class="mrow">' + head + bar + '<div class="mrow-actions">' + actions + "</div></div>";
  }

  function extraRow(s) {
    var inner =
      '<span class="mrow-ico">📘</span>' +
      '<span class="mrow-txt"><span class="mrow-name">' + esc(s.name) + "</span>" +
      '<span class="mrow-sub">' + s.cards.length + " cartes · " + s.questions.length + " questions</span></span>";
    return (
      '<div class="mrow"><button class="mrow-head" type="button" data-open="' + s.id + '">' + inner + "</button>" +
      '<div class="mrow-actions"><button class="mrow-btn alt" type="button" data-open="' + s.id + '">Ouvrir</button></div></div>'
    );
  }

  function render() {
    var subjects = window.SamStore.getSubjects();
    var used = {};
    var rows = "";

    OFFICIAL.forEach(function (o) {
      var found = null;
      subjects.forEach(function (s) {
        if (officialOf(s.name) === o) {
          found = s;
          used[s.id] = true;
        }
      });
      rows += row(o, found);
    });

    subjects.forEach(function (s) {
      if (!used[s.id]) rows += extraRow(s);
    });

    listEl.innerHTML = '<div class="mlist">' + rows + "</div>";
    refreshCategories();
  }

  function openInfini(id) {
    var entry = document.querySelector(".inf-entry");
    if (!entry) return;
    entry.click();
    var chip = document.querySelector('.inf-screen [data-sub="' + id + '"]');
    if (chip) chip.click();
  }

  function openModal() {
    inputName.value = "";
    inputCat.value = "";
    modal.hidden = false;
    setTimeout(function () { inputName.focus(); }, 60);
  }

  function closeModal() {
    modal.hidden = true;
  }

  function saveSubject() {
    var name = inputName.value.trim();
    if (!name) {
      inputName.focus();
      return;
    }
    window.SamStore.addSubject(name, inputCat.value);
    closeModal();
    render();
  }

  listEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-inf]");
    if (b) {
      openInfini(b.getAttribute("data-inf"));
      return;
    }
    b = e.target.closest("[data-levels]");
    if (b) {
      document.dispatchEvent(
        new CustomEvent("samquiz:start-mode", {
          detail: { mode: "quiz", id: b.getAttribute("data-levels") },
          cancelable: true
        })
      );
      return;
    }
    b = e.target.closest("[data-open]");
    if (b) {
      document.dispatchEvent(
        new CustomEvent("samquiz:open-subject", { detail: { id: b.getAttribute("data-open") } })
      );
    }
  });

  fab.addEventListener("click", openModal);
  btnCancel.addEventListener("click", closeModal);
  btnSave.addEventListener("click", saveSubject);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  [inputName, inputCat].forEach(function (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") saveSubject();
      if (e.key === "Escape") closeModal();
    });
  });

  document.addEventListener("samquiz:show-home", render);
  window.addEventListener("load", render);

  render();
})();
