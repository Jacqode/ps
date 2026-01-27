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

  const padding = 50;
  const w = canvas.width - padding * 2;
  const h = canvas.height - padding * 2;

  const max = Math.max(...values, med);
  const scaleY = h / max;
  const stepX = w / (values.length - 1);

  // --- GRIDLINES ---
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  for (let i = 0; i <= max; i++) {
    const y = canvas.height - padding - i * scaleY;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }

  // --- Y-akse tal ---
  ctx.fillStyle = "black";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= max; i++) {
    const y = canvas.height - padding - i * scaleY;
    ctx.fillText(i, padding - 10, y);
  }

  // --- X-akse labels (datoer) ---
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  labels.forEach((label, i) => {
    const x = padding + i * stepX;
    ctx.fillText(label, x, canvas.height - padding + 5);
  });

  // --- Medianlinje ---
  const medianY = canvas.height - padding - med * scaleY;
  ctx.strokeStyle = "red";
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(padding, medianY);
  ctx.lineTo(canvas.width - padding, medianY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Median label
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(`Median: ${med}`, padding + 5, medianY - 5);

  // --- Datakurve ---
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = padding + i * stepX;
    const y = canvas.height - padding - v * scaleY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // --- Punkter ---
  ctx.fillStyle = "blue";
  values.forEach((v, i) => {
    const x = padding + i * stepX;
    const y = canvas.height - padding - v * scaleY;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // --- Aksetitler ---
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  // X-akse titel
  ctx.fillText("Dato", canvas.width / 2, canvas.height - 10);

  // Y-akse titel (lodret)
  ctx.save();
  ctx.translate(15, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Antal pauser", 0, 0);
  ctx.restore();
}

async function renderDashboard() {
  const stats = await loadStats();
  const events = stats.allEvents;

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
