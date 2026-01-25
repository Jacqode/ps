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

// Midlertidig SPC-tekst (Step 3 kommer)
document.getElementById("spc").textContent =
  "SPC-beregning kommer i næste step.";
