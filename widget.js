// -----------------------------
// Plug & Pause – widget.js
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

// -----------------------------
// START ØVELSE
// -----------------------------
function startExercise(exerciseName) {
  // Vis øvelsen
  alert("Pause: " + exerciseName);

  // Simuler 30 sek pause (du kan udskifte med rigtig timer)
  setTimeout(() => {
    onPauseCompleted(exerciseName);
  }, 3000); // 3 sek for test – skift til 30000 for 30 sek
}

// -----------------------------
// NÅR PAUSEN ER FÆRDIG
// -----------------------------
function onPauseCompleted(exerciseName) {
  alert("Flot! Du passer på dig selv – en lille pause gør en stor forskel.");

  // Log til feed
  addToFeed(exerciseName);
}

// -----------------------------
// FEED FUNKTION
// -----------------------------
function addToFeed(exerciseName) {
  const feed = document.getElementById("feed");
  const entry = document.createElement("div");

  entry.textContent = "Tog en pause: " + exerciseName + " (" + new Date().toLocaleTimeString() + ")";
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
      const cat = btn.dataset.category;
      const list = exercises[cat];
      const chosen = list[Math.floor(Math.random() * list.length)];
      startExercise(chosen);
    });
  });
});
