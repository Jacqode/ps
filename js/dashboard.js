document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

    const teamName = localStorage.getItem("teamName");
    const teamId = localStorage.getItem("teamId");

    const teamMembersEl = document.getElementById("teamMembers");
    const teamFeedEl = document.getElementById("teamFeed");
    const teamStatsEl = document.getElementById("teamStats");

    if (!teamName || !teamId) {
        teamMembersEl.innerHTML = "<p>Intet team valgt.</p>";
        teamFeedEl.innerHTML = "<p>Ingen data.</p>";
        teamStatsEl.innerHTML = "<p>Ingen statistik.</p>";
        return;
    }

    // ---------- API calls ----------
    async function fetchTeamMembers() {
        try {
            const res = await fetch(`${API_BASE}/api/team/users?team=${teamName}`);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch {
            return [];
        }
    }

    async function fetchTeamFeed() {
        try {
            const res = await fetch(`${API_BASE}/api/team/feed?team=${teamName}`);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch {
            return [];
        }
    }

    async function fetchTeamStats() {
        try {
            const res = await fetch(`${API_BASE}/api/team/stats?team=${teamName}`);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch {
            return {
                total_breaks: 0,
                breaks_per_user: [],
                breaks_per_day: []
            };
        }
    }

    // ---------- Render: medlemmer ----------
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

    // ---------- Render: feed ----------
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

    // ---------- Render: statistik ----------
    async function renderStats() {
        const stats = await fetchTeamStats();

        const perUser = stats.breaks_per_user
            .map(u => `<div>${u.name}: <strong>${u.count}</strong></div>`)
            .join("");

        const perDay = stats.breaks_per_day
            .map(d => `<div>${d.day}: <strong>${d.count}</strong></div>`)
            .join("");

        teamStatsEl.innerHTML = `
            <h3>Team statistik</h3>
            <p><strong>Total aktivitet:</strong> ${stats.total_breaks}</p>

            <h4>Aktivitet pr. medlem</h4>
            ${perUser || "<p>Ingen data.</p>"}

            <h4>Aktivitet pr. dag (seneste 7 dage)</h4>
            ${perDay || "<p>Ingen data.</p>"}
        `;
    }

    // ---------- Init ----------
    renderMembers();
    renderFeed();
    renderStats();

    // Auto-refresh hvert 20 sek.
    setInterval(() => {
        renderMembers();
        renderFeed();
        renderStats();
    }, 20000);
});
