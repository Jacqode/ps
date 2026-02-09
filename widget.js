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
  } catch (e) {
    // Ignorer fejl stille og roligt
  }
}

async function loadFeed() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "Indlæser…";

  try {
    const res = await fetch(`${apiBase}/api/feed?companyId=${getCompanyId()}`);
    if (!res.ok) throw new Error("Backend gav ikke OK");
    const list = await res.json();

    if (!Array.isArray(list)) {
      feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
      return;
    }

    feed.innerHTML = "";
    if (list.length === 0) {
      feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
      return;
    }

    list.forEach(item => {
      const div = document.createElement("div");
      div.textContent = `${item.timestamp} – ${item.name} lavede: ${item.activity}`;
      feed.appendChild(div);
    });
  } catch (e) {
    feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
  }
}

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

document.getElementById("saveName").onclick = () => {
  const name = document.getElementById("nameInput").value.trim();
  if (name) localStorage.setItem("pp_name", name);
};

window.onload = () => {
  const saved = localStorage.getItem("pp_name");
  if (saved) document.getElementById("nameInput").value = saved;
  loadFeed();
};

// --- Plug & Pause påmindelser (ingen extension nødvendig) ---

const REMINDER_INTERVAL_MINUTES = 15;

document.addEventListener("DOMContentLoaded", () => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});

setInterval(() => {
  if (Notification.permission === "granted") {
    new Notification("Plug & Pause", {
      body: "Tid til en lille pause?",
      icon: "https://jacqode.github.io/ps/icon.png"
    });
  }
}, REMINDER_INTERVAL_MINUTES * 60 * 1000);
