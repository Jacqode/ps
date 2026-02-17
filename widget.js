// -----------------------------
// Plug & Pause – widget.js (funktionel version)
// -----------------------------

// ØVELSER (målbruger-tilpasset)
const exercises = {
  siddende: [
    "Siddende nakkerulning – 20 sek",
    "Siddende skulderløft – 15 sek",
    "Siddende åndedrag – 30 sek"
  ],
  nakke: [
    "Nakke stræk – 20 sek",
    "Skulderblade klem – 15 sek",
    "Blød sidebøjning – 20 sek"
  ],
  karate: [
    "Karate-åndedrag – 10 sek",
    "Stå-stærkt-stilling – 15 sek",
    "Blød armcirkel – 20 sek"
  ]
};

// UI-elementer
let isRunning = false;
let timerInterval = null;

// -----------------------------
// START ØVELSE
// -----------------------------
function startExercise(exerciseName) {
  if (isRunning) return; // Bloker dobbeltklik
  isRunning = true;

  const display = document.getElementById("exerciseDisplay");
  const timer = document.getElementById("timerDisplay");

  display.textContent = "Pause: " + exerciseName;
  timer.textContent = "30";

  let timeLeft = 30;

  timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      onPauseCompleted(exerciseName);
    }
  }, 1000);
}

// -----------------------------
// NÅR PAUSEN ER FÆRDIG
// -----------------------------
function onPauseCompleted(exerciseName) {
  isRunning = false;

  const display = document.getElementById("exerciseDisplay");
  const timer = document.getElementById("timerDisplay");

  display.textContent = "Flot! Du passer på dig selv.";
  timer.textContent = "";

  addToFeed(exerciseName);
}

// -----------------------------
// FEED FUNKTION
// -----------------------------
function addToFeed(exerciseName) {
  const feed = document.getElementById("feed");
  const entry = document.createElement("div");

  entry.textContent =
    "Tog en pause: " +
    exerciseName +
    " (" +
    new Date().toLocaleTimeString() +
    ")";

  entry.style.padding = "8px 0";
  entry.style.borderBottom = "1px solid #ddd";

  feed.prepend(entry);
}

// -----------------------------
// KATEGORI-KNAPPER
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".pp-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (isRunning) return;

      const cat = btn.dataset.category;
      const list = exercises[cat];
      const chosen = list[Math.floor(Math.random() * list.length)];

      startExercise(chosen);
    });
  });
});
