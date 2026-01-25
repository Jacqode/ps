// Hjælpefunktion: formater timestamp til menneskelig tid (bruges ikke i visning, men kan være nyttig)
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

// Hent events
const events = JSON.parse(localStorage.getItem("events") || "[]");

// Beregn intervaller i minutter
const intervals = [];
for (let i = 1; i < events.length; i++) {
  const diffMs = events[i] - events[i - 1];
  intervals.push(Math.round(diffMs / 60000));
}

// Anhøj-SPC
let median = null;
let mrMedian = null;
let ucl = null;
let latest = null;

if (intervals.length > 1) {
  const sorted = [...intervals].sort((a, b) => a - b);
  median = sorted[Math.floor(sorted.length / 2)];

  const mr = [];
  for (let i = 1; i < intervals.length; i++) {
    mr.push(Math.abs(intervals[i] - intervals[i - 1]));
  }

  const mrSorted = [...mr].sort((a, b) => a - b);
  mrMedian = mrSorted[Math.floor(mrSorted.length / 2)];

  ucl = median + mrMedian / 1.128;
  latest = intervals[intervals.length - 1];

  const result = {
    median,
    mrMedian,
    ucl,
    seneste_interval: latest,
    status: latest > ucl ? "OUT OF CONTROL" : "IN CONTROL"
  };

  // Vis SPC-resultat
  document.getElementById("spc").textContent =
    JSON.stringify(result, null, 2);

  // Summary‑sektion
  const summary = document.getElementById("summary");

  summary.innerHTML = `
    <p><strong>Events:</strong> ${events.length} — <strong>Intervaller:</strong> ${intervals.length}</p>

    <p style="font-weight:bold; color:${result.status === "IN CONTROL" ? "green" : "red"};">
      ${result.status === "IN CONTROL" ? "Rytmen er stabil." : "Du har haft en længere pause end normalt."}
    </p>

    <p>Seneste pause: ${latest} min siden</p>
    <p>Næste pause forventes inden for ${Math.round(ucl)} min</p>
  `;
} else {
  document.getElementById("spc").textContent =
    "Ikke nok data til SPC endnu.";
}

// Graf (Sprint 3)
if (intervals.length > 0) {
  const ctx = document.getElementById("intervalChart").getContext("2d");

  const labels = intervals.map((_, i) => `#${i + 1}`);
  const colors = intervals.map(v => (ucl && v > ucl ? "red" : "green"));

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Intervaller (minutter)",
          data: intervals,
          borderColor: "#333",
          backgroundColor: colors,
          pointBackgroundColor: colors,
          pointRadius: 5,
          tension: 0.2
        },
        {
          label: "Median",
          data: intervals.map(() => median),
          borderColor: "blue",
          borderDash: [5, 5],
          pointRadius: 0
        },
        {
          label: "UCL",
          data: intervals.map(() => ucl),
          borderColor: "red",
          borderDash: [5, 5],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
