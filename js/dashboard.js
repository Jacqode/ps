document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

    const teamName = localStorage.getItem("teamName");
    const teamId = localStorage.getItem("teamId");

    const teamMembersEl = document.getElementById("teamMembers");
    const teamFeedEl = document.getElementById("teamFeed");

    if (!teamName || !teamId) {
        teamMembersEl.innerHTML = "<p>Intet team valgt.</p>";
        teamFeedEl.innerHTML = "<p>Ingen data.</p>";
        return;
    }

    // ---------- Hent teamets medlemmer ----------
    async function fetchTeamMembers() {
        try {
            const res = await fetch(`${API_BASE}/api/team/users?team=${teamName}`);
            if (!res.ok) throw new Error("Bad response");
            return await res.json();
        } catch (err) {
            console.warn("Kunne ikke hente team-medlemmer:", err);
            return [];
        }
    }

    // ---------- Hent teamets feed ----------
    async function fetchTeamFeed() {
        try {
            const res = await fetch(`${API_BASE}/api/team/feed?team=${teamName}`);
            if (!res.ok) throw new Error("Bad response");
            return await res.json();
        } catch (err) {
            console.warn("Kunne ikke hente team-feed:", err);
            return [];
        }
    }

    // ---------- Render medlemmer ----------
    async function renderMembers() {
        const members = await fetchTeamMembers();

        if (members.length === 0) {
            teamMembersEl.innerHTML = "<p>Ingen medlemmer endnu.</p>";
            return;
        }

        teamMembersEl.innerHTML = members
            .map(m => `<div class="member-item">${m.name}</div>`)
            .join("");
    }

    // ---------- Render feed ----------
    async function renderFeed() {
        const feed = await fetchTeamFeed();

        if (feed.length === 0) {
            teamFeedEl.innerHTML = "<p>Ingen aktiviteter endnu.</p>";
            return;
        }

        teamFeedEl.innerHTML = feed
            .map(item => {
                const time = new Date(item.created_at).toLocaleTimeString("da-DK", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });

                return `<div class="feed-item">
                    <strong>${item.name}</strong> kl. ${time}: ${item.activity}
                </div>`;
            })
            .join("");
    }

    // ---------- Init ----------
    renderMembers();
    renderFeed();

    // Opdater dashboard hvert 20. sekund
    setInterval(() => {
        renderMembers();
        renderFeed();
    }, 20000);
});
