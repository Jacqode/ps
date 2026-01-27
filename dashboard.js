import { median, renderChart } from "./chart.js";

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

  // Tegn graf med Chart.js
  renderChart(labels, values);
}

renderDashboard();
