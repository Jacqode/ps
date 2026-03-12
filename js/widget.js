// ---------------------------------------------------------
// Plug & Pause – Widget (URL‑styret team, ingen indstillinger)
// ---------------------------------------------------------

const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

// TEAM fra URL → fallback til "kk"
const urlParams = new URLSearchParams(window.location.search);
let TEAM = urlParams.get("team") || "kk";

// Brugeren kan ikke ændre navn, så vi bruger en simpel default
let USER = "buddy";

// DOM refs
let getBtn, doneBtn, activityText, activityBox, feedbackBox, feedEl, statsEl;

function safeLog(...args) {
  if (console && console.log) console.log(...args);
}

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

// ---------------------------------------------------------
// Hent aktivitet
// ---------------------------------------------------------
async function getActivity() {
  try {
    const res = await fetchJSON(
      `${API_BASE}/api/activity/random?team=${encodeURIComponent(TEAM)}&user=${encodeURIComponent(USER)}`
    );

    const activity =
      res?.activity ||
      res?.data?.activity ||
      (typeof res === "string" ? res : null);

    if (!activity) {
      activityText.textContent = "Ingen aktivitet tilgængelig.";
      activityBox.style.display = "block";
      return;
    }

    activityText.textContent = activity;
    activityBox.style.display = "block";
    doneBtn.style.display = "inline-block";
    feedbackBox.style.display = "none";

    loadFeed();
    loadStats();
  } catch (err) {
    activityText.textContent = "Fejl ved hentning af aktivitet.";
    activityBox.style.display = "block";
  }
}

// ---------------------------------------------------------
// Markér aktivitet som færdig
// ---------------------------------------------------------
async function completeActivity() {
  try {
    await fetchJSON(`${API_BASE}/api/activity/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team: TEAM, user: USER })
    });

    activityBox.style.display = "none";
    feedbackBox.textContent = "Godt klaret! 💪";
    feedbackBox.style.display = "block";

    setTimeout(() => (feedbackBox.style.display = "none"), 6000);

    loadFeed();
    loadStats();
  } catch (err) {
    safeLog("completeActivity error:", err);
    showToast("Fejl ved registrering af aktivitet.");
  }
}

// ---------------------------------------------------------
// Feed
// ---------------------------------------------------------
async function loadFeed() {
  try {
    feedEl.innerHTML = "<div class='small'>Indlæser…</div>";

    const res = await fetchJSON(
      `${API_BASE}/api/team/feed?team=${encodeURIComponent(TEAM)}`
    );

    if (!Array.isArray(res) || res.length === 0) {
      feedEl.innerHTML = "<div class='small'>Ingen feed‑data.</div>";
      return;
    }

    feedEl.innerHTML = res
      .map((item) => {
        const time = item?.created_at
          ? new Date(item.created_at).toLocaleTimeString("da-DK", {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "ukendt tid";

        return `<div class="small"><strong>${item.name || "Ukendt"}</strong> kl. ${time}: ${item.activity || ""}</div>`;
      })
      .join("");
  } catch (err) {
    feedEl.innerHTML = "<div class='small'>Fejl ved indlæsning af feed.</div>";
  }
}

// ---------------------------------------------------------
// Stats
// ---------------------------------------------------------
async function loadStats() {
  try {
    statsEl.textContent = "Indlæser statistik…";

    const raw = await fetchJSON(
      `${API_BASE}/api/team/stats?team=${encodeURIComponent(TEAM)}`
    );

    const payload = raw?.data || raw || {};
    const total = payload.total_breaks ?? payload.totalBreaks ?? "–";

    statsEl.textContent = `Total breaks: ${total}`;
  } catch (err) {
    statsEl.textContent = "Fejl ved indlæsning af statistik.";
  }
}

// ---------------------------------------------------------
// Toast
// ---------------------------------------------------------
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  getBtn = document.getElementById("getActivityBtn");
  doneBtn = document.getElementById("doneBtn");
  activityText = document.getElementById("activityText");
  activityBox = document.getElementById("activityBox");
  feedbackBox = document.getElementById("feedbackBox");
  feedEl = document.getElementById("feed");
  statsEl = document.getElementById("stats");

  getBtn.addEventListener("click", getActivity);
  doneBtn.addEventListener("click", completeActivity);

  loadFeed();
  loadStats();
});
