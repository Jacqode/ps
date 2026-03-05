// Cloudflare Worker URL
const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("nameInput");
  const teamInput = document.getElementById("teamInput");
  const saveBtn = document.getElementById("saveBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const activityBtn = document.getElementById("activityBtn");
  const doneBtn = document.getElementById("doneBtn");
  const feedEl = document.getElementById("feed");
  const statsEl = document.getElementById("stats");
  const greeting = document.getElementById("greeting");

  // Nye UI-elementer
  const currentActivityEl = document.getElementById("currentActivity");
  const microFeedbackEl = document.getElementById("microFeedback");

  const norm = s => (s || "").toString().trim().toLowerCase();
  const escapeHtml = s =>
    String(s || "").replace(/[&<>"']/g, c =>
      ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c])
    );

  // Load saved values
  const savedName = localStorage.getItem("userName") || "";
  const savedTeam = localStorage.getItem("teamName") || "";
  nameInput.value = savedName;
  teamInput.value = savedTeam;
  greeting.textContent = savedName ? `Hej ${savedName}` : "Hej";

  // Toggle settings
  settingsBtn.addEventListener("click", () => {
    const open = settingsPanel.classList.toggle("open");
    settingsPanel.setAttribute("aria-hidden", !open);
  });

  // Save user
  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const team = norm(teamInput.value);

    if (!name || !team) {
      alert("Udfyld både navn og team");
      return;
    }

    localStorage.setItem("userName", name);
    localStorage.setItem("teamName", team);
    greeting.textContent = `Hej ${name}`;

    try {
      await fetch(`${API_BASE}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, team })
      });
    } catch (err) {
      console.warn("Fejl ved /api/user:", err.message);
    }

    settingsPanel.classList.remove("open");
    loadFeed();
    loadStats();
  });

  // Få aktivitet
  activityBtn.addEventListener("click", async () => {
    const activities = [
      "Tag 5 dybe vejrtrækninger 🌬️",
      "Lav 10 langsomme knæbøjninger 🏋️‍♂️",
      "Massér tindingerne i 20 sekunder 💆‍♀️",
      "Tag 10 rolige maveåndedrag 🌬️",
      "Stræk siden ved at række én arm op ↗️"
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    const name = localStorage.getItem("userName") || "Ukendt";
    const team = norm(localStorage.getItem("teamName"));

    if (!team) {
      alert("Vælg et team først");
      return;
    }

    // Vis aktivitet
    currentActivityEl.textContent = activity;
    microFeedbackEl.style.display = "none";
    doneBtn.style.visibility = "visible";

    try {
      await fetch(`${API_BASE}/api/break`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, team, activity })
      });
    } catch (err) {
      console.warn("Fejl ved /api/break:", err.message);
    }

    loadFeed();
    loadStats();
  });

  // Jeg er færdig
  doneBtn.addEventListener("click", () => {
    // Fjern aktivitet
    currentActivityEl.textContent = "";

    // Vis microfeedback
    microFeedbackEl.textContent = "Godt klaret! Fortsæt den gode vane 💪";
    microFeedbackEl.style.display = "block";

    // Skjul efter 8 sekunder
    setTimeout(() => {
      microFeedbackEl.style.display = "none";
      doneBtn.style.visibility = "hidden";
    }, 8000);
  });

  // Feed
  async function loadFeed() {
    const team = norm(localStorage.getItem("teamName"));
    if (!team) {
      feedEl.innerHTML = "<div class='small'>Vælg et team.</div>";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/team/feed?team=${encodeURIComponent(team)}`);
      const feed = await res.json();

      if (!Array.isArray(feed) || feed.length === 0) {
        feedEl.innerHTML = "<div class='small'>Ingen aktiviteter endnu.</div>";
        return;
      }

      feedEl.innerHTML = feed.map(item => {
        const t = item.created_at
          ? new Date(item.created_at).toLocaleTimeString("da-DK", {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "";
        return `<div class="feed-item"><strong>${escapeHtml(item.name)}</strong> kl. ${t}: ${escapeHtml(item.activity)}</div>`;
      }).join("");
    } catch (err) {
      console.warn("Fejl ved hentning af feed:", err.message);
      feedEl.innerHTML = "<div class='small'>Fejl ved hentning af feed.</div>";
    }
  }

  // Stats
  async function loadStats() {
    const team = norm(localStorage.getItem("teamName"));
    const user = localStorage.getItem("userName");
    if (!team) {
      statsEl.innerHTML = "";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/team/stats?team=${encodeURIComponent(team)}`);
      const stats = await res.json();

      const today = new Date().toISOString().slice(0, 10);

      const teamToday =
        stats.breaks_per_day.find(d => d.day === today)?.count || 0;

      const userToday =
        stats.breaks_per_user.find(u => u.name === user)?.count || 0;

      statsEl.innerHTML = `
        <strong>I dag</strong><br>
        Team: ${teamToday} breaks<br>
        Dig: ${userToday} breaks
      `;
    } catch (err) {
      console.warn("Fejl ved hentning af stats:", err.message);
    }
  }

  loadFeed();
  loadStats();

  setInterval(() => {
    loadFeed();
    loadStats();
  }, 15000);
});
