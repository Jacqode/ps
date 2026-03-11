// ---------------------------------------------------------
// Plug & Pause – Admin Dashboard
// ---------------------------------------------------------

const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
const TEAM = "løverne"; // midlertidigt hardcoded

// ---------------------------------------------------------
// LOAD FEED
// ---------------------------------------------------------
async function loadFeed() {
  const res = await fetch(`${API_BASE}/api/team/feed?team=${TEAM}`);
  const data = await res.json();

  const feedEl = document.getElementById("feed");
  feedEl.innerHTML = data.map(item => {
    const time = new Date(item.created_at).toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return `<div class="feed-item"><strong>${item.name}</strong> kl. ${time}: ${item.activity}</div>`;
  }).join("");
}

// ---------------------------------------------------------
// HELPER FUNCTIONS FOR ANHØJ SERIES DIAGRAM
// ---------------------------------------------------------
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function countCrossings(values, med) {
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
  const expected = Math.floor((n - 1) / 2);
  return crossings < expected * 0.5
    ? "Ikke-tilfældig variation (procesændring sandsynlig)"
    : "Tilfældig variation (normal variation)";
}

// ---------------------------------------------------------
// LOAD STATS + ALL CHARTS
// ---------------------------------------------------------
async function loadStats() {
  const res = await fetch(`${API_BASE}/api/team/stats?team=${TEAM}`);
  const stats = await res.json();

  // Total breaks
  document.getElementById("totalBreaks").textContent =
    `Total breaks: ${stats.total_breaks}`;

  // -------------------------------------------------------
  // CHART 1: Breaks per user (bar)
  // -------------------------------------------------------
  new Chart(document.getElementById("perUserChart"), {
    type: "bar",
    data: {
      labels: stats.breaks_per_user.map(u => u.name),
      datasets: [{
        label: "Breaks pr. bruger",
        data: stats.breaks_per_user.map(u => u.count),
        backgroundColor: "#4CAF50"
      }]
    }
  });

  // -------------------------------------------------------
  // CHART 2: Breaks per day (line)
  // -------------------------------------------------------
  new Chart(document.getElementById("perDayChart"), {
    type: "line",
    data: {
      labels: stats.breaks_per_day.map(d => d.day),
      datasets: [{
        label: "Breaks pr. dag",
        data: stats.breaks_per_day.map(d => d.count),
        borderColor: "#2196F3",
        fill: false
      }]
    }
  });

  // -------------------------------------------------------
  // CHART 3: Seriediagram (Anhøj)
  // -------------------------------------------------------
  const dailyCounts = stats.breaks_per_day.map(d => d.count);
  const med = median(dailyCounts);
  const crossings = countCrossings(dailyCounts, med);
  const runLength = longestRun(dailyCounts, med);
  const assessment = variationAssessment(crossings, dailyCounts.length);

  // Write stats to DOM
  document.getElementById("seriesStats").innerHTML = `
    <p><strong>Median:</strong> ${med}</p>
    <p><strong>Kryds over median:</strong> ${crossings}</p>
    <p><strong>Længste serie:</strong> ${runLength}</p>
    <p><strong>Vurdering:</strong> ${assessment}</p>
  `;

  // Draw series chart
  new Chart(document.getElementById("seriesChart"), {
    type: "line",
    data: {
      labels: stats.breaks_per_day.map(d => d.day),
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
      plugins: {
        legend: { position: "bottom" }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ---------------------------------------------------------
// INIT
// ---------------------------------------------------------
loadFeed();
loadStats();
