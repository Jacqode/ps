document.addEventListener("DOMContentLoaded", () => {
  const ideaBtn = document.getElementById("ideaBtn");
  const doneBtn = document.getElementById("doneBtn");
  const currentIdea = document.getElementById("currentIdea");
  const microFeedback = document.getElementById("microFeedback");
  const greeting = document.getElementById("greeting");
  const feed = document.getElementById("feed");

  /* GREETING-LOGIK */
  const savedName = localStorage.getItem("userName");

  if (!savedName || savedName.trim() === "") {
    greeting.innerHTML =
      "Hej 👋<br><a href='settings.html' style='font-size:14px; opacity:0.8; text-decoration:underline;'>Ændr navn</a>";
  } else {
    greeting.textContent = "Hej " + savedName;
  }

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

  /* FEED-LOGIK */
  let feedData = JSON.parse(localStorage.getItem("feedData") || "[]");

  function renderFeed() {
    if (feedData.length === 0) {
      feed.innerHTML = "<div class='feed-item'>Ingen pauser registreret endnu</div>";
      return;
    }

    feed.innerHTML = feedData
      .map(item => `<div class="feed-item">${item}</div>`)
      .join("");
  }

  renderFeed();

  /* MICROFEEDBACK + FEED-OPDATERING */
  doneBtn.addEventListener("click", () => {
    microFeedback.style.display = "block";

    const now = new Date();
    const date = now.toLocaleDateString("da-DK", {
      day: "2-digit",
      month: "2-digit"
    });
    const time = now.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const activity = currentIdea.textContent || "en kort pause";
    const icon = getIconForActivity(activity);

    const newItem = `${date} kl. ${time} – ${icon} du lavede: ${activity}`;

    feedData.unshift(newItem);
    localStorage.setItem("feedData", JSON.stringify(feedData));
    renderFeed();

    setTimeout(() => {
      microFeedback.style.display = "none";
    }, 9000);
  });
});

