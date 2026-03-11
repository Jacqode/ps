// ---------------------------------------------------------
// Plug & Pause – Admin Dashboard (robust, defensive)
// ---------------------------------------------------------

const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
const TEAM = "løverne"; // midlertidigt hardcoded

function safeLog(...args) {
  if (window.console && console.log) console.log(...args);
}

// Destroy or update charts safely
function createOrUpdateChart(canvasEl, config) {
  if (!canvasEl) return null;
  try {
    if (canvasEl.__chartInstance) {
      canvasEl.__chartInstance.destroy();
      canvasEl.__chartInstance = null;
    }
  } catch (e) {
    safeLog("Error destroying chart:", e);
  }
  try {
    const ctx = canvasEl.getContext("2d");
    const chart = new Chart(ctx, config);
    canvasEl.__chartInstance = chart;
    return chart;
  } catch (e) {
    safeLog("Error creating chart:", e);
    return null;
  }
}

// Helper functions for Anhøj series
function median(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function countCrossings(values, med) {
  if (!Array.isArray(values) || values.length < 2) return 0;
  let crossings = 0;
  for (let i = 1; i < values.length; i++) {
    if ((values[i - 1] < med && values[i] > med) || (values[i - 1] > med && values[i] < med)) crossings++;
  }
  return crossings;
}

function longestRun(values, med) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  let longest = 0, current = 0, lastSide = null;
  values.forEach(v => {
    const side = v > med ? "above" : v < med ? "below" : "on";
    if (side === lastSide && side !== "on") current++; else current = side === "on" ? 0 : 1;
    lastSide = side;
    if (current > longest) longest = current;
  });
  return longest;
}

function variationAssessment(crossings, n) {
  if (!n || n < 2) return "Ikke nok data til vurdering";
  const expected = Math.floor((n - 1) / 2);
  return crossings < expected * 0.5 ? "Ikke-tilfældig variation (procesændring sandsynlig)" : "Tilfældig variation (normal variation)";
}

// Load feed
async function loadFeed() {
  try {
    const res = await fetch(`${API_BASE}/api/team/feed?team=${encodeURIComponent(TEAM)}`);
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
    const data = await res.json();
    safeLog("feed response:", data);

    const feedEl = document.getElementById("feed");
    if (!Array.isArray(data) || data.length === 0) {
      feedEl.textContent = "Ingen feed‑data.";
      return;
    }

    feedEl.innerHTML = data.map(item => {
      const time = item?.created_at ? new Date(item.created_at).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }) : "ukendt tid";
      return `<div class="feed-item"><strong>${item.name || "Ukendt"}</strong> kl. ${time}: ${item.activity || ""}</div>`;
    }).join("");
  } catch (err) {
    safeLog("loadFeed error:", err);
    const feedEl = document.getElementById("feed");
    if (feedEl) feedEl.textContent = "Fejl ved indlæsning af feed.";
  }
}

// Load stats and draw charts
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/team/stats?team=${encodeURIComponent(TEAM)}`);
    if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
    const raw = await res.json();
    safeLog("raw stats response:", raw);

    // Normaliser forskellige mulige strukturer
    const payload = raw?.data || raw || {};
    const breaksPerUser =
      Array.isArray(payload.breaks_per_user) ? payload.breaks_per_user :
      Array.isArray(payload.breaksPerUser) ? payload.breaksPerUser :
      Array.isArray(payload.users) ? payload.users :
      [];
    const breaksPerDay =
      Array.isArray(payload.breaks_per_day) ? payload.breaks_per_day :
      Array.isArray(payload.breaksPerDay) ? payload.breaksPerDay :
      Array.isArray(payload.days) ? payload.days :
      [];
    const totalBreaks =
      typeof payload.total_breaks !== "undefined" ? payload.total_breaks :
      typeof payload.totalBreaks !== "undefined" ? payload.totalBreaks :
      "–";

    // Update total
    const totalEl = document.getElementById("totalBreaks");
    if (totalEl) totalEl.textContent = `Total breaks: ${totalBreaks}`;

    // Chart 1: per user
    createOrUpdateChart(document.getElementById("perUserChart"), {
      type: "bar",
      data: {
        labels: breaksPerUser.map(u => u?.name || "Ukendt"),
        datasets: [{ label: "Breaks pr. bruger", data: breaksPerUser.map(u => Number(u?.count) || 0), backgroundColor: "#4CAF50" }]
      },
      options: { responsive: true }
    });

    // Chart 2: per day
    createOrUpdateChart(document.getElementById("perDayChart"), {
      type: "line",
      data: {
        labels: breaksPerDay.map(d => d?.day || ""),
        datasets: [{ label: "Breaks pr. dag", data: breaksPerDay.map(d => Number(d?.count) || 0), borderColor: "#2196F3", fill: false }]
      },
      options: { responsive: true }
    });

    // Series chart (Anhøj)
    const dailyCounts = breaksPerDay.map(d => Number(d?.count) || 0);
    if (dailyCounts.length === 0) {
      const statsEl = document.getElementById("seriesStats");
      if (statsEl) statsEl.innerHTML = "<p>Ingen daglige data til seriediagram.</p>";
      createOrUpdateChart(document.getElementById("seriesChart"), { type: "line", data: { labels: [], datasets: [] }, options: {} });
      return;
    }

    const med = median(dailyCounts);
    const crossings = countCrossings(dailyCounts, med);
    const runLength = longestRun(dailyCounts, med);
    const assessment = variationAssessment(crossings, dailyCounts.length);

    const statsEl = document.getElementById("seriesStats");
    if (statsEl) statsEl.innerHTML = `
      <p><strong>Median:</strong> ${med}</p>
      <p><strong>Kryds over median:</strong> ${crossings}</p>
      <p><strong>Længste serie:</strong> ${runLength}</p>
      <p><strong>Vurdering:</strong> ${assessment}</p>
    `;

    createOrUpdateChart(document.getElementById("seriesChart"), {
      type: "line",
      data: {
        labels: breaksPerDay.map(d => d?.day || ""),
        datasets: [
          { label: "Pauser pr. dag", data: dailyCounts, borderColor: "#673ab7", borderWidth: 2, fill: false, tension: 0.1 },
          { label: "Median", data: Array(dailyCounts.length).fill(med), borderColor: "#ff3b30", borderDash: [5,5], borderWidth: 2, fill: false }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } } }
    });

  } catch (err) {
    safeLog("loadStats error:", err);
    const totalEl = document.getElementById("totalBreaks");
    if (totalEl) totalEl.textContent = "Total breaks: fejl";
    const statsEl = document.getElementById("seriesStats");
    if (statsEl) statsEl.textContent = "Fejl ved indlæsning af statistik.";
  }
}

// Init when DOM ready
window.addEventListener("DOMContentLoaded", () => {
  safeLog("DOM ready — starting loadFeed/loadStats");
  loadFeed();
  loadStats();
});
