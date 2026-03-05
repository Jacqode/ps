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
      "Tag 5 dybe vejrtrækninger
