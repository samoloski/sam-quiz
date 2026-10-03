/* sam quiz : chat avec Samoloski AI (interface) */
(function () {
  var cloud = window.SamCloud;
  var slot = document.getElementById("hub-slot-bottom");
  if (!cloud || !slot) return;

  var LIMIT = 5;
  var SUGGESTIONS = [
    "Explique-moi la dérivée d'une fonction",
    "Quelle différence entre mitose et méiose ?",
    "Comment résoudre x² − 5x + 6 = 0 ?",
    "Passé simple ou imparfait : comment choisir ?"
  ];

  var FAB_LOGO =
    '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<defs><linearGradient id="fabGrad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#a78bfa"/>' +
    "</linearGradient></defs>" +
    '<line x1="32" y1="6" x2="32" y2="14" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="32" cy="5" r="3.5" fill="#fbbf24"/>' +
    '<rect x="4" y="26" width="6" height="12" rx="3" fill="#fff" opacity="0.85"/>' +
    '<rect x="54" y="26" width="6" height="12" rx="3" fill="#fff" opacity="0.85"/>' +
    '<rect x="10" y="14" width="44" height="38" rx="14" fill="url(#fabGrad)"/>' +
    '<rect x="15" y="21" width="34" height="24" rx="10" fill="#0f172a"/>' +
    '<g class="hub-eyes">' +
    '<circle cx="25" cy="32" r="4" fill="#38bdf8"/>' +
    '<circle cx="39" cy="32" r="4" fill="#38bdf8"/></g>' +
    '<path d="M26 40 Q32 45 38 40" stroke="#fbbf24" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    "</svg>";

  var btn = document.createElement("button");
  btn.className = "chat-open";
  btn.type = "button";
  btn.innerHTML = "<span>💬</span> Poser une question à Samoloski AI";
  slot.insertBefore(btn, slot.firstChild);

  var fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Poser une question à Samoloski AI");
  fab.innerHTML = FAB_LOGO;
  document.body.appendChild(fab);

  var screen = document.createElement("div");
  screen.className = "chat-screen";
  screen.hidden = true;
  document.body.appendChild(screen);

  var turns = [];
  var busy = false;
  var remaining = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function box() {
    return document.getElementById("ch-msgs");
  }

  function scrollDown() {
    var b = box();
    if (b) b.scrollTop = b.scrollHeight;
  }

  function addBubble(kind, text) {
    var b = el("div", "chat-msg " + kind, text);
    box().appendChild(b);
    scrollDown();
    return b;
  }

  function updateLeft() {
    var n = document.getElementById("ch-left");
    if (n) {
      n.textContent =
        remaining === null ? "" : "💬 " + remaining + " restante" + (remaining > 1 ? "s" : "");
    }
    var send = document.getElementById("ch-send");
    if (send) send.disabled = busy || remaining === 0;
  }

  function welcome() {
    var w = el("div", "chat-welcome");
    var img = document.createElement("img");
    img.src = "/icons/icon-192.png";
    img.alt = "";
    w.appendChild(img);
    w.appendChild(
      el("div", "", "Salut ! Pose-moi une question de cours. Je t'explique pas à pas, sans faire ton devoir à ta place.")
    );
    var chips = el("div", "chat-chips");
    SUGGESTIONS.forEach(function (s) {
      var c = el("button", "chat-chip", s);
      c.type = "button";
      c.setAttribute("data-s", s);
      chips.appendChild(c);
    });
    w.appendChild(chips);
    box().appendChild(w);
  }

  function friendly(data) {
    var reason = data && data.reason;
    if (reason === "user") return "Tu as utilisé tes questions du jour. Reviens demain !";
    if (reason === "global") return "Samoloski AI est très sollicité aujourd'hui. Réessaie un peu plus tard.";
    if (reason === "pseudo") return "Choisis d'abord ton pseudo : ferme cet écran, touche 🏆 puis « Choisir mon pseudo ».";
    if (reason === "auth") return "Connexion requise. Recharge l'appli puis réessaie.";
    return (data && data.error) || "Une erreur est survenue, réessaie.";
  }

  async function send(text) {
    text = String(text || "").trim();
    if (!text || busy || remaining === 0) return;
    busy = true;
    updateLeft();

    var w = screen.querySelector(".chat-welcome");
    if (w) w.remove();

    addBubble("me", text);
    var input = document.getElementById("ch-text");
    if (input) {
      input.value = "";
      input.style.height = "auto";
    }

    var typing = el("div", "chat-msg ai");
    typing.innerHTML = "<span class='typing'><i></i><i></i><i></i></span>";
    box().appendChild(typing);
    scrollDown();

    try {
      var data = await cloud.chatAsk(text, turns.slice(-4));
      typing.remove();
      if (data && data.ok) {
        addBubble("ai", data.answer);
        turns.push({ role: "user", content: text }, { role: "assistant", content: data.answer });
        if (turns.length > 8) turns = turns.slice(-8);
        if (typeof data.remaining === "number") remaining = data.remaining;
      } else {
        addBubble("err", friendly(data));
        if (data && data.reason === "user") remaining = 0;
      }
    } catch (e) {
      typing.remove();
      addBubble("err", (e && e.message) || "Erreur, réessaie.");
    }

    busy = false;
    updateLeft();
  }

  async function open() {
    if (!screen.hidden) return;
    screen.innerHTML =
      "<div class='chat-top'>" +
      "<button class='quiz-close' id='ch-close' type='button' aria-label='Fermer'>✕</button>" +
      "<div class='chat-title'><strong>Samoloski AI</strong><small>Ton coach de révision</small></div>" +
      "<span class='chat-left' id='ch-left'></span></div>" +
      "<div class='chat-msgs' id='ch-msgs'></div>" +
      "<div class='chat-input'>" +
      "<textarea id='ch-text' rows='1' maxlength='500' placeholder='Pose ta question de cours…'></textarea>" +
      "<button id='ch-send' type='button' aria-label='Envoyer'>➤</button></div>";
    screen.hidden = false;
    document.body.classList.add("no-scroll");
    if (!history.state || history.state.screen !== "chat") {
      history.pushState({ screen: "chat" }, "");
    }

    if (!turns.length) welcome();
    else {
      turns.forEach(function (t) {
        addBubble(t.role === "user" ? "me" : "ai", t.content);
      });
    }
    updateLeft();

    if (!cloud.available()) {
      addBubble("err", "Le chat demande une connexion internet.");
      return;
    }

    try {
      if (!cloud.getProfile()) await cloud.loadProfile();
      if (!cloud.getProfile()) {
        addBubble("err", friendly({ reason: "pseudo" }));
        return;
      }
      var used = await cloud.chatUsed();
      if (used !== null) remaining = Math.max(0, LIMIT - used);
      updateLeft();
    } catch (e) {
      addBubble("err", "Connexion impossible. Vérifie ta connexion internet.");
    }
  }

  function hide() {
    screen.hidden = true;
    screen.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function close() {
    if (history.state && history.state.screen === "chat") history.back();
    else hide();
  }

  btn.addEventListener("click", open);
  fab.addEventListener("click", open);

  screen.addEventListener("click", function (e) {
    if (e.target.closest("#ch-close")) {
      close();
      return;
    }
    if (e.target.closest("#ch-send")) {
      var input = document.getElementById("ch-text");
      send(input ? input.value : "");
      return;
    }
    var chip = e.target.closest(".chat-chip");
    if (chip) send(chip.getAttribute("data-s"));
  });

  screen.addEventListener("input", function (e) {
    if (e.target.id === "ch-text") {
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    }
  });

  window.addEventListener("popstate", function () {
    if (!screen.hidden) hide();
  });
})();
