// --- Dummy data (pauser pr. dag) ---
// Senere kan du hente dette fra backend
const data = [3, 4, 2, 5, 6, 7, 3, 4, 5, 8, 9, 4, 3, 6, 7];

// --- Beregn median ---
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

const med = median(data);

// --- Beregn kryds over median ---
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

const crossings = countCrossings(data, med);

// --- Beregn længste serie på samme side af median ---
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

const runLength = longestRun(data, med);

// --- Anhøj vurdering (meget forsimplet) ---
function variationAssessment(crossings, n) {
  // Tommelfingerregel: få kryds → ikke-tilfældig variation
  const expected = Math.floor((n - 1) / 2);

  return crossings < expected * 0.5
    ? "Ikke-tilfældig variation (procesændring sandsynlig)"
    : "Tilfældig variation (normal variation)";
}

const assessment = variationAssessment(crossings, data.length);

// --- Indsæt vurdering i DOM ---
document.getElementById("statsOverview").innerHTML = `
  <p><strong>Median:</strong> ${med}</p>
  <p><strong>Kryds over median:</strong> ${crossings}</p>
  <p><strong>Længste serie:</strong> ${runLength}</p>
  <p><strong>Vurdering:</strong> ${assessment}</p>
`;

// --- Tegn seriediagram med Chart.js ---
const ctx = document.getElementById("chartDaily");

new Chart(ctx, {
  type: "line",
  data: {
    labels: data.map((_, i) => `Dag ${i + 1}`),
    datasets: [
      {
        label: "Pauser pr. dag",
        data: data,
        borderColor: "#007aff",
        borderWidth: 2,
        fill: false,
        tension: 0.1
      },
      {
        label: "Median",
        data: Array(data.length).fill(med),
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
