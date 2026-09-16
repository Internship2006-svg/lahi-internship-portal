const LAHI_PROGRESS = {

  get: function(key) {
    return localStorage.getItem("lahi_" + key);
  },

  set: function(key, value) {
    localStorage.setItem("lahi_" + key, value);
  },

  done: function(key) {
    return this.get(key) === "complete";
  },

  complete: function(key) {
    this.set(key, "complete");
  }

};


/* ==========================================
   CHECK WHETHER A MISSION IS UNLOCKED
========================================== */

function missionUnlocked(missionNumber) {

  /*
   * Mission 1 is ALWAYS unlocked.
   */

  if (missionNumber === 1) {
    return true;
  }


  /*
   * Every other mission requires
   * the previous mission to be completed.
   */

  return LAHI_PROGRESS.done(
    "mission" + (missionNumber - 1)
  );

}


/* ==========================================
   COMPLETE A MISSION
========================================== */

function completeMission(missionNumber) {

  const missionKey =
    "mission" + missionNumber;


  /*
   * Don't award XP twice.
   */

  if (
    !LAHI_PROGRESS.done(missionKey)
  ) {

    LAHI_PROGRESS.complete(
      missionKey
    );


    let xp =
      Number(
        localStorage.getItem("lahiXP") || 0
      );


    xp += 25;


    localStorage.setItem(
      "lahiXP",
      xp
    );


    /*
     * Keep separate XP protection flag.
     */

    localStorage.setItem(
      "lahi_mission" + missionNumber + "_xp",
      "1"
    );

  }


  /*
   * Backward compatibility for Mission 1.
   */

  if (missionNumber === 1) {

    localStorage.setItem(
      "lahiPrepareDone",
      "1"
    );

  }

}


/* ==========================================
   OPEN MISSION
========================================== */

function openMission(
  missionNumber,
  page
) {

  if (
    missionUnlocked(missionNumber)
  ) {

    window.location.href =
      page;

  } else {

    alert(
      "🔒 Complete the previous mission first!"
    );

  }

}


/* ==========================================
   NAVIGATION
========================================== */

function goToJourney() {

  window.location.href =
    "journey.html";

}


function goHome() {

  window.location.href =
    "index.html";

}
