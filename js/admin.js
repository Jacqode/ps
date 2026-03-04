document.addEventListener("DOMContentLoaded", () => {
  const statsEl = document.getElementById("systemStats");
  const teamEl = document.getElementById("teamList");

  async function loadAdminData() {
    // Fallback-data (erstattes af Cloudflare API senere)
    const stats = {
      totalUsers: 12,
      totalTeams: 3,
      totalBreaks: 87
    };

    const teams = [
      { name: "Sundhed", members: 5, breaks: 40 },
      { name: "IT", members: 4, breaks: 27 },
      { name: "HR", members: 3, breaks: 20 }
    ];

    statsEl.innerHTML = `
      <p><strong>Brugere:</strong> ${stats.totalUsers}</p>
      <p><strong>Teams:</strong> ${stats.totalTeams}</p>
      <p><strong>Pauser i alt:</strong> ${stats.totalBreaks}</p>
    `;

    teamEl.innerHTML = teams
      .map(t => `
        <div class="feed-item">
          <strong>${t.name}</strong><br>
          ${t.members} medlemmer – ${t.breaks} pauser
        </div>
      `)
      .join("");
  }

  loadAdminData();
});
