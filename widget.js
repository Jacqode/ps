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

// Elementreferencer (kan være null hvis script køres før DOM)
const ideaBtn = document.getElementById("ideaBtn");
const currentIdea = document.getElementById("currentIdea");
const doneBtn = document.getElementById("doneBtn");
const microFeedback = document.getElementById("microFeedback");
const feedContainer = document.getElementById("feed");
const greetingEl = document.getElementById("greeting");

// Set greeting (ingen udråbstegn)
const savedName = localStorage.getItem("userName") || "";
if (greetingEl) greetingEl.textContent = savedName ? `Hej ${savedName}` : "Hej";

// Vis tilfældig idé
if (ideaBtn) {
  ideaBtn.addEventListener("click", () => {
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    if (currentIdea) currentIdea.textContent = idea;
    if (microFeedback) microFeedback.style.display = "none";
  });
}

// Done-knap: vis altid "Alt gået, Jakob!" og submit
if (doneBtn) {
  doneBtn.addEventListener("click", () => {
    if (microFeedback) {
      microFeedback.textContent = "Alt gået, Jakob!";
      microFeedback.style.display = "block";
    }
    submitPause();
  });
}

// Submit pause til backend — inkluderer activity
async function submitPause() {
  try {
    const name = localStorage.getItem("userName") || "Ukendt";
    const activity = (currentIdea && currentIdea.textContent) ? currentIdea.textContent : "⚡ en kort pause";

    const res = await fetch("https://plugandpause-backend.jacqode.workers.dev/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: "J",
        name,
        activity,
        timestamp: Date.now()
      })
    });

    if (!res.ok) {
      console.error("Submit failed", res.status);
    }

    await loadFeed();
  } catch (e) {
    console.error("Submit error", e);
  }
}

// Load feed
async function loadFeed() {
  try {
    const res = await fetch("https://plugandpause-backend.jacqode.workers.dev/feed?companyId=J");
    if (!res.ok) throw new Error("Network response not ok: " + res.status);
    const data = await res.json();
    renderFeed(data);
  } catch (e) {
    console.error("Feed error", e);
    if (feedContainer) feedContainer.innerHTML = "<div>Kunne ikke hente feed.</div>";
  }
}

// Render feed — op til 15 seneste, emoji i aktivitet og smiley efter navn
function renderFeed(items) {
  if (!feedContainer) return;

  if (!items || items.length === 0) {
    feedContainer.innerHTML = "<div>Ingen pauser endnu.</div>";
    return;
  }

  items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const slice = items.slice(0, 15);

  feedContainer.innerHTML = slice.map(item => {
    const name = (item.name || "Ukendt") + " 😊";
    const activity = item.activity ? item.activity : "";
    const time = item.timestamp ? new Date(item.timestamp).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" }) : "";
    return `
      <div class="feed-item">
        <strong>${escapeHtml(name)}</strong> lavede:<br>
        ${escapeHtml(activity)}
        <span class="meta"> (${time})</span>
      </div>
    `;
  }).join("");
}

// Enkel HTML-escape
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initial load og auto-refresh
document.addEventListener("DOMContentLoaded", () => {
  loadFeed();
  setInterval(loadFeed, 30000);
});
