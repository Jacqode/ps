// ---------------------------------------------
// Plug & Pause – Hardcoded aktiviteter (offline)
// ---------------------------------------------

const activities = [
  "Stræk armene over hovedet 🙆‍♂️",
  "Tag 10 dybe vejrtrækninger 🌬️",
  "Gå en hurtig tur 🚶‍♂️",
  "Lav 15 squats 🏋️‍♂️",
  "Drik et glas vand 💧",
  "Ryst kroppen i 20 sekunder 🕺",
  "Kig ud af vinduet i 30 sekunder 🌤️",
  "Lav 10 armstrækninger 💪",
  "Skriv én ting du er taknemmelig for ✨",
  "Rul skuldrene 10 gange 🔄",
  "Tag en mental pause i 30 sekunder 🧘‍♂️",
  "Stræk nakken forsigtigt 🙇‍♂️",
  "Lav 20 jumping jacks 🤸‍♂️",
  "Luk øjnene og slap af i 10 sekunder 😌",
  "Smil til dig selv i skærmen 😄"
];

const activityBtn = document.getElementById("activity-btn");
const activityBox = document.getElementById("activity-box");

function getRandomActivity() {
  const random = activities[Math.floor(Math.random() * activities.length)];
  activityBox.textContent = random;
}

activityBtn.addEventListener("click", getRandomActivity);
