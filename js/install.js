/* sam quiz : enregistrement du service worker et bouton d'installation */
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function (err) {
        console.error("Service worker impossible :", err);
      });
    });
  }

  var standalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true;
  if (standalone) return;

  var slot = document.getElementById("hub-slot-bottom");
  if (!slot) return;

  var deferred = null;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  var btn = document.createElement("button");
  btn.className = "install-btn";
  btn.type = "button";
  btn.hidden = true;
  btn.innerHTML = "<span>📲</span> Installer l'appli";
  slot.appendChild(btn);

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
  });

  window.addEventListener("appinstalled", function () {
    deferred = null;
    btn.hidden = true;
  });

  btn.addEventListener("click", async function () {
    if (deferred) {
      deferred.prompt();
      try {
        await deferred.userChoice;
      } catch (e) {}
      deferred = null;
      btn.hidden = true;
      return;
    }
    if (isIOS) {
      alert("Sur iPhone : touche le bouton Partager, puis « Sur l'écran d'accueil ».");
    } else {
      alert("Ouvre le menu ⋮ de ton navigateur, puis touche « Installer l'application » ou « Ajouter à l'écran d'accueil ».");
    }
  });

  setTimeout(function () {
    if (!deferred) btn.hidden = false;
  }, 3000);
})();
