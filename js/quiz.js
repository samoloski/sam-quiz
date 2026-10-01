/* sam quiz : moteur de quiz QCM */
(function () {
  var root = document.createElement("div");
  root.className = "quiz-screen";
  root.hidden = true;
  document.body.appendChild(root);

  var run = null;

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function prepare(questions) {
    return shuffle(questions).map(function (item) {
      var order = shuffle(item.c.map(function (_, i) { return i; }));
      return {
        q: item.q,
        e: item.e || "",
        choices: order.map(function (i) { return item.c[i]; }),
        answer: order.indexOf(item.a)
      };
    });
  }

  function computeSG(correct, total, level, rewarded) {
    if (!rewarded) return 0;
    var sg = correct * 10 * level;
    if (total > 0 && correct === total) sg += 20 * level;
    return sg;
  }

  function topBar(pct, count) {
    return (
      '<div class="quiz-top">' +
      '<button class="quiz-close" id="qz-close" type="button" aria-label="Quitter">✕</button>' +
      '<div class="quiz-progress"><div class="quiz-progress-bar" style="width:' + pct + '%"></div></div>' +
      (count ? '<span class="quiz-count">' + count + "</span>" : "") +
      "</div>"
    );
  }

  function renderQuestion() {
    var total = run.items.length;
    var item = run.items[run.index];
    var pct = Math.round((run.index / total) * 100);
    var html = topBar(pct, run.index + 1 + "/" + total);

    html += '<div class="quiz-body">';
    html +=
      '<span class="chip">' + esc(run.title) +
      (run.level ? " · Niveau " + run.level : "") + "</span>";
    html += '<h2 class="quiz-question">' + esc(item.q) + "</h2>";
    html += '<div class="quiz-choices">';
    item.choices.forEach(function (c, i) {
      html +=
        '<button class="quiz-choice" type="button" data-i="' + i + '">' +
        '<span class="quiz-letter">' + "ABCD".charAt(i) + "</span>" +
        "<span>" + esc(c) + "</span></button>";
    });
    html += '</div><div id="qz-feedback"></div></div>';

    root.innerHTML = html;
    root.scrollTop = 0;
  }

  function answer(i) {
    if (!run || run.locked) return;
    run.locked = true;

    var total = run.items.length;
    var item = run.items[run.index];
    var ok = i === item.answer;
    if (ok) run.correct++;

    root.querySelectorAll(".quiz-choice").forEach(function (b, idx) {
      b.disabled = true;
      if (idx === item.answer) b.classList.add("correct");
      else if (idx === i) b.classList.add("wrong");
    });

    var bar = root.querySelector(".quiz-progress-bar");
    if (bar) bar.style.width = Math.round(((run.index + 1) / total) * 100) + "%";

    var last = run.index === total - 1;
    var fb = document.getElementById("qz-feedback");
    fb.innerHTML =
      '<div class="quiz-feedback ' + (ok ? "ok" : "ko") + '">' +
      "<strong>" + (ok ? "✔ Bonne réponse" : "✘ Mauvaise réponse") + "</strong>" +
      (item.e ? "<p>" + esc(item.e) + "</p>" : "") +
      "</div>" +
      '<button class="btn btn-primary btn-block" id="qz-next" type="button">' +
      (last ? "Voir le résultat" : "Suivant") + "</button>";
    fb.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  function confetti() {
    var colors = ["#4f46e5", "#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];
    var html = "";
    for (var i = 0; i < 28; i++) {
      html +=
        '<i class="confetti" style="left:' + Math.round(Math.random() * 100) +
        "%;background:" + colors[i % colors.length] +
        ";animation-delay:" + (Math.random() * 0.8).toFixed(2) + 's"></i>';
    }
    var box = document.createElement("div");
    box.className = "confetti-box";
    box.innerHTML = html;
    root.appendChild(box);
    setTimeout(function () {
      if (box.parentNode) box.parentNode.removeChild(box);
    }, 3500);
  }

  function finish() {
    var total = run.items.length;
    var sg = computeSG(run.correct, total, run.level, run.rewarded);
    var ratio = total ? run.correct / total : 0;
    var emoji = ratio === 1 ? "🏆" : ratio >= 0.6 ? "🎉" : "💪";
    var msg =
      ratio === 1 ? "Sans faute !" :
      ratio >= 0.6 ? "Bien joué !" :
      "Continue, tu vas y arriver !";

    var html = topBar(100, "");
    html += '<div class="quiz-body quiz-result">';
    html += '<div class="quiz-result-emoji">' + emoji + "</div>";
    html += '<h2 class="quiz-result-score">' + run.correct + " / " + total + "</h2>";
    html += '<p class="quiz-result-msg">' + msg + "</p>";
    if (sg > 0) html += '<div class="quiz-sg">+' + sg + " SG</div>";
    html +=
      '<div class="quiz-result-actions">' +
      '<button class="btn btn-secondary" id="qz-quit" type="button">Quitter</button>' +
      '<button class="btn btn-primary" id="qz-replay" type="button">Rejouer</button>' +
      "</div></div>";

    root.innerHTML = html;
    root.scrollTop = 0;
    if (ratio >= 0.8) confetti();

    document.dispatchEvent(
      new CustomEvent("samquiz:quiz-finished", {
        detail: {
          subjectId: run.subjectId,
          level: run.level,
          correct: run.correct,
          total: total,
          sg: sg,
          rewarded: run.rewarded
        }
      })
    );
  }

  function renderEmpty() {
    root.innerHTML =
      topBar(0, "") +
      '<div class="quiz-body quiz-result">' +
      '<div class="quiz-result-emoji">🤔</div>' +
      '<h2 class="quiz-result-score">Pas encore de questions</h2>' +
      '<p class="quiz-result-msg">Ajoute des questions avec « + Question » pour lancer le quiz.</p>' +
      '<div class="quiz-result-actions">' +
      '<button class="btn btn-primary" id="qz-quit" type="button">Retour</button>' +
      "</div></div>";
  }

  function start(opts) {
    var items = prepare(opts.questions || []).slice(0, opts.limit || 10);
    run = {
      title: opts.title || "Quiz",
      subjectId: opts.subjectId || null,
      level: opts.level || 0,
      rewarded: !!opts.rewarded,
      items: items,
      index: 0,
      correct: 0,
      locked: false,
      opts: opts
    };
    root.hidden = false;
    document.body.classList.add("no-scroll");
    if (!history.state || history.state.screen !== "quiz") {
      history.pushState({ screen: "quiz" }, "");
    }
    if (items.length === 0) renderEmpty();
    else renderQuestion();
  }

  function hide() {
    root.hidden = true;
    root.innerHTML = "";
    run = null;
    document.body.classList.remove("no-scroll");
  }

  function close() {
    if (history.state && history.state.screen === "quiz") history.back();
    else hide();
  }

  root.addEventListener("click", function (e) {
    var choice = e.target.closest(".quiz-choice");
    if (choice) {
      answer(parseInt(choice.getAttribute("data-i"), 10));
      return;
    }
    if (e.target.closest("#qz-next")) {
      run.index++;
      run.locked = false;
      if (run.index >= run.items.length) finish();
      else renderQuestion();
      return;
    }
    if (e.target.closest("#qz-replay")) {
      start(run.opts);
      return;
    }
    if (e.target.closest("#qz-close") || e.target.closest("#qz-quit")) {
      close();
    }
  });

  window.addEventListener("popstate", function () {
    if (!root.hidden) hide();
  });

  document.addEventListener("samquiz:start-mode", function (e) {
    if (e.detail.mode !== "quiz") return;
    e.preventDefault();
    var s = window.SamStore.getSubject(e.detail.id);
    if (!s) return;
    var questions = s.questions.map(function (u) {
      return { q: u.question, c: u.choices, a: u.answer, e: "" };
    });
    start({
      title: s.name,
      subjectId: s.id,
      level: 0,
      rewarded: false,
      questions: questions
    });
  });

  window.SamQuiz = { start: start, computeSG: computeSG };
})();
