/* sam quiz : ecran d'accueil */
(function () {
  var listEl = document.getElementById("home-list");
  var fab = document.getElementById("btn-add-subject");
  var modal = document.getElementById("modal-subject");
  var inputName = document.getElementById("input-subject-name");
  var inputCat = document.getElementById("input-subject-category");
  var datalist = document.getElementById("category-list");
  var btnCancel = document.getElementById("btn-cancel-subject");
  var btnSave = document.getElementById("btn-save-subject");

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

  function plural(n, word) {
    return n + " " + word + (n > 1 ? "s" : "");
  }

  function bankFor(subject) {
    var bank = window.SamBank || [];
    var n = norm(subject.name);
    for (var i = 0; i < bank.length; i++) {
      if (norm(bank[i].name) === n) return bank[i];
    }
    return null;
  }

  function countLabel(s) {
    var b = bankFor(s);
    if (b && b.levels) {
      var total = s.questions.length;
      var levels = 0;
      [1, 2, 3].forEach(function (l) {
        var n = (b.levels[l] || []).length;
        if (n > 0) levels += 1;
        total += n;
      });
      return plural(total, "question") + " · " + plural(levels, "niveau").replace("niveaus", "niveaux");
    }
    return plural(s.cards.length, "carte") + " · " + plural(s.questions.length, "question");
  }

  function refreshCategories() {
    var html = "";
    window.SamStore.getCategories().forEach(function (cat) {
      html += '<option value="' + esc(cat) + '"></option>';
    });
    datalist.innerHTML = html;
  }

  function render() {
    var subjects = window.SamStore.getSubjects();

    if (subjects.length === 0) {
      listEl.innerHTML =
        '<p class="empty">Aucune matière pour l\'instant.<br>' +
        'Appuie sur « + Matière » pour commencer.</p>';
      refreshCategories();
      return;
    }

    var groups = {};
    var order = [];
    subjects.forEach(function (s) {
      var cat = s.category || "Autres";
      if (!groups[cat]) {
        groups[cat] = [];
        order.push(cat);
      }
      groups[cat].push(s);
    });

    var html = "";
    order.forEach(function (cat) {
      html += '<section class="category">';
      html += '<h2 class="category-title">' + esc(cat) + "</h2>";
      html += '<div class="subject-list">';
      groups[cat].forEach(function (s) {
        html +=
          '<button class="subject-card" type="button" data-id="' + s.id + '">' +
          '<span class="subject-name">' + esc(s.name) + "</span>" +
          '<span class="subject-count">' + countLabel(s) + "</span>" +
          "</button>";
      });
      html += "</div></section>";
    });

    listEl.innerHTML = html;
    refreshCategories();
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
    var card = e.target.closest(".subject-card");
    if (!card) return;
    document.dispatchEvent(
      new CustomEvent("samquiz:open-subject", { detail: { id: card.getAttribute("data-id") } })
    );
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

  /* les banques de questions se chargent apres ce script : on redessine a la fin du chargement */
  window.addEventListener("load", render);

  render();
})();
