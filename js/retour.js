/* sam quiz : le bouton retour d'Android ferme l'écran ouvert au lieu de quitter l'appli */
(function () {
  var stack = [];
  var ignore = 0;

  function isOverlay(el) {
    if (!el || el.nodeType !== 1) return false;
    var cs = window.getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "absolute") return false;
    return el.offsetWidth >= window.innerWidth * 0.9 && el.offsetHeight >= window.innerHeight * 0.5;
  }

  function findClose(el) {
    var sel =
      "[data-close],[data-back],.close,.back,.x," +
      "button[aria-label*='ermer' i],button[aria-label*='etour' i],button[aria-label*='lose' i]";
    var b = el.querySelector(sel);
    if (b) return b;
    var btns = el.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || "").trim();
      if (t === "✕" || t === "×" || t === "✖" || t === "←" || t === "‹") return btns[i];
    }
    return null;
  }

  function opened(el) {
    if (stack.indexOf(el) !== -1) return;
    stack.push(el);
    try { history.pushState({ ov: stack.length }, ""); } catch (e) {}
  }

  function closed(el) {
    var i = stack.indexOf(el);
    if (i === -1) return;
    var wasTop = i === stack.length - 1;
    stack.splice(i, 1);
    if (wasTop && history.state && history.state.ov) {
      ignore += 1;
      history.back();
    }
  }

  new MutationObserver(function (list) {
    list.forEach(function (m) {
      var el = m.target;
      if (el.hidden) {
        closed(el);
      } else if (isOverlay(el)) {
        opened(el);
      }
    });
  }).observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden"]
  });

  window.addEventListener("popstate", function () {
    if (ignore > 0) { ignore -= 1; return; }
    if (!stack.length) return;
    var el = stack.pop();
    var btn = findClose(el);
    if (btn) btn.click();
    else el.hidden = true;
  });
})();
