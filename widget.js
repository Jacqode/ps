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

// Elementer
const ideaBtn = document.getElementById("ideaBtn");
const currentIdea = document.getElementById("currentIdea");
const doneBtn = document.getElementById("doneBtn");
const microFeedback = document.getElementById("microFeedback");
const feedContainer = document.getElementById("feed");
const greetingEl = document.getElementById("greeting");

// Hilsen
const savedName = localStorage.getItem("userName") || "";
if (greetingEl) greetingEl.textContent = savedName ? `Hej ${savedName} 😊` : "Hej 😊";

// Aktivitet
if (ideaBtn) {
  ideaBtn.addEventListener("click", () => {
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    currentIdea.textContent = idea;
    microFeedback.style.display = "none";
  });
}

// Færdig
if (doneBtn) {
  doneBtn.addEventListener("click", () => {
    microFeedback.textContent = "Godt gået!";
    microFeedback.style.display = "block";
    submitPause();
  });
}

// Send pause til backend
async function submitPause() {
  try {
    const name = localStorage.getItem("userName") || "Ukendt";
    const activity = currentIdea.textContent;

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

// Hent feed
async function loadFeed() {
  try {
    const res = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/feed?companyId=J");
    const data = await res.json();
    renderFeed(data);
  } catch (e) {
    console.error("Feed error", e);
    feedContainer.innerHTML = "Kunne ikke hente feed.";
  }
}

// Vis feed
function renderFeed(items) {
  if (!items || items.length === 0) {
    feedContainer.innerHTML = "Ingen pauser endnu.";
    return;
  }

  items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  feedContainer.innerHTML = items.slice(0, 5).map(item => {
    const name = item.name || "Ukendt";
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

// Reminder-lyd
function playChime() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [440, 660, 880, 660];
  let t = ctx.currentTime;

  notes.forEach(freq => {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
    t += 0.18;
  });
}

// Reminder
let reminderTimerId = null;

function startReminders() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  const intervalMin = parseFloat(localStorage.getItem("pp_interval_min")) || 40;
  const intervalMs = Math.max(60000, Math.round(intervalMin * 60000));

  if (reminderTimerId) clearInterval(reminderTimerId);

  reminderTimerId = setInterval(() => {
    triggerReminder();
  }, intervalMs);
}

function triggerReminder() {
  if (Notification.permission === "granted") {
    new Notification("Plug & Pause", {
      body: "Tid til en aktiv pause!",
      icon: "https://jacqode.github.io/ps/icon.png"
    });
  }

  playChime();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadFeed();
  setInterval(loadFeed, 30000);
  startReminders();
});
