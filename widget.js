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

  /* GREETING-LOGIK – med smiley */
  function updateGreeting() {
    const savedName = localStorage.getItem("userName");
    if (!savedName || savedName.trim() === "") {
      greeting.innerHTML =
        "Hej ukendt kollega 😊<br><a class='settings-link' href='settings.html'>Ændr navn</a>";
    } else {
      greeting.textContent = "Hej " + savedName + " 😊";
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

  /* EMOTICON LOGIK – intuitiv mapping */
  function getIconForActivity(activity) {
    if (!activity) return "⚡";
    const a = activity.toLowerCase();

    if (a.includes("vejrtræk") || a.includes("åndedræt") || a.includes("dybe")) return "🧘";
    if (a.includes("gå") || a.includes("tur") || a.includes("gå en")) return "🚶";
    if (a.includes("stræk") || a.includes("række") || a.includes("sidebøj")) return "🤸";
    if (a.includes("rul") || a.includes("rotation") || a.includes("torso")) return "↻";
    if (a.includes("knæbøj") || a.includes("knæ") || a.includes("styrke")) return "💪";
    if (a.includes("ryst") || a.includes("ryste") || a.includes("shake")) return "🙌";
    if (a.includes("vindue") || a.includes("kig ud") || a.includes("kig")) return "🌤️";
    if (a.includes("tåhæv") || a.includes("tåhævninger") || a.includes("fod") || a.includes("ankel")) return "🦶";
    return "⚡";
  }

  /* Hjælper: fjern evt. ledende emoji(er) fra en aktivitetstekst */
  function stripLeadingEmoji(text) {
    if (!text) return "";
    try {
      return text.replace(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D\s]+/u, "").trim();
    } catch (e) {
      return text.replace(/^[^\p{L}\p{N}]+/u, "").trim();
    }
  }

  /* IDE-KNAP: vis emoticon før teksten i currentIdea, men gem rå aktivitet uden emoji */
  ideaBtn.addEventListener("click", () => {
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    const icon = getIconForActivity(idea);
    currentIdea.textContent = `${icon} ${idea}`;
    currentIdea.dataset.activity = idea;
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
          const rawActivity = stripLeadingEmoji(row.activity || "");
          const icon = getIconForActivity(rawActivity);
          const name = row.name || "ukendt kollega";
          const time = row.timestamp
            ? ` (${new Date(row.timestamp).toLocaleTimeString("da-DK",{hour:'2-digit',minute:'2-digit'})})`
            : "";
          return `<div class="feed-item">${name} lavede: ${icon} ${rawActivity}${time}</div>`;
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
    // Vis clap emoji + tekst
    microFeedback.textContent = "🙌 Godt gået!";
    microFeedback.style.display = "block";

    const activity = (currentIdea.dataset && currentIdea.dataset.activity) ? currentIdea.dataset.activity : stripLeadingEmoji(currentIdea.textContent || "");
    const name = localStorage.getItem("userName") || "ukendt kollega";

    try {
      await fetch(SUBMIT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, activity })
      });

      await loadFeed();

    } catch (err) {
      console.error("Cloudflare-fejl:", err);
    }

    setTimeout(() => {
      microFeedback.style.display = "none";
    }, 9000);
  });
});
