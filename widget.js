// widget.js — Plug & Pause widget for Firma J (API-version + interval fra settings)

// Aktiviteter
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

// DOM-elementer (tilpas id'er hvis din HTML bruger andre)
const ideaBtn = document.getElementById("ideaBtn");
const currentIdea = document.getElementById("currentIdea");
const doneBtn = document.getElementById("doneBtn");
const microFeedback = document.getElementById("microFeedback");
const feedContainer = document.getElementById("feed");
const greetingEl = document.getElementById("greeting");

// Hilsen
const savedName = localStorage.getItem("userName") || "";
if (greetingEl) greetingEl.textContent = savedName ? `Hej ${savedName}` : "Hej";

// Vælg ny idé
if (ideaBtn) {
  ideaBtn.addEventListener("click", () => {
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    if (currentIdea) currentIdea.textContent = idea;
    if (microFeedback) microFeedback.style.display = "none";
  });
}

// Done-knap
if (doneBtn) {
  doneBtn.addEventListener("click", () => {
    if (microFeedback) {
      microFeedback.textContent = "Godt gået, " + (savedName || "deltager") + "!";
      microFeedback.style.display = "block";
    }
    submitPause();
  });
}

// Submit pause → POST /api/submit?companyId=J
async function submitPause() {
  try {
    const name = localStorage.getItem("userName") || "Ukendt";
    const activity = (currentIdea && currentIdea.textContent) ? currentIdea.textContent : "";

    await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/submit?companyId=J", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, activity })
    });

    loadFeed();
  } catch (e) {
    console.error("Submit error", e);
  }
}

// Load feed → GET /api/feed?companyId=J
async function loadFeed() {
  try {
    const res = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/feed?companyId=J");
    if (!res.ok) throw new Error("Network response not ok");
    const data = await res.json();
    renderFeed(data);
  } catch (e) {
    console.error("Feed error", e);
    if (feedContainer) feedContainer.innerHTML = "Kunne ikke hente feed.";
  }
}

// Render feed
function renderFeed(items) {
  if (!feedContainer) return;
  if (!items || items.length === 0) {
    feedContainer.innerHTML = "Ingen pauser endnu.";
    return;
  }

  // Sort efter timestamp hvis tilgængelig
  items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  feedContainer.innerHTML = items.slice(0, 15).map(item => {
    const name = (item.name || "Ukendt") + " 😊";
    const activity = item.activity || "";
    const time = item.timestamp ? new Date(item.timestamp).toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit"
    }) : "";

    return `
      <div class="feed-item">
        <strong>${name}</strong> lavede:<br>
        ${activity}
        ${time ? `<span class="meta">(${time})</span>` : ""}
      </div>
    `;
  }).join("");
}

// Reminder / påmindelse logik
let reminderTimerId = null;

function startReminders() {
  // Læs interval i minutter (kan være decimal, fx 0.5 = 30s)
  const intervalMin = parseFloat(localStorage.getItem("pp_interval_min")) || 40;
  const intervalMs = Math.max(1000, Math.round(intervalMin * 60000)); // mindst 1s sikkerhed

  // Ryd eksisterende timer
  if (reminderTimerId) clearInterval(reminderTimerId);

  // Første påmindelse efter intervalMs
  reminderTimerId = setInterval(() => {
    showReminder();
  }, intervalMs);
}

function showReminder() {
  // Simpel visuel påmindelse — tilpas efter dit UI
  if (microFeedback) {
    microFeedback.textContent = "Tid til en aktiv pause!";
    microFeedback.style.display = "block";
  }
  // Du kan også spille lyd, vise notifikationer osv. (kræver bruger‑tilladelse)
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadFeed();
  setInterval(loadFeed, 30000); // opdater feed hvert 30s i UI

  // Start reminders baseret på settings
  startReminders();

  // Hvis brugeren ændrer indstillinger i en anden fane, genstart reminders når siden får fokus
  window.addEventListener("focus", () => {
    startReminders();
  });
});
