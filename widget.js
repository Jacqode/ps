// widget.js — Plug & Pause widget for Firma J (v24)

// 15 aktiviteter med emojis
const ideas = [
  "↻ Rul anklerne 10 gange hver vej.",
  "↻ Rul skuldrene 10 gange bagud.",
  "🤸 Stræk nakken blidt til hver side i 10 sekunder.",
  "🤸 Lav 15 sekunders let sidebøjninger.",
  "🙌 Ryst hænder og arme i 15 sekunder.",
  "🧘 Tag 5 dybe vejrtrækninger med fokus på langsom udånding.",
  "🧘 Rejs dig op og tag 10 langsomme vejrtrækninger.",
  "🚶 Gå hen til et vindue og kig ud i 20 sekunder.",
  "🚶 Gå på stedet i 30 sekunder.",
  "💪 Lav 10 langsomme knæbøjninger.",
  "🦶 Lav 10 tåhævninger.",
  "🤸 Stræk lænden ved at række frem mod gulvet i 15 sekunder.",
  "↻ Lav 20 sekunders torso-rotationer fra side til side.",
  "🤲 Stræk håndled frem og tilbage i 15 sekunder.",
  "🙆 Stræk brystet ved at åbne armene bagud i 15 sekunder."
];

// Elements
const ideaBtn = document.getElementById("ideaBtn");
const currentIdea = document.getElementById("currentIdea");
const doneBtn = document.getElementById("doneBtn");
const microFeedback = document.getElementById("microFeedback");
const feedContainer = document.getElementById("feed");
const greetingEl = document.getElementById("greeting");

// Greeting uden udråbstegn
const savedName = localStorage.getItem("userName") || "";
if (greetingEl) greetingEl.textContent = savedName ? `Hej ${savedName}` : "Hej";

// Random aktivitet
ideaBtn.addEventListener("click", () => {
  const idea = ideas[Math.floor(Math.random() * ideas.length)];
  currentIdea.textContent = idea;
  microFeedback.style.display = "none";
});

// Done → Godt gået, Jakob!
doneBtn.addEventListener("click", () => {
  microFeedback.textContent = "Godt gået, Jakob!";
  microFeedback.style.display = "block";
  submitPause();
});

// Submit pause
async function submitPause() {
  try {
    const name = localStorage.getItem("userName") || "Ukendt";
    const activity = currentIdea.textContent || "";

    await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: "J",
        name,
        activity,
        timestamp: Date.now()
      })
    });

    loadFeed();
  } catch (e) {
    console.error("Submit error", e);
  }
}

// Load feed
async function loadFeed() {
  try {
    const res = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/feed?companyId=J");
    const data = await res.json();
    renderFeed(data);
  } catch (e) {
    console.error("Feed error", e);
    feedContainer.innerHTML = "Kunne ikke hente feed.";
  }
}

// Render feed — op til 15 seneste
function renderFeed(items) {
  if (!items || items.length === 0) {
    feedContainer.innerHTML = "Ingen pauser endnu.";
    return;
  }

  items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  feedContainer.innerHTML = items.slice(0, 15).map(item => {
    const name = (item.name || "Ukendt") + " 😊";
    const activity = item.activity || "";
    const time = new Date(item.timestamp).toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <div class="feed-item">
        <strong>${name}</strong> lavede:<br>
        ${activity}
        <span class="meta">(${time})</span>
      </div>
    `;
  }).join("");
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadFeed();
  setInterval(loadFeed, 30000);
});
