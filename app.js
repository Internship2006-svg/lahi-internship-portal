/* LAHI shared portal logic
   Handles XP, badges, celebrations and optional Google Sheets sync.
   Safe to use even when config.js is missing or the Sheets URL is not configured.
*/

(function () {
  "use strict";

  function getNumber(key) {
    return Number(localStorage.getItem(key) || "0") || 0;
  }

  function setNumber(key, value) {
    localStorage.setItem(key, String(value));
  }

  function addXP(points, rewardKey) {
    points = Number(points) || 0;

    // Prevent the same reward from being given twice.
    if (rewardKey && localStorage.getItem(rewardKey) === "1") {
      return false;
    }

    if (rewardKey) {
      localStorage.setItem(rewardKey, "1");
    }

    setNumber("lahiXP", getNumber("lahiXP") + points);
    return true;
  }

  function awardBadge(badgeKey) {
    if (!badgeKey) return false;

    // A badge is awarded only once.
    if (localStorage.getItem(badgeKey) === "1") {
      return false;
    }

    localStorage.setItem(badgeKey, "1");
    setNumber("lahiBadges", getNumber("lahiBadges") + 1);
    return true;
  }

  function getSheetsUrl() {
    try {
      if (window.LAHiConfig && window.LAHiConfig.GOOGLE_SHEETS_URL) {
        return window.LAHiConfig.GOOGLE_SHEETS_URL;
      }
      if (window.LAHI_CONFIG && window.LAHI_CONFIG.GOOGLE_SHEETS_URL) {
        return window.LAHI_CONFIG.GOOGLE_SHEETS_URL;
      }
    } catch (e) {}
    return "";
  }

  function collectLocalData() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key) continue;

        var value = localStorage.getItem(key);

        // Keep normal scalar values as values; JSON objects are also preserved.
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      }
    } catch (e) {}
    return data;
  }

  function sync(eventName, extra) {
    var url = getSheetsUrl();

    // The portal must continue working even before Google Sheets is configured.
    if (!url) {
      return Promise.resolve(false);
    }

    var payload = {
      event: eventName || "portal_event",
      timestamp: new Date().toISOString(),
      xp: getNumber("lahiXP"),
      badges: getNumber("lahiBadges"),
      data: collectLocalData(),
      extra: extra || {}
    };

    try {
      return fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      }).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function makeConfetti() {
    var old = document.querySelector(".lahi-confetti");
    if (old) old.remove();

    var box = document.createElement("div");
    box.className = "lahi-confetti";
    var icons = ["🎉", "⭐", "✨", "🏆", "🎊", "💫"];

    for (var i = 0; i < 28; i++) {
      var span = document.createElement("span");
      span.textContent = icons[i % icons.length];
      span.style.left = Math.round(Math.random() * 100) + "%";
      span.style.animationDelay = (Math.random() * 0.45) + "s";
      box.appendChild(span);
    }

    document.body.appendChild(box);

    setTimeout(function () {
      if (box && box.parentNode) box.parentNode.removeChild(box);
    }, 2200);
  }

  function celebrate(options) {
    options = options || {};

    var overlay = document.getElementById("completionOverlay");

    // If a page has not yet added the overlay, create a simple fallback.
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "completionOverlay";
      overlay.style.cssText =
        "position:fixed;inset:0;background:rgba(20,15,40,.75);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;";

      overlay.innerHTML =
        '<div style="background:#fff;border-radius:28px;padding:32px;max-width:520px;width:100%;text-align:center;font-family:Arial,sans-serif;">' +
        '<div style="font-size:52px">🎉</div>' +
        '<div style="font-size:12px;font-weight:900;color:#5b4bdb;letter-spacing:1px">MISSION COMPLETE</div>' +
        '<h2 id="completionTitle" style="font-size:30px;margin:8px 0"></h2>' +
        '<p id="completionText" style="color:#666;line-height:1.5"></p>' +
        '<div style="background:#fff3df;border-radius:14px;padding:14px;margin:18px 0;font-weight:800">' +
        '<span id="completionXP"></span> &nbsp; <span id="completionBadge"></span>' +
        '</div>' +
        '<p id="completionNext" style="font-weight:800;color:#5b4bdb"></p>' +
        '<button id="completionContinue" style="border:0;background:#5b4bdb;color:#fff;border-radius:14px;padding:15px 25px;font-weight:900;font-size:16px;cursor:pointer">CONTINUE →</button>' +
        '</div>';

      document.body.appendChild(overlay);
    }

    function put(id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value || "";
    }

    put("completionTitle", options.title || "Mission complete!");
    put("completionText", options.text || "Great work!");
    put("completionXP", options.xp ? "⭐ +" + options.xp + " XP" : "");
    put("completionBadge", options.badge ? "🏅 " + options.badge : "");
    put("completionNext", options.nextLabel || "");

    var continueButton = document.getElementById("completionContinue");

    if (continueButton) {
      continueButton.textContent = options.button || "CONTINUE →";
      continueButton.onclick = function () {
        if (options.next) {
          window.location.href = options.next;
        } else {
          overlay.style.display = "none";
        }
      };
    }

    overlay.style.display = "flex";
    makeConfetti();

    // Update any visible XP/badge counters immediately.
    var xpEl = document.getElementById("xp");
    var badgeEl = document.getElementById("badges");
    if (xpEl) xpEl.textContent = getNumber("lahiXP");
    if (badgeEl) badgeEl.textContent = getNumber("lahiBadges");
  }

  // Expose one consistent object. Existing pages use LAHi (capital H/lowercase i).
  window.LAHi = {
    getXP: function () {
      return getNumber("lahiXP");
    },
    addXP: addXP,
    awardBadge: awardBadge,
    sync: sync,
    celebrate: celebrate
  };

  // Also expose the all-caps alias for future pages.
  window.LAHI = window.LAHi;

  // Keep the old global functions working if another page uses them.
  window.getXP = function () {
    return getNumber("lahiXP");
  };

  window.addXP = function (points) {
    return addXP(points);
  };
})();
