// -------------------------
// Konfiguration
// -------------------------
const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
const DEFAULT_TEAM = "kk"; // fallback hvis ingen team i URL

// Hent team fra URL eller brug default
function getTeamFromURL() {
  const params = new URLSearchParams(window.location.search);
  const t = (params.get("team") || "").trim().toLowerCase();
  return t || DEFAULT_TEAM;
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
// Hjælpere
// -------------------------
function safeText(s) {
  return (s === null || s === undefined) ? "" : String(s);
}

// -------------------------
// FEED
// -------------------------
async function loadFeed(team) {
  try {
    const res = await fetch(`${API_BASE}/api/team/feed?team=${encodeURIComponent(team)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    feedList.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      feedList.innerHTML = "<li>Ingen aktivitet endnu.</li>";
      return data;
    }

    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${safeText(item.name)}: ${safeText(item.activity)}`;
      feedList.appendChild(li);
    });

    return data;
  } catch (err) {
    console.error("loadFeed error:", err);
    feedList.innerHTML = "<li>Fejl ved hentning af feed.</li>";
    return [];
  }
}

// -------------------------
// STATS
// -------------------------
async function loadStats(team) {
  try {
    const res = await fetch(`${API_BASE}/api/team/stats?team=${encodeURIComponent(team)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    statsTotal.textContent = data.total_breaks ?? 0;

    statsUsers.innerHTML = "";
    (data.breaks_per_user || []).forEach(u => {
      const li = document.createElement("li");
      li.textContent = `${safeText(u.name)}: ${safeText(u.count)}`;
      statsUsers.appendChild(li);
    });
  } catch (err) {
    console.error("loadStats error:", err);
    statsTotal.textContent = "0";
    statsUsers.innerHTML = "<li>Fejl ved hentning af statistik.</li>";
  }
}

// -------------------------
// RANDOM ACTIVITY (fra feed)
// -------------------------
async function fetchRandomActivity(team) {
  activityBox.textContent = "Henter…";
  try {
    const data = await loadFeed(team); // genbrug feed-kald (cache ikke håndteres her)
    if (!data || data.length === 0) {
      activityBox.textContent = "Ingen aktivitet tilgængelig.";
      return;
    }
    const random = data[Math.floor(Math.random() * data.length)];
    activityBox.textContent = random.activity || "Ingen aktivitet.";
  } catch (err) {
    console.error("fetchRandomActivity error:", err);
    activityBox.textContent = "Fejl ved hentning af aktivitet.";
  }
}

// -------------------------
// INIT
// -------------------------
async function init() {
  const TEAM = getTeamFromURL();

  // Bind knap tidligt, så den virker selvom loadFeed fejler
  activityBtn.addEventListener("click", () => fetchRandomActivity(TEAM));

  // Indlæs feed og stats (vis initial state)
  await Promise.all([loadFeed(TEAM), loadStats(TEAM)]);
}

// Start
document.addEventListener("DOMContentLoaded", init);
