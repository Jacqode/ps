// widget.js — Plug & Pause widget for Firma J

// Load saved name
const savedName = localStorage.getItem("userName") || "";
const greetingEl = document.getElementById("greeting");
if (savedName) {
  greetingEl.textContent = `Hej ${savedName}!`;
} else {
  greetingEl.textContent = "Hej!";
}

// 15 activity ideas
const ideas = [
  "Stræk armene mod loftet i 20 sekunder",
  "Rul skuldrene 10 gange bagud",
  "Rejs dig op og tag 10 dybe vejrtrækninger",
  "Lav 15 sekunders let sidebøjninger",
  "Ryst hænder og arme i 20 sekunder",
  "Stræk nakken blidt til hver side i 10 sekunder",
  "Gå på stedet i 20 sekunder",
  "Lav 10 langsomme knæbøjninger",
  "Stræk lægmusklerne i 15 sekunder",
  "Rul nakken blidt i cirkler i 10 sekunder",
  "Stræk håndled frem og tilbage i 15 sekunder",
  "Lav 10 tåhævninger",
  "Stræk brystet ved at åbne armene bagud i 15 sekunder",
  "Lav 20 sekunders let torso-rotationer",
  "Tag 5 dybe, rolige vejrtrækninger med fokus på langsom udånding"
];

// Elements
const ideaBtn = document.getElementById("ideaBtn");
const currentIdea = document.getElementById("currentIdea");
const doneBtn = document.getElementById("doneBtn");
const microFeedback = document.getElementById("microFeedback");
const feedContainer = document.getElementById("feed");

// Show random idea
ideaBtn.addEventListener("click", () => {
  const idea = ideas[Math.floor(Math.random() * ideas.length)];
  currentIdea.textContent = idea;
  microFeedback.style.display = "none";
});

// Done button
doneBtn.addEventListener("click", () => {
  microFeedback.style.display = "block";
  submitPause();
});

// Submit pause to backend
async function submitPause() {
  try {
    const name = localStorage.getItem("userName") || "Ukendt";
    await fetch("https://plugandpause-backend.jacqode.workers.dev/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: "J",
        name,
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
    const res = await fetch("https://plugandpause-backend.jacqode.workers.dev/feed?companyId=J");
    const data = await res.json();
    renderFeed(data);
  } catch (e) {
    console.error("Feed error", e);
    feedContainer.innerHTML = "<div>Kunne ikke hente feed.</div>";
  }
}

function renderFeed(items) {
  if (!items || items.length === 0) {
    feedContainer.innerHTML = "<div>Ingen pauser endnu.</div>";
    return;
  }

  feedContainer.innerHTML = items
    .map(
      (item) => `
      <div class="feed-item">
        <strong>${item.name}</strong> tog en pause<br>
        <span style="opacity:0.7; font-size:13px;">
          ${new Date(item.timestamp).toLocaleTimeString("da-DK", {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
      </div>
    `
    )
    .join("");
}

// Initial load
loadFeed();

// Auto-refresh feed every 30 seconds
setInterval(loadFeed, 30000);
