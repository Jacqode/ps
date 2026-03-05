// Sæt din Cloudflare Worker URL her, fx: "https://plugandpause-backend.<subdomain>.workers.dev"
const API_BASE = "https://your-worker-subdomain.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("nameInput");
  const teamInput = document.getElementById("teamInput");
  const saveBtn = document.getElementById("saveBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const activityBtn = document.getElementById("activityBtn");
  const doneBtn = document.getElementById("doneBtn");
  const feedEl = document.getElementById("feed");
  const greeting = document.getElementById("greeting");

  // Defensive check: stop tidligt hvis DOM ikke er som forventet
  const required = [nameInput, teamInput, saveBtn, settingsBtn, settingsPanel, activityBtn, doneBtn, feedEl, greeting];
  if (required.some(el => !el)) {
    console.error("Widget: mangler DOM-elementer. Tjek widget.html og sti til js/widget.js");
    document.body.insertAdjacentHTML("afterbegin",
      "<div style='padding:12px;background:#fee;border:1px solid #fbb'>Widget fejl: mangler elementer. Se Console.</div>");
    return;
  }

  // Hjælpefunktioner
  const norm = s => (s || "").toString().trim().toLowerCase();
  const escapeHtml = s => String(s || "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Load saved values
  const savedName = localStorage.getItem("userName") || "";
  const savedTeam = localStorage.getItem("teamName") || "";
  nameInput.value = savedName;
  teamInput.value = savedTeam;
  greeting.textContent = savedName ? `Hej ${savedName}` : "Hej ukendt";

  // Toggle settings panel
  settingsBtn.addEventListener("click", () => {
    const open = settingsPanel.classList.toggle("open");
    settingsPanel.setAttribute("aria-hidden", !open);
  });

  // Save user (normaliser team)
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
    settingsPanel.setAttribute("aria-hidden", "true");
    loadFeed();
  });

  // Post en aktivitet
  activityBtn.addEventListener("click", async () => {
    const activities = [
      "Tag 5 dybe vejrtrækninger 🌬️",
      "Lav 10 langsomme knæbøjninger 🏋️‍♂️",
      "Massér tindingerne i 20 sekunder 💆‍♀️",
      "Tag 10 rolige maveåndedrag 🌬️",
      "Stræk siden ved at række én arm op og over kroppen ↗️"
    ];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const name = localStorage.getItem("userName") || "Ukendt";
    const team = norm(localStorage.getItem("teamName") || "");

    if (!team) {
      alert("Vælg et team i Indstillinger først.");
      return;
    }

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
  });

  // Done-knap (simpel visuel bekræftelse)
  doneBtn.addEventListener("click", () => {
    alert("Godt klaret! Fortsæt den gode vane.");
  });

  // Hent team feed
  async function loadFeed() {
    const team = norm(localStorage.getItem("teamName") || "");
    if (!team) {
      feedEl.innerHTML = "<div class='small'>Vælg et team i Indstillinger for at se buddies.</div>";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/team/feed?team=${encodeURIComponent(team)}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const feed = await res.json();
      if (!Array.isArray(feed) || feed.length === 0) {
        feedEl.innerHTML = "<div class='small'>Ingen aktiviteter endnu.</div>";
        return;
      }

      feedEl.innerHTML = feed.map(item => {
        const t = item.created_at ? new Date(item.created_at).toLocaleTimeString("da-DK", {hour:"2-digit",minute:"2-digit",hour12:false}) : "";
        return `<div class="feed-item"><strong>${escapeHtml(item.name)}</strong> kl. ${t}: ${escapeHtml(item.activity)}</div>`;
      }).join("");
    } catch (err) {
      console.warn("Fejl ved hentning af feed:", err.message);
      feedEl.innerHTML = "<div class='small'>Fejl ved hentning af feed.</div>";
    }
  }

  // Initial load + auto refresh
  loadFeed();
  setInterval(loadFeed, 15000);
});
