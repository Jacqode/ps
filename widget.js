// Hent eksisterende events
const events = JSON.parse(localStorage.getItem("events") || "[]");

// Udført-knap
document.getElementById("doneBtn").onclick = () => {
  events.push(Date.now());
  localStorage.setItem("events", JSON.stringify(events));
  document.getElementById("status").textContent = "Pause registreret!";
};

// Snooze-knap
document.getElementById("snoozeBtn").onclick = () => {
  document.getElementById("status").textContent = "Snoozet i 5 minutter.";
};
