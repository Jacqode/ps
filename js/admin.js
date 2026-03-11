// ---------------------------------------------------------
// Plug & Pause – Admin Dashboard (robust version)
// ---------------------------------------------------------

const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
const TEAM = "løverne"; // midlertidigt hardcoded

// ---------------------------------------------------------
// LOGGING HELPER
// ---------------------------------------------------------
function safeLog(...args) {
  if (window.console && console.log) console.log(...args);
}

// ---------------------------------------------------------
// LOAD FEED
// ---------------------------------------------------------
async function loadFeed() {
  try {
    const res = await fetch(`${API_BASE}/api/team/feed?team=${TEAM}`);
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
    const data = await res.json();
    safeLog("feed response:", data);

    const feedEl = document.getElementById("feed");
    if (!Array.isArray(data) || data.length === 0) {
      feedEl.textContent = "Ingen feed‑data.";
      return;
    }

    feedEl.innerHTML = data.map(item => {
      const time = new Date(item.created_at).toLocaleTimeString("da-DK", {
        hour: "2-digit",
        minute: "2-digit"
      });
      return `<div class="feed-item"><strong>${item.name}</strong> kl. ${time}: ${item.activity}</div>`;
    }).join("");
  } catch (err) {
    safeLog("loadFeed error:", err);
    const feedEl = document.getElementById("feed");
    feedEl.textContent = "Fejl ved indlæsning af feed.";
  }
}

// ---------------------------------------------------------
// HELPER FUNCTIONS FOR ANHØJ SERIES DIAGRAM
// ---------------------------------------------------------
function median(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function countCrossings(values, med) {
  if (!Array.isArray(values) || values.length < 2) return 0;
  let crossings = 0;
  for (let i = 1; i < values.length; i++) {
    if ((values[i - 1] < med && values[i] > med) ||
        (values[i - 1] > med && values[i] < med)) {
      crossings++;
    }
  }
  return crossings;
}

function longestRun(values, med) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  let longest = 0;
  let current = 0;
  let lastSide = null;

  values.forEach(v => {
    const side = v > med ? "above" : v < med ? "below" : "on";

    if (side === lastSide && side !== "on") {
      current++;
    } else {
      current = side === "on" ? 0 : 1;
      lastSide = side;
    }

    if (current > longest) longest = current;
  });

  return longest;
}

function variationAssessment(crossings, n) {
  if (!n || n < 2) return "Ikke nok data til vurdering";
  const expected = Math.floor((n - 1) / 2);
  return crossings < expected * 0.5
    ? "Ikke-tilfældig variation (procesændring sandsynlig)"
    : "Tilfældig variation (normal variation)";
}

// ---------------------------------------------------------
// SAFE CHART CREATION (destroy existing if present)
// ---------------------------------------------------------
function createOrUpdateChart(canvasEl, config) {
  if (!canvasEl) return null;
  // Chart.js stores instance on canvasEl.__chartInstance (custom)
  if (canvasEl.__chartInstance) {
    try { canvasEl.__chartInstance.destroy(); } catch (e) { safeLog("destroy chart error", e); }
    canvasEl.__chartInstance = null;
  }
  const ctx = canvasEl.getContext("2d");
  const chart = new Chart(ctx, config);
  canvasEl.__chartInstance = chart;
  return chart;
}

// ---------------------------------------------------------
// LOAD STATS + ALL CHARTS
// ---------------------------------------------------------
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/team/stats?team=${TEAM}`);
    if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
    const stats = await res.json();
    safeLog("stats response:", stats);

    // Defensive defaults
    const breaksPerUser = Array.isArray(stats?.breaks_per_user) ? stats.breaks_per_user : [];
    const breaksPerDay = Array.isArray(stats?.breaks_per_day) ? stats.breaks_per_day : [];

    // Update total
    const totalText = typeof stats?.total_breaks !== "undefined" ? stats.total_breaks : "–";
    document.getElementById("totalBreaks").textContent = `Total breaks: ${totalText}`;

    // CHART 1: Breaks per user (bar)
    createOrUpdateChart(document.getElementById("perUserChart"), {
      type: "bar",
      data: {
        labels: breaksPerUser.map(u => u.name || "Ukendt"),
        datasets: [{
          label: "Breaks pr. bruger",
          data: breaksPerUser.map(u => Number(u.count) || 0),
          backgroundColor: "#4CAF50"
        }]
      },
      options: { responsive: true }
    });

    // CHART 2: Breaks per day (line)
    createOrUpdateChart(document.getElementById("perDayChart"), {
      type: "line",
      data: {
        labels: breaksPerDay.map(d => d.day || ""),
        datasets: [{
          label: "Breaks pr. dag",
          data: breaksPerDay.map(d => Number(d.count) || 0),
          borderColor: "#2196F3",
          fill: false
        }]
      },
      options: { responsive: true }
    });

    // CHART 3: Seriediagram (Anhøj)
    const dailyCounts = breaksPerDay.map(d => Number(d.count) || 0);
    if (dailyCounts.length === 0) {
      document.getElementById("seriesStats").innerHTML = "<p>Ingen daglige data til seriediagram.</p>";
      // clear seriesChart if exists
      createOrUpdateChart(document.getElementById("seriesChart"), {
        type: "line",
        data: { labels: [], datasets: [] },
        options: {}
      });
      return;
    }

    const med = median(dailyCounts);
    const crossings = countCrossings(dailyCounts, med);
    const runLength = longestRun(dailyCounts, med);
    const assessment = variationAssessment(crossings, dailyCounts.length);

    document.getElementById("seriesStats").innerHTML = `
      <p><strong>Median:</strong> ${med}</p>
      <p><strong>Kryds over median:</strong> ${crossings}</p>
      <p><strong>Længste serie:</strong> ${runLength}</p>
      <p><strong>Vurdering:</strong> ${assessment}</p>
    `;

    createOrUpdateChart(document.getElementById("seriesChart"), {
      type: "line",
      data: {
        labels: breaksPerDay.map(d => d.day || ""),
        datasets: [
          {
            label: "Pauser pr. dag",
            data: dailyCounts,
            borderColor: "#673ab7",
            borderWidth: 2,
            fill: false,
            tension: 0.1
          },
          {
            label: "Median",
            data: Array(dailyCounts.length).fill(med),
            borderColor: "#ff3b30",
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } }
      }
    });

  } catch (err) {
    safeLog("loadStats error:", err);
    document.getElementById("totalBreaks").textContent = "Total breaks: fejl";
    document.getElementById("seriesStats").textContent = "Fejl ved indlæsning af statistik.";
  }
}

// ---------------------------------------------------------
// INIT when DOM ready
// ---------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  safeLog("DOM ready — starting loadFeed/loadStats");
  loadFeed();
  loadStats();
});
