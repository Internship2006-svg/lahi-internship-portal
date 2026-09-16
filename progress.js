<nav class="student-nav">

    <a href="index.html">
        🏠 Home
    </a>

    <a href="journey.html">
        🗺️ My Journey
    </a>

    <button onclick="history.back()">
        ← Back
    </button>

</nav>

const LAHI_PROGRESS = {

    get(key) {
        return localStorage.getItem("lahi_" + key);
    },

    set(key, value) {
        localStorage.setItem("lahi_" + key, value);
    },

    done(key) {
        return this.get(key) === "complete";
    },

    complete(key) {
        this.set(key, "complete");
    }
};


// Check whether a mission is unlocked
function missionUnlocked(mission) {

    if (mission === 1) return true;

    return LAHI_PROGRESS.done("mission" + (mission - 1));
}


// Complete mission
function completeMission(missionNumber) {

    const missionKey = "mission" + missionNumber;

    if (!LAHI_PROGRESS.done(missionKey)) {

        LAHI_PROGRESS.complete(missionKey);

        let xp = Number(
            localStorage.getItem("lahiXP") || 0
        );

        xp += 25;

        localStorage.setItem("lahiXP", xp);
    }
}


// Open mission
function openMission(missionNumber, page) {

    if (missionUnlocked(missionNumber)) {

        window.location.href = page;

    } else {

        alert(
            "🔒 Complete the previous mission first!"
        );
    }
}


// Go back to journey
function goToJourney() {

    window.location.href = "journey.html";
}


// Go home
function goHome() {

    window.location.href = "index.html";
}
