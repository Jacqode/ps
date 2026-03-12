// ---------------------------------------------------------
// Plug & Pause – Widget
// ---------------------------------------------------------

const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
const TEAM = "løverne";
const USER = "Jakob"; // midlertidigt

// DOM
const getBtn = document.getElementById("getActivityBtn");
const doneBtn = document.getElementById("doneBtn");
const activityText = document.getElementById("activityText");
const activityBox = document.getElementById("activityBox");
const feedbackBox = document.getElementById("feedbackBox");

// ---------------------------------------------------------
// HENT AKTIVITET
// ---------------------------------------------------------
async function getActivity() {
  try {
    const res = await fetch(`${API_BASE}/api/activity/random?team=${TEAM}&user=${USER}`);
    const data = await res.json();

    if (!data || !data.activity) {
      activityText.textContent = "Ingen aktivitet tilgængelig.";
      return;
    }

    activityText.textContent = data.activity;

    activityBox.style.display = "block";
    doneBtn.style.display = "inline-block";
    feedbackBox.style.display = "none";

  } catch (err) {
    activityText.textContent = "Fejl ved hentning af aktivitet.";
  }
}

// ---------------------------------------------------------
// MARKÉR SOM FÆRDIG
// ---------------------------------------------------------
async function completeActivity() {
  try {
    await fetch(`${API_BASE}/api/activity/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team: TEAM, user: USER })
    });

    activityBox.style.display = "none";
    feedbackBox.style.display = "block";

  } catch (err) {
    console.error("Fejl ved complete:", err);
  }
}

// ---------------------------------------------------------
// EVENTS
// ---------------------------------------------------------
getBtn.addEventListener("click", getActivity);
doneBtn.addEventListener("click", completeActivity);
