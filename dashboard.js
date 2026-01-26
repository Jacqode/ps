async function loadStats() {
  const res = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/stats?companyId=TEST");
  return res.json();
}

// Gruppér timestamps pr. dag
function groupByDay(events) {
  const days = {};
  events.forEach(ts => {
    const date = new Date(ts).toISOString().split("T")[0];
    days[date] = (days[date] || 0) + 1;
  });
  return days;
}

// Beregn median
function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Find længste serie på samme side af medianen
function longestRun(values, med) {
  let longest = 0;
  let current = 0;

  values.forEach(v => {
    if (v > med) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });

  return longest;
}

// Tæl kryds over medianen
function countCrossings(values, med) {
  let crossings = 0;
  for (let i = 1; i < values.length; i++) {
    if ((values[i - 1] > med && values[i] < med) ||
        (values[i - 1] < med && values[i] > med)) {
      crossings++;
    }
  }
  return crossings;
}

// Tegn graf
function drawChart(labels, values, med) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const max = Math.max(...values, med);
  const scale = (canvas.height - 20) / max;

  // Medianlinje
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - med * scale);
  ctx.lineTo(canvas.width, canvas.height - med * scale);
  ctx.stroke();

  // Datapunkter
  ctx.strokeStyle = "black";
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = (canvas.width / (values.length - 1)) * i;
    const y = canvas.height - v * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

async function renderDashboard() {
  const stats = await loadStats();
  const events = stats.allEvents; // Husk at tilføje dette i Worker

  const grouped = groupByDay(events);
  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  const med = median(values);
  const run = longestRun(values, med);
  const crossings = countCrossings(values, med);

  // Vurdering efter forbedringsmodellen
  let assessment = "";
  if (run >= 8) {
    assessment = "Ikke-tilfældig variation: mulig forbedring eller forværring.";
  } else if (crossings <= 2) {
    assessment = "Ikke-tilfældig variation: procesændring mistænkes.";
  } else {
    assessment = "Tilfældig variation: processen er stabil.";
  }

  document.getElementById("assessment").textContent = assessment;

  // Listevisning
  const list = document.getElementById("dailyList");
  list.innerHTML = labels.map((d, i) => `${d}: ${values[i]} pauser`).join("<br>");

  // Tegn graf
  drawChart(labels, values, med);
}

renderDashboard();
