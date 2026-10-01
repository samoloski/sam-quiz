/* sam quiz : formulaires d'ajout de cartes et de questions */
(function () {
  var overlay = document.createElement("div");
  overlay.className = "modal";
  overlay.hidden = true;
  document.body.appendChild(overlay);

  var state = { type: null, id: null, added: 0 };

  function cardForm() {
    return (
      "<h2>Nouvelle carte</h2>" +
      "<label class='field'><span>Recto (la question)</span>" +
      "<textarea id='ed-front' placeholder='Ex : Quelle est la capitale du Togo ?'></textarea></label>" +
      "<label class='field'><span>Verso (la réponse)</span>" +
      "<textarea id='ed-back' placeholder='Ex : Lomé'></textarea></label>"
    );
  }

  function questionForm() {
    var letters = ["A", "B", "C", "D"];
    var html =
      "<h2>Nouvelle question</h2>" +
      "<label class='field'><span>Question</span>" +
      "<textarea id='ed-question' placeholder='Ex : Combien font 7 x 8 ?'></textarea></label>" +
      "<p class='hint'>Écris au moins 2 choix et coche la bonne réponse.</p>";
    letters.forEach(function (letter, i) {
      html +=
        "<div class='choice-row'>" +
        "<input type='radio' name='ed-answer' value='" + i + "'" + (i === 0 ? " checked" : "") + ">" +
        "<input type='text' class='ed-choice' placeholder='Choix " + letter + "' autocomplete='off'>" +
        "</div>";
    });
    return html;
  }

  function showMsg(text, ok) {
    var msg = document.getElementById("ed-msg");
    if (!msg) return;
    msg.className = ok ? "hint" : "field-error";
    msg.textContent = text;
    msg.hidden = false;
  }

  function open(type, id) {
    state.type = type;
    state.id = id;
    state.added = 0;
    overlay.innerHTML =
      "<div class='modal-box scroll'>" +
      (type === "card" ? cardForm() : questionForm()) +
      "<p id='ed-msg' hidden></p>" +
      "<div class='modal-actions'>" +
      "<button class='btn btn-secondary' id='ed-close' type='button'>Terminer</button>" +
      "<button class='btn btn-primary' id='ed-save' type='button'>Ajouter</button>" +
      "</div></div>";
    overlay.hidden = false;
    var first = overlay.querySelector("textarea");
    setTimeout(function () { if (first) first.focus(); }, 80);
  }

  function close() {
    overlay.hidden = true;
    overlay.innerHTML = "";
    document.dispatchEvent(new CustomEvent("samquiz:subject-changed"));
  }

  function saveCard() {
    var front = document.getElementById("ed-front");
    var back = document.getElementById("ed-back");
    if (!front.value.trim() || !back.value.trim()) {
      showMsg("Remplis le recto et le verso.", false);
      return;
    }
    window.SamStore.addCard(state.id, front.value, back.value);
    state.added++;
    front.value = "";
    back.value = "";
    front.focus();
    showMsg("✔ Carte ajoutée (" + state.added + ")", true);
    document.dispatchEvent(new CustomEvent("samquiz:subject-changed"));
  }

  function saveQuestion() {
    var q = document.getElementById("ed-question");
    var rows = overlay.querySelectorAll(".choice-row");
    var selected = parseInt(overlay.querySelector("input[name='ed-answer']:checked").value, 10);
    var choices = [];
    var answerIndex = -1;

    rows.forEach(function (row, i) {
      var text = row.querySelector(".ed-choice").value.trim();
      if (text) {
        if (i === selected) answerIndex = choices.length;
        choices.push(text);
      }
    });

    if (!q.value.trim()) {
      showMsg("Écris la question.", false);
      return;
    }
    if (choices.length < 2) {
      showMsg("Écris au moins 2 choix.", false);
      return;
    }
    if (answerIndex === -1) {
      showMsg("La bonne réponse doit être un choix rempli.", false);
      return;
    }

    window.SamStore.addQuestion(state.id, q.value, choices, answerIndex);
    state.added++;
    q.value = "";
    overlay.querySelectorAll(".ed-choice").forEach(function (input) {
      input.value = "";
    });
    overlay.querySelector("input[name='ed-answer']").checked = true;
    q.focus();
    showMsg("✔ Question ajoutée (" + state.added + ")", true);
    document.dispatchEvent(new CustomEvent("samquiz:subject-changed"));
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      close();
      return;
    }
    if (e.target.id === "ed-close") {
      close();
      return;
    }
    if (e.target.id === "ed-save") {
      if (state.type === "card") saveCard();
      else saveQuestion();
    }
  });

  document.addEventListener("samquiz:add", function (e) {
    open(e.detail.type, e.detail.id);
  });
})();
