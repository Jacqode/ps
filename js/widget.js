document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

    const nameInput = document.getElementById("nameInput");
    const teamInput = document.getElementById("teamInput");
    const saveBtn = document.getElementById("saveBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsPanel = document.getElementById("settingsPanel");
    const activityBtn = document.getElementById("activityBtn");
    const doneBtn = document.getElementById("doneBtn");
    const feedEl = document.getElementById("feed");

    // Load saved user
    const savedName = localStorage.getItem("userName");
    const savedTeam = localStorage.getItem("teamName");

    if (savedName && savedTeam) {
        nameInput.value = savedName;
        teamInput.value = savedTeam;
    }

    // Toggle settings
    settingsBtn.addEventListener("click", () => {
        settingsPanel.classList.toggle("open");
    });

    // Save user
    saveBtn.addEventListener("click", async () => {
        const name = nameInput.value.trim();
        const team = teamInput.value.trim().toLowerCase(); // NORMALISERET

        if (!name || !team) {
            alert("Udfyld både navn og team");
            return;
        }

        localStorage.setItem("userName", name);
        localStorage.setItem("teamName", team);

        await fetch(`${API_BASE}/api/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, team })
        });

        settingsPanel.classList.remove("open");
        loadFeed();
    });

    // Get random activity
    activityBtn.addEventListener("click", async () => {
        const activities = [
            "Tag 5 dybe vejrtrækninger 🌬️",
            "Lav 10 langsomme knæbøjninger 🏋️‍♂️",
            "Massér tindingerne i 20 sekunder 💆‍♀️",
            "Tag 10 rolige maveåndedrag 🌬️",
            "Stræk siden ved at række én arm op og over kroppen ↗️"
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];

        const name = localStorage.getItem("userName");
        const team = localStorage.getItem("teamName");

        await fetch(`${API_BASE}/api/break`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, team, activity })
        });

        loadFeed();
    });

    // Load feed
    async function loadFeed() {
        const team = localStorage.getItem("teamName");
        if (!team) return;

        const res = await fetch(`${API_BASE}/api/team/feed?team=${team}`);
        const feed = await res.json();

        feedEl.innerHTML = feed
            .map(item => {
                const time = new Date(item.created_at).toLocaleTimeString("da-DK", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });
                return `<div><strong>${item.name}</strong> kl. ${time}: ${item.activity}</div>`;
            })
            .join("");
    }

    loadFeed();
    setInterval(loadFeed, 15000);
});
