// -----------------------------
// Plug & Pause – ORIGINAL FUNKTION (Option A)
// -----------------------------

const apiBase = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

// 10 aktiviteter med korte beskrivelser
const fallbackIdeas = [
  "Stræk nakken i 30 sekunder – løsner spændinger og giver ro i øvre ryg og skuldre.",
  "Tag 10 dybe vejrtrækninger – sænk tempoet og aktiver dit nervesystem.",
  "Gå en kort tur væk fra skærmen – få blodcirkulationen i gang og giv øjnene en pause.",
  "Drik et glas vand – et lille energiboost og en god vane i løbet af dagen.",
  "Ryst skuldrene i 15 sekunder – slip spændinger fra stillesiddende arbejde.",
  "Squat i 30 sekunder – aktiver ben og core og få et hurtigt energiboost.",
  "Wall sit i 20–30 sekunder – en stærk, statisk øvelse der vækker benene.",
  "Rul skuldrene 10 gange – store rolige cirkler der løsner nakke og øvre ryg.",
  "Stræk lænden i 20 sekunder – læn dig let bagover og giv plads i ryggen.",
  "Ryst armene i 15 sekunder – slip ophobet spænding og få en let, frisk følelse."
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

const MAX_VISIBLE_ITEMS = 6; // Fast feed – 6 aktiviteter
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

  slice.forEach((item) => {
    const div = document.createElement("div");

    // Formatér tidspunkt til HH:MM
    const time = new Date(item.timestamp);
    const hh = time.getHours().toString().padStart(2, "0");
    const mm = time.getMinutes().toString().padStart(2, "0");

    div.textContent = `${hh}:${mm} – ${item.name} lavede: ${item.activity}`;
    div.classList.add("feed-item");

    feed.appendChild(div);
  });
}

/* --- Personlig hilsen --- */

function updateGreeting() {
  const name = localStorage.getItem("pp_name");
  const greeting = document.getElementById("greeting");

  if (name) {
    greeting.textContent = `Hej ${name} — tid til et øjeblik til dig selv.`;
  } else {
    greeting.textContent = "Hej — tid til et øjeblik til dig selv.";
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

  // Mikro-feedback
  const box = document.getElementById("microFeedback");
  box.style.display = "block";
  setTimeout(() => {
    box.style.display = "none";
  }, 1500);
};

window.onload = () => {
  updateGreeting();
  loadFeed();
};
