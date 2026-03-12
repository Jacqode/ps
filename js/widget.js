// -------------------------
// Konfiguration
// -------------------------
const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
let TEAM = null;

// Hent team fra URL
function getTeamFromURL() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("team") || "").trim().toLowerCase();
}

// -------------------------
// DOM referencer
// -------------------------
const feedList = document.getElementById("feed-list");
const statsTotal = document.getElementById("stats-total");
const statsUsers = document.getElementById("stats-users");
const activityBox = document.getElementById("activity-box");
const activityBtn = document.getElementById("activity-btn");

// -------------------------
// FEED
// -------------------------
async function loadFeed() {
  try {
    const res = await fetch(`${API_BASE}/api/team/feed?team=${TEAM}`);
    const data = await res.json();

    feedList.innerHTML = "";

    if (!data.length) {
      feedList.innerHTML = "<li>Ingen aktivitet endnu.</li>";
      return;
    }

    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name}: ${item.activity}`;
      feedList.appendChild(li);
    });
  } catch (err) {
    feedList.innerHTML = "<li>Fejl ved hentning af feed.</li>";
  }
}

// -------------------------
// STATS
// -------------------------
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/team/stats?team=${TEAM}`);
    const data = await res.json();

    statsTotal.textContent = data.total_breaks ?? 0;

    statsUsers.innerHTML = "";
    (data.breaks_per_user || []).forEach(u => {
      const li = document.createElement("li");
      li.textContent = `${u.name}: ${u.count}`;
      statsUsers.appendChild(li);
    });
  } catch (err) {
    statsTotal.textContent = "0";
    statsUsers.innerHTML = "<li>Fejl ved hentning af statistik.</li>";
  }
}

// -------------------------
// RANDOM ACTIVITY
// -------------------------
async function fetchRandomActivity() {
  try {
    const res = await fetch(`${API_BASE}/api/team/feed?team=${TEAM}`);
    const data = await res.json();

    if (!data.length) {
      activityBox.textContent = "Ingen aktivitet tilgængelig.";
      return;
    }

    const random = data[Math.floor(Math.random() * data.length)];
    activityBox.textContent = random.activity || "Ingen aktivitet.";
  } catch (err) {
    activityBox.textContent = "Fejl ved hentning af aktivitet.";
  }
}

// -------------------------
// INIT
// -------------------------
async function init() {
  TEAM = getTeamFromURL();
  if (!TEAM) {
    alert("Team mangler i URL. Brug ?team=kk");
    return;
  }

  await loadFeed();
  await loadStats();

  activityBtn.addEventListener("click", fetchRandomActivity);
}

init();
