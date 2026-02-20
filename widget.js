document.addEventListener("DOMContentLoaded", () => {
  const ideaBtn = document.getElementById("ideaBtn");
  const doneBtn = document.getElementById("doneBtn");
  const currentIdea = document.getElementById("currentIdea");
  const microFeedback = document.getElementById("microFeedback");
  const greeting = document.getElementById("greeting");
  const feed = document.getElementById("feed");

  /* CLOUDFLARE ENDPOINTS */
  const BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";
  const COMPANY = "J";
  const FEED_API = `${BASE}/api/feed?companyId=${COMPANY}`;
  const SUBMIT_API = `${BASE}/api/submit?companyId=${COMPANY}`;

  /* GREETING-LOGIK */
  function updateGreeting() {
    const savedName = localStorage.getItem("userName");
    if (!savedName || savedName.trim() === "") {
      greeting.innerHTML =
        "Hej ukendt kollega 👋<br><a class='settings-link' href='settings.html'>Ændr navn</a>";
    } else {
      greeting.textContent = "Hej " + savedName;
    }
  }
  updateGreeting();
  window.addEventListener("storage", (e) => {
    if (e.key === "userName") updateGreeting();
  });

  /* 15 AKTIVITETER */
  const ideas = [
    "Stræk armene over hovedet i 20 sekunder.",
    "Rul skuldrene 10 gange bagud.",
    "Rejs dig op og tag 10 langsomme vejrtrækninger.",
    "Lav 15 sekunders let sidebøjninger.",
    "Gå på stedet i 30 sekunder.",
    "Lav 10 langsomme knæbøjninger.",
    "Stræk nakken blidt til hver side i 10 sekunder.",
    "Ryst hænder og arme i 15 sekunder.",
    "Gå hen til et vindue og kig ud i 20 sekunder.",
    "Lav 10 tåhævninger.",
    "Stræk lænden ved at række frem mod gulvet i 15 sekunder.",
    "Rul anklerne 10 gange hver vej.",
    "Tag 5 dybe vejrtrækninger med fokus på langsom udånding.",
    "Lav 20 sekunders torso-rotationer fra side til side.",
    "Gå en lille tur i rummet i 20–30 sekunder."
  ];

  /* IKON-LOGIK */
  function getIconForActivity(activity) {
    if (!activity) return "⚡";
    if (activity.includes("vejrtræk")) return "🧘";
    if (activity.includes("gå")) return "🚶";
    if (activity.includes("stræk")) return "🌿";
    if (activity.includes("rul")) return "🔄";
    if (activity.includes("knæbøj")) return "💪";
    if (activity.includes("ryst")) return "✨";
    return "⚡";
  }

  /* IDE-KNAP */
  ideaBtn.addEventListener("click", () => {
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    currentIdea.textContent = idea;
  });

  /* HENT FÆLLES FEED FRA CLOUDFLARE */
  async function loadFeed() {
    try {
      const res = await fetch(FEED_API);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : (data && data.results) ? data.results : [];

      if (rows.length === 0) {
        feed.innerHTML = "<div class='feed-item'>Ingen pauser registreret endnu</div>";
        return;
      }

      feed.innerHTML = rows
        .map(row => {
          const icon = getIconForActivity(row.activity || "");
          const name = row.name || "ukendt kollega";
          const time = row.timestamp ? ` (${new Date(row.timestamp).toLocaleTimeString("da-DK",{hour:'2-digit',minute:'2-digit'})})` : "";
          return `<div class="feed-item">${icon} ${name} lavede: ${row.activity || ''}${time}</div>`;
        })
        .join("");

    } catch (err) {
      console.error(err);
      feed.innerHTML = "<div class='feed-item'>Kunne ikke hente fælles feed</div>";
    }
  }
  loadFeed();

  /* MICROFEEDBACK + SEND TIL CLOUDFLARE */
  doneBtn.addEventListener("click", async () => {
    microFeedback.style.display = "block";

    const activity = currentIdea.textContent || "en kort pause";
    const name = localStorage.getItem("userName") || "ukendt kollega";

    try {
      await fetch(SUBMIT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, activity })
      });

      // opdater feed efter upload
      await loadFeed();
    } catch (err) {
      console.error("Cloudflare-fejl:", err);
    }

    setTimeout(() => {
      microFeedback.style.display = "none";
    }, 9000);
  });
});
