// Cloudflare Worker backend
const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const nameInput = $("nameInput");
  const teamInput = $("teamInput");
  const saveBtn = $("saveBtn");
  const settingsBtn = $("settingsBtn");
  const settingsPanel = $("settingsPanel");
  const activityBtn = $("activityBtn");
  const doneBtn = $("doneBtn");
  const feedEl = $("feed");
  const statsEl = $("stats");
  const greeting = $("greeting");
  const currentActivityEl = $("currentActivity");
  const microFeedbackEl = $("microFeedback");

  const norm = s => (s || "").trim().toLowerCase();
  const escapeHtml = s =>
    String(s || "").replace(/[&<>"']/g, c =>
      ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c])
    );

  const getTeam = () => norm(localStorage.getItem("teamName"));
  const getName = () => localStorage.getItem("userName") || "Ukendt";

  async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }

  async function apiPost(path, body) {
    await fetch(`${API_BASE}${path}`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(body)
    });
  }

  // Init
  doneBtn.style.visibility = "hidden";
  nameInput.value = getName() === "Ukendt" ? "" : getName();
  teamInput.value = getTeam();
  greeting.textContent = nameInput.value ? `Hej ${nameInput.value}` : "Hej";

  settingsBtn.onclick = () => {
    const open = settingsPanel.classList.toggle("open");
    settingsPanel.setAttribute("aria-hidden", !open);
  };

  saveBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const team = getTeam() || norm(teamInput.value);

    if (!name || !team) return alert("Udfyld både navn og team");

    localStorage.setItem("userName", name);
    localStorage.setItem("teamName", team);
    greeting.textContent = `Hej ${name}`;

    try { await apiPost("/api/user", { name, team }); } catch {}
    settingsPanel.classList.remove("open");
    loadFeed();
    loadStats();
  };

  activityBtn.onclick = async () => {
    const team = getTeam();
    if (!team) return alert("Vælg et team først");

    const activities = [
      "Tag 5 dybe vejrtrækninger 🌬️",
      "Lav 10 langsomme knæbøjninger 🏋️‍♂️",
      "Massér tindingerne i 20 sekunder 💆‍♀️",
      "Tag 10 rolige maveåndedrag 🌬️",
      "Stræk siden ved at række én arm op ↗️"
    ];

    const activity = activities[Math.floor(Math.random()*activities.length)];
    currentActivityEl.textContent = activity;
    microFeedbackEl.style.display = "none";
    doneBtn.style.visibility = "visible";

    try {
      await apiPost("/api/break", { name:getName(), team, activity });
    } catch {}

    loadFeed();
    loadStats();
  };

  doneBtn.onclick = () => {
    currentActivityEl.textContent = "";
    microFeedbackEl.textContent = "Godt klaret! Fortsæt den gode vane 💪";
    microFeedbackEl.style.display = "block";

    setTimeout(() => {
      microFeedbackEl.style.display = "none";
      doneBtn.style.visibility = "hidden";
    }, 8000);
  };

  async function loadFeed() {
    const team = getTeam();
    if (!team) return feedEl.innerHTML = "<div class='small'>Vælg et team.</div>";

    try {
      const feed = await apiGet(`/api/team/feed?team=${encodeURIComponent(team)}`);
      if (!feed.length) return feedEl.innerHTML = "<div class='small'>Ingen aktiviteter endnu.</div>";

      feedEl.innerHTML = feed.map(i => {
        const t = new Date(i.created_at).toLocaleTimeString("da-DK",{hour:"2-digit",minute:"2-digit"});
        return `<div class="feed-item"><strong>${escapeHtml(i.name)}</strong> kl. ${t}: ${escapeHtml(i.activity)}</div>`;
      }).join("");
    } catch {
      feedEl.innerHTML = "<div class='small'>Kunne ikke hente feed.</div>";
    }
  }

  async function loadStats() {
    const team = getTeam();
    if (!team) return statsEl.textContent = "Vælg et team for at se statistik.";

    try {
      const s = await apiGet(`/api/team/stats?team=${encodeURIComponent(team)}`);
      let text = `I har taget ${s.total_breaks} pauser sammen 💪`;
      if (s.breaks_per_user?.length) {
        const top = s.breaks_per_user[0];
        text += ` — ${top.name} fører an.`;
      }
      statsEl.textContent = text;
    } catch {
      statsEl.textContent = "Kunne ikke hente statistik.";
    }
  }

  loadFeed();
  loadStats();
});
