const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
const TEAM = "kk";

const activityBtn = document.getElementById("activity-btn");
const activityBox = document.getElementById("activity-box");

async function getRandomActivity() {
  try {
    const res = await fetch(`${API_BASE}/api/team/feed?team=${TEAM}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      activityBox.textContent = "Ingen aktivitet.";
      return;
    }

    const random = data[Math.floor(Math.random() * data.length)];
    activityBox.textContent = random.activity;
  } catch {
    activityBox.textContent = "Fejl ved hentning.";
  }
}

activityBtn.addEventListener("click", getRandomActivity);
