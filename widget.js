const activities = [
  "15 squats",
  "8 armstrækninger",
  "30 sek vejrtrækning",
  "50 skridt",
  "20 sek nakke-stræk"
];

const pick = () =>
  activities[Math.floor(Math.random() * activities.length)];

const log = () => {
  const e = JSON.parse(localStorage.getItem("events") || "[]");
  e.push(Date.now());
  localStorage.setItem("events", JSON.stringify(e));
};

function show() {
  document.getElementById("activity-text").textContent =
    "Din aktivitet: " + pick();

  document.getElementById("pause-overlay").style.display = "block";
  document.getElementById("status-text").style.display = "none";

  log();
}

function hide() {
  document.getElementById("pause-overlay").style.display = "none";
  document.getElementById("status-text").style.display = "block";
}

document.getElementById("done-btn").onclick = hide;

document.getElementById("snooze-btn").onclick = () => {
  hide();
  setTimeout(show, 5 * 60 * 1000);
};

// Sprint 0 test-interval: 30 sek
setInterval(show, 30 * 1000);

// Manuel test i konsol
window.showPlugPause = show;

