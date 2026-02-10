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

/* --- Feed logik --- */

const MAX_VISIBLE_ITEMS = 10;
let fullFeedList = [];
let currentEndIndex = MAX_VISIBLE_ITEMS;

async function loadFeed() {
  const feed = document.getElementById("feed");
  const showMoreBtn = document.getElementById("showMoreBtn");

  feed.innerHTML = "Indlæser…";
  showMoreBtn.style.display = "none";

  try {
    const res = await fetch(`${apiBase}/api/feed?companyId=${getCompanyId()}`);
    if (!res.ok) throw new Error("Backend gav ikke OK");
    const list = await res.json();

    if (!Array.isArray(list) || list.length === 0) {
      feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
      return;
    }

    fullFeedList = list;
    currentEndIndex = MAX_VISIBLE_ITEMS;

    renderFeedSlice(0, MAX_VISIBLE_ITEMS);

    if (fullFeedList.length > MAX_VISIBLE_ITEMS) {
      showMoreBtn.style.display = "block";
    }

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
    div.textContent = `${item.timestamp} – ${item.name} lavede: ${item.activity}`;
    div.classList.add("feed-item");

    if (index === 0) {
      div.classList.add("feed-item-pulse");
      setTimeout(() => div.classList.remove("feed-item-pulse"), 1500);
    }

    feed.appendChild(div);
  });

  feed.parentElement.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

document.getElementById("showMoreBtn").onclick = () => {
  const nextEnd = currentEndIndex + MAX_VISIBLE_ITEMS;

  renderFeedSlice(0, Math.min(nextEnd, fullFeedList.length));
  currentEndIndex = nextEnd;

  if (currentEndIndex >= fullFeedList.length) {
    document.getElementById("showMoreBtn").style.display = "none";
  }
};

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

document.getElementById("saveName").onclick = () => {
  const name = document.getElementById("nameInput").value.trim();
  if (name) localStorage.setItem("pp_name", name);
};

window.onload = () => {
  const saved = localStorage.getItem("pp_name");
  if (saved) document.getElementById("nameInput").value = saved;
  loadFeed();
};

/* --- Plug & Pause påmindelser --- */

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

