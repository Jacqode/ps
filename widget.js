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

const ideaBtn = document.getElementById("ideaBtn");
const currentIdea = document.getElementById("currentIdea");
const doneBtn = document.getElementById("doneBtn");
const microFeedback = document.getElementById("microFeedback");
const feedContainer = document.getElementById("feed");
const greetingEl = document.getElementById("greeting");

const savedName = localStorage.getItem("userName") || "";
if (greetingEl) greetingEl.textContent = savedName ? `Hej ${savedName}` : "Hej";

if (ideaBtn) {
  ideaBtn.addEventListener("click", () => {
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    if (currentIdea) currentIdea.textContent = idea;
    if (microFeedback) microFeedback.style.display = "none";
  });
}

if (doneBtn) {
  doneBtn.addEventListener("click", () => {
    if (microFeedback) {
      microFeedback.textContent = "Godt gået, " + (savedName || "deltager") + "!";
      microFeedback.style.display = "block";
    }
    submitPause();
  });
}

async function submitPause() {
  try {
    const name = localStorage.getItem("userName") || "Ukendt";
    const activity = currentIdea ? currentIdea.textContent : "";

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

async function loadFeed() {
  try {
    const res = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/feed?companyId=J");
    const data = await res.json();
    renderFeed(data);
  } catch (e) {
    console.error("Feed error", e);
    if (feedContainer) feedContainer.innerHTML = "Kunne ikke hente feed.";
  }
}

function renderFeed(items) {
  if (!feedContainer) return;
  if (!items || items.length === 0) {
    feedContainer.innerHTML = "Ingen pauser endnu.";
    return;
  }

  items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  feedContainer.innerHTML = items.slice(0, 15).map(item => {
    const name = (item.name || "Ukendt") + " 😊";
    const activity = item.activity || "";
    const time = item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })
      : "";

    return `
      <div class="feed-item">
        <strong>${name}</strong> lavede:<br>
        ${activity}
        ${time ? `<span class="meta">(${time})</span>` : ""}
      </div>
    `;
  }).join("");
}

let reminderTimerId = null;

function startReminders() {
  const intervalMin = parseFloat(localStorage.getItem("pp_interval_min")) || 40;
  const intervalMs = Math.max(1000, Math.round(intervalMin * 60000));

  if (reminderTimerId) clearInterval(reminderTimerId);

  reminderTimerId = setInterval(() => {
    showReminder();
  }, intervalMs);
}

function showReminder() {
  if (microFeedback) {
    microFeedback.textContent = "Tid til en aktiv pause!";
    microFeedback.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeed();
  setInterval(loadFeed, 30000);
  startReminders();
  window.addEventListener("focus", () => startReminders());
});
