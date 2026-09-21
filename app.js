/* LAHI Internship Portal - Shared App Logic
   XP + badges + mission completion animation + Google Sheets sync
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

    // A rewardKey makes the XP award one-time only.
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
        return String(window.LAHiConfig.GOOGLE_SHEETS_URL).trim();
      }
      if (window.LAHI_CONFIG && window.LAHI_CONFIG.GOOGLE_SHEETS_URL) {
        return String(window.LAHI_CONFIG.GOOGLE_SHEETS_URL).trim();
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

  function addCompletionStyles() {
    if (document.getElementById("lahiCompletionStyles")) return;

    var style = document.createElement("style");
    style.id = "lahiCompletionStyles";
    style.textContent = `
      #completionOverlay.lahi-completion-overlay{
        position:fixed!important;
        inset:0!important;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(20,14,48,.78);
        backdrop-filter:blur(7px);
        -webkit-backdrop-filter:blur(7px);
        z-index:2147483000!important;
        overflow:hidden;
      }

      .lahi-completion-card{
        position:relative;
        width:min(520px,100%);
        box-sizing:border-box;
        padding:34px 30px 28px;
        border-radius:32px;
        background:#fff;
        text-align:center;
        box-shadow:0 30px 90px rgba(0,0,0,.28);
        transform:translateY(28px) scale(.88);
        opacity:0;
        animation:lahiCardIn .48s cubic-bezier(.2,.9,.2,1.15) forwards;
      }

      .lahi-completion-card:before,
      .lahi-completion-card:after{
        content:"";
        position:absolute;
        border-radius:50%;
        pointer-events:none;
      }

      .lahi-completion-card:before{
        width:150px;
        height:150px;
        background:#f2efff;
        left:-70px;
        top:-70px;
      }

      .lahi-completion-card:after{
        width:120px;
        height:120px;
        background:#fff3d9;
        right:-55px;
        bottom:-55px;
      }

      .lahi-completion-kicker{
        position:relative;
        z-index:2;
        font-size:12px;
        font-weight:900;
        letter-spacing:2px;
        color:#6654df;
        margin-top:4px;
      }

      .lahi-completion-icon{
        position:relative;
        z-index:2;
        width:94px;
        height:94px;
        margin:0 auto 10px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        background:linear-gradient(135deg,#6b58ef,#8d7df7);
        box-shadow:0 12px 28px rgba(91,75,219,.28);
        font-size:52px;
        animation:lahiIconPop .65s .12s cubic-bezier(.2,1.5,.3,1) both;
      }

      .lahi-completion-card h2{
        position:relative;
        z-index:2;
        margin:9px 0 8px;
        color:#2d2851;
        font-size:30px;
        line-height:1.15;
      }

      .lahi-completion-text{
        position:relative;
        z-index:2;
        margin:0 auto;
        max-width:430px;
        color:#68647b;
        line-height:1.55;
      }

      .lahi-xp-reward{
        position:relative;
        z-index:2;
        display:flex;
        justify-content:center;
        gap:10px;
        flex-wrap:wrap;
        margin:22px 0 14px;
      }

      .lahi-reward-pill{
        padding:11px 17px;
        border-radius:999px;
        font-weight:900;
        background:#fff3d9;
        color:#8a5b00;
        animation:lahiRewardIn .5s .35s both;
      }

      .lahi-badge-pill{
        padding:11px 17px;
        border-radius:999px;
        font-weight:900;
        background:#eeeaff;
        color:#5744c9;
        animation:lahiRewardIn .5s .48s both;
      }

      .lahi-completion-next{
        position:relative;
        z-index:2;
        color:#6654df;
        font-weight:800;
        margin:12px 0 18px;
      }

      .lahi-completion-button{
        position:relative;
        z-index:2;
        border:0;
        width:100%;
        max-width:360px;
        padding:15px 22px;
        border-radius:15px;
        background:#5b4bdb;
        color:#fff;
        font-size:16px;
        font-weight:900;
        cursor:pointer;
        box-shadow:0 9px 20px rgba(91,75,219,.25);
        transition:transform .18s,box-shadow .18s;
      }

      .lahi-completion-button:hover{
        transform:translateY(-2px);
        box-shadow:0 12px 25px rgba(91,75,219,.32);
      }

      .lahi-spark{
        position:fixed;
        z-index:2147483001;
        pointer-events:none;
        font-size:24px;
        animation:lahiSparkFly 1.25s ease-out forwards;
      }

      @keyframes lahiCardIn{
        to{transform:translateY(0) scale(1);opacity:1}
      }

      @keyframes lahiIconPop{
        0%{transform:scale(.4) rotate(-18deg);opacity:0}
        70%{transform:scale(1.12) rotate(5deg)}
        100%{transform:scale(1) rotate(0);opacity:1}
      }

      @keyframes lahiRewardIn{
        from{transform:translateY(12px);opacity:0}
        to{transform:translateY(0);opacity:1}
      }

      @keyframes lahiSparkFly{
        0%{transform:translate(0,0) scale(.7) rotate(0);opacity:1}
        100%{transform:translate(var(--dx),var(--dy)) scale(1.15) rotate(360deg);opacity:0}
      }

      .lahi-confetti{
        position:fixed;
        inset:0;
        pointer-events:none;
        z-index:2147483002;
        overflow:hidden;
      }

      .lahi-confetti span{
        position:absolute;
        top:-30px;
        font-size:22px;
        animation:lahiConfettiFall 1.8s ease-out forwards;
      }

      @keyframes lahiConfettiFall{
        to{
          transform:translateY(110vh) rotate(620deg);
          opacity:0;
        }
      }

      @media(max-width:600px){
        .lahi-completion-card{
          padding:28px 20px 22px;
          border-radius:26px;
        }
        .lahi-completion-card h2{font-size:25px}
        .lahi-completion-icon{width:78px;height:78px;font-size:42px}
      }
    `;

    document.head.appendChild(style);
  }

  function makeConfetti() {
    var old = document.querySelector(".lahi-confetti");
    if (old) old.remove();

    var box = document.createElement("div");
    box.className = "lahi-confetti";

    var icons = ["🎉","⭐","✨","🏆","🎊","💫","🌟"];

    for (var i = 0; i < 34; i++) {
      var span = document.createElement("span");
      span.textContent = icons[i % icons.length];
      span.style.left = Math.round(Math.random() * 100) + "%";
      span.style.animationDelay = (Math.random() * .55) + "s";
      box.appendChild(span);
    }

    document.body.appendChild(box);

    setTimeout(function () {
      if (box && box.parentNode) box.parentNode.removeChild(box);
    }, 2500);
  }

  function makeSparks() {
    var icons = ["⭐","✨","💫","🎉","🏆"];

    for (var i = 0; i < 16; i++) {
      var s = document.createElement("span");
      s.className = "lahi-spark";
      s.textContent = icons[i % icons.length];
      s.style.left = (45 + Math.random() * 10) + "%";
      s.style.top = (32 + Math.random() * 12) + "%";
      s.style.setProperty("--dx", ((Math.random() - .5) * 420) + "px");
      s.style.setProperty("--dy", ((Math.random() - .5) * 420) + "px");
      s.style.animationDelay = (Math.random() * .2) + "s";
      document.body.appendChild(s);

      setTimeout(function (el) {
        return function () {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        };
      }(s), 1700);
    }
  }

  function celebrate(options) {
    options = options || {};
    addCompletionStyles();

    var overlay = document.getElementById("completionOverlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "completionOverlay";
      overlay.className = "lahi-completion-overlay";
      document.body.appendChild(overlay);
    }

    var badgeText = options.badge ? "🏅 " + options.badge : "";
    var xpText = options.xp ? "⭐ +" + options.xp + " XP" : "";

    overlay.innerHTML =
      '<div class="lahi-completion-card">' +
        '<div class="lahi-completion-icon">🎉</div>' +
        '<div class="lahi-completion-kicker">MISSION COMPLETE</div>' +
        '<h2>' + (options.title || "Great work!") + '</h2>' +
        '<p class="lahi-completion-text">' +
          (options.text || "You completed this task. Keep going!") +
        '</p>' +
        '<div class="lahi-xp-reward">' +
          (xpText ? '<span class="lahi-reward-pill">' + xpText + '</span>' : '') +
          (badgeText ? '<span class="lahi-badge-pill">' + badgeText + '</span>' : '') +
        '</div>' +
        '<div class="lahi-completion-next">' +
          (options.nextLabel || "Your next step is ready.") +
        '</div>' +
        '<button id="completionContinue" class="lahi-completion-button">' +
          (options.button || "CONTINUE →") +
        '</button>' +
      '</div>';

    var button = overlay.querySelector("#completionContinue");

    if (button) {
      button.onclick = function () {
        if (options.next) {
          window.location.href = options.next;
        } else {
          overlay.style.display = "none";
        }
      };
    }

    overlay.style.display = "flex";
    makeConfetti();
    makeSparks();

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
