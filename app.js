/* LAHI shared portal logic
   Handles XP, badges, celebrations and optional Google Sheets sync.
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

    // Prevent the same XP reward from being added twice.
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
      if (box && box.parentNode) {
        box.parentNode.removeChild(box);
      }
    }, 2200);
  }

  function celebrate(options) {
    options = options || {};

    var overlay = document.getElementById("completionOverlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "completionOverlay";

      overlay.innerHTML =
        '<div class="completion-box">' +
          '<div class="celebrate-burst">🎉</div>' +
          '<div class="completion-kicker">MISSION COMPLETE</div>' +
          '<h2 id="completionTitle"></h2>' +
          '<p id="completionText"></p>' +
          '<div class="completion-reward">' +
            '<span id="completionXP"></span>' +
            '<span id="completionBadge"></span>' +
          '</div>' +
          '<p id="completionNext" class="completion-next"></p>' +
          '<button id="completionContinue" class="completion-btn">CONTINUE →</button>' +
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

    var xpEl = document.getElementById("xp");
    var badgeEl = document.getElementById("badges");

    if (xpEl) xpEl.textContent = getNumber("lahiXP");
    if (badgeEl) badgeEl.textContent = getNumber("lahiBadges");
  }

  window.LAHi = {
    getXP: function () {
      return getNumber("lahiXP");
    },
    addXP: addXP,
    awardBadge: awardBadge,
    sync: sync,
    celebrate: celebrate
  };

  window.LAHI = window.LAHi;

  window.getXP = function () {
    return getNumber("lahiXP");
  };

  window.addXP = function (points) {
    return addXP(points);
  };
})();
