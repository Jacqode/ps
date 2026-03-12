// ---------------------------------------------------------
// Plug & Pause – Widget (robust, minimal)
// ---------------------------------------------------------

const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
let TEAM = "løverne";
let USER = "Jakob";

// DOM refs (initialized on DOMContentLoaded)
let getBtn, doneBtn, activityText, activityBox, feedbackBox, feedEl, statsEl;

function safeLog(...args) { if (console && console.log) console.log(...args); }

async function fetchJSON(url, opts) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    safeLog("fetchJSON error:", err, url);
    throw err;
  }
}

async function getActivity() {
  try {
    const res = await fetchJSON(`${API_BASE}/api/activity/random?team=${encodeURIComponent(TEAM)}&user=${encodeURIComponent(USER)}`);
    safeLog("getActivity response:", res);

    // Support different response shapes
    const activity = res?.activity || res?.data?.activity || (typeof res === "string" ? res : null);
    if (!activity) {
      activityText.textContent = "Ingen aktivitet tilgængelig.";
      return;
    }

    activityText.textContent = activity;
    activityBox.style.display = "block";
    doneBtn.style.display = "inline-block";
    feedbackBox.style.display = "none";

    // Optionally refresh feed/stats
    loadFeed();
    loadStats();

  } catch (err) {
    activityText.textContent = "Fejl ved hentning af aktivitet.";
  }
}

async function completeActivity() {
  try {
    await fetchJSON(`${API_BASE}/api/activity/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team: TEAM, user: USER })
    });

    activityBox.style.display = "none";
    feedbackBox.textContent = "Godt klaret! Fortsæt den gode vane 💪";
    feedbackBox.style.display = "block";

    // hide feedback after a while
    setTimeout(() => { feedbackBox.style.display = "none"; }, 8000);

    // refresh feed/stats
    loadFeed();
    loadStats();

  } catch (err) {
    safeLog("completeActivity error:", err);
    showToast("Fejl ved registrering af aktivitet.");
  }
}

// --- Feed + Stats (lightweight)
async function loadFeed() {
  try {
    feedEl.innerHTML = '<div class="small">Indlæser…</div>';
    const res = await fetchJSON(`${API_BASE}/api/team/feed?team=${encodeURIComponent(TEAM)}`);
    if (!Array.isArray(res) || res.length === 0) {
      feedEl.innerHTML = '<div class="small">Ingen feed‑data.</div>';
      return;
    }
    feedEl.innerHTML = res.map(item => {
      const time = item?.created_at ? new Date(item.created_at).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }) : "ukendt tid";
      return `<div class="small"><strong>${item.name || "Ukendt"}</strong> kl. ${time}: ${item.activity || ""}</div>`;
    }).join("");
  } catch (err) {
    safeLog("loadFeed error:", err);
    feedEl.innerHTML = '<div class="small">Fejl ved indlæsning af feed.</div>';
  }
}

async function loadStats() {
  try {
    statsEl.textContent = "Indlæser statistik…";
    const raw = await fetchJSON(`${API_BASE}/api/team/stats?team=${encodeURIComponent(TEAM)}`);
    safeLog("stats raw:", raw);

    const payload = raw?.data || raw || {};
    const total = payload.total_breaks ?? payload.totalBreaks ?? "–";
    statsEl.textContent = `Total breaks: ${total}`;
  } catch (err) {
    safeLog("loadStats error:", err);
    statsEl.textContent = "Fejl ved indlæsning af statistik.";
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Initialize after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // DOM refs
  getBtn = document.getElementById("getActivityBtn");
  doneBtn = document.getElementById("doneBtn");
  activityText = document.getElementById("activityText");
  activityBox = document.getElementById("activityBox");
  feedbackBox = document.getElementById("feedbackBox");
  feedEl = document.getElementById("feed");
  statsEl = document.getElementById("stats");

  // Load saved settings if present
  const savedName = localStorage.getItem("userName");
  const savedTeam = localStorage.getItem("teamName");
  if (savedName) USER = savedName;
  if (savedTeam) TEAM = savedTeam;

  // Attach events (guard if elements missing)
  if (getBtn) getBtn.addEventListener("click", getActivity);
  if (doneBtn) doneBtn.addEventListener("click", completeActivity);

  // Initial load
  loadFeed();
  loadStats();
});
