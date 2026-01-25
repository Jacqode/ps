// Hent events fra localStorage
const events = JSON.parse(localStorage.getItem("events") || "[]");

// Vis rå data
document.getElementById("raw").textContent =
  JSON.stringify(events, null, 2);

// Beregn intervaller i minutter
const intervals = [];
for (let i = 1; i < events.length; i++) {
  const diffMs = events[i] - events[i - 1];
  intervals.push(Math.round(diffMs / 60000)); // minutter
}

// Vis intervaller
document.getElementById("intervals").textContent =
  JSON.stringify(intervals, null, 2);

// Sprint 2: Vis antal events og intervaller
const counts = document.createElement("p");
counts.textContent =
  `Events: ${events.length} — Intervaller: ${intervals.length}`;
document.body.appendChild(counts);

// Anhøj-SPC: Median + MR/1.128
if (intervals.length > 1) {
  // Median
  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // Moving Range (MR)
  const mr = [];
  for (let i = 1; i < intervals.length; i++) {
    mr.push(Math.abs(intervals[i] - intervals[i - 1]));
  }

  const mrSorted = [...mr].sort((a, b) => a - b);
  const mrMedian = mrSorted[Math.floor(mrSorted.length / 2)];

  // Upper Control Limit
  const ucl = median + mrMedian / 1.128;

  const latest = intervals[intervals.length - 1];

  const result = {
    median,
    mrMedian,
    ucl,
    seneste_interval: latest,
    status: latest > ucl ? "OUT OF CONTROL" : "IN CONTROL"
  };

  document.getElementById("spc").textContent =
    JSON.stringify(result, null, 2);

  // Sprint 2: Menneskelig status + farvekode
  const statusLine = document.createElement("p");
  statusLine.textContent =
    result.status === "IN CONTROL"
      ? "Rytmen er stabil."
      : "Du har haft en længere pause end normalt.";

  statusLine.style.fontWeight = "bold";
  statusLine.style.color =
    result.status === "IN CONTROL" ? "green" : "red";

  document.body.appendChild(statusLine);

  // Sprint 2: Seneste pause
  const lastPause = document.createElement("p");
  lastPause.textContent = `Seneste pause: ${latest} min siden`;
  document.body.appendChild(lastPause);

  // Sprint 2: Næste pause (estimat)
  const nextPause = document.createElement("p");
  nextPause.textContent =
    `Næste pause forventes inden for ${Math.round(ucl)} min`;
  document.body.appendChild(nextPause);

} else {
  document.getElementById("spc").textContent =
    "Ikke nok data til SPC endnu.";
}
