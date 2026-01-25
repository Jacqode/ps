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

// Step 5: Vis antal events og intervaller
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

  // Ekstra: vis en kort, menneskelig status
  const statusLine = document.createElement("p");
  statusLine.textContent =
    result.status === "IN CONTROL"
      ? "Rytmen er stabil."
      : "Du har haft en længere pause end normalt.";

  document.body.appendChild(statusLine);

} else {
  document.getElementById("spc").textContent =
    "Ikke nok data til SPC endnu.";
}
