// -----------------------------
// Plug & Pause – ORIGINAL FUNKTION (Option A)
// -----------------------------

const apiBase = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

const fallbackIdeas = [
  "Stræk nakken i 30 sekunder",
  "Tag 10 dybe vejrtrækninger",
  "Gå en kort tur væk fra skærmen",
  "Drik et glas vand",
  "Ryst skuldrene i 15 sekunder"
];

function getCompanyId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("companyId") || "FIRMAJ";
}

async function getIdea() {
  try {
    const res = await fetch(`${apiBase}/api/random?companyId=${getCompanyId()}`);
    if (!res.ok) throw new Error("Backend gav ikke OK");
    const data = await res.json();
    if (!data || !data.activity) throw new Error("Ingen activity i svar");
    return data.activity;
  } catch (e) {
    const i = Math.floor(Math.random() * fallbackIdeas.length);
    return fallbackIdeas[i];
  }
}

async function markDone(activity) {
  const name = localStorage.getItem("pp_name") || "Ukendt";
  try {
    await fetch(`${apiBase}/api/submit?companyId=${getCompanyId()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        activity
      })
    });
  } catch (e) {}
}

/* --- Feed logik --- */

const MAX_VISIBLE_ITEMS = 6; // FAST feed på 6 aktiviteter
let fullFeedList = [];

async function loadFeed() {
  const feed = document.getElementById("feed");

  feed.innerHTML = "Indlæser…";

  try {
    const res = await fetch(`${apiBase}/api/feed?companyId=${getCompanyId()}`);
    if (!res.ok) throw new Error("Backend gav ikke OK");
    const list = await res.json();

    if (!Array.isArray(list) || list.length === 0) {
      feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
      return;
    }

    fullFeedList = list;

    // Vis kun de seneste 6
    renderFeedSlice(0, MAX_VISIBLE_ITEMS);

  } catch (e) {
    feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
  }
}

function renderFeedSlice(start, end) {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  const slice = fullFeedList.slice(start, end);

  slice.forEach((item, index) => {
    const div = document.createElement("div");

    // Formatér tidspunkt til HH:MM
    const time = new Date(item.timestamp);
    const hh = time.getHours().toString().padStart(2, "0");
    const mm = time.getMinutes().toString().padStart(2, "0");

    div.textContent = `${hh}:${mm} – ${item.name} lavede: ${item.activity}`;
    div.classList.add("feed-item");

    // Pulse på nyeste
    if (index === 0) {
      div.classList.add("feed-item-pulse");
      setTimeout(() => div.classList.remove("feed-item-pulse"), 1500);
    }

    feed.appendChild(div);
  });
}

/* --- Personlig hilsen --- */

function updateGreeting() {
  const name = localStorage.getItem("pp_name");
  const hasVisited = localStorage.getItem("pp_hasVisited") === "true";
  const greeting = document.getElementById("greeting");

  if (name && hasVisited) {
    greeting.textContent = `Godt at se dig igen, ${name}`;
  } else if (name) {
    greeting.textContent = `Hej ${name}`;
  } else {
    greeting.textContent = "Hej";
  }

  localStorage.setItem("pp_hasVisited", "true");
}

/* --- UI handling --- */

document.getElementById("ideaBtn").onclick = async () => {
  const idea = await getIdea();
  document.getElementById("currentIdea").textContent = idea;
};

document.getElementById("doneBtn").onclick = async () => {
  const idea = document.getElementById("currentIdea").textContent;
  if (!idea) return;
  await markDone(idea);
  loadFeed();
};

window.onload = () => {
  updateGreeting();
  loadFeed();
};
