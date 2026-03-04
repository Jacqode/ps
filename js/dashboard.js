import { createLineChart, createBarChart } from "./charts.js";

document.addEventListener("DOMContentLoaded", () => {
  const teamBox = document.getElementById("teamStatusBox");
  const breakList = document.getElementById("breakList");

  async function loadDashboard() {
    // Fallback-data (erstattes af Cloudflare API senere)
    const team = {
      name: "Sundhed",
      members: 5,
      breaksToday: 14
    };

    const recent = [
      { name: "Jakob", time: "14:03", text: "Stræk armene 🙆‍♂️" },
      { name: "Ukendt", time: "13:55", text: "10 dybe vejrtrækninger 🌬️" },
      { name: "Maria", time: "13:40", text: "Ryst hænderne 🤲" },
      { name: "Jonas", time: "13:20", text: "10 tåhævninger 🦶" },
      { name: "Sofie", time: "13:05", text: "Rul skuldrene 🔄" }
    ];

    teamBox.innerHTML = `
      <p><strong>Team:</strong> ${team.name}</p>
      <p><strong>Medlemmer:</strong> ${team.members}</p>
      <p><strong>Pauser i dag:</strong> ${team.breaksToday}</p>
    `;

    breakList.innerHTML = recent
      .map(b => `
        <div class="feed-item">
          <strong>${b.name}</strong> kl. ${b.time}: ${b.text}
        </div>
      `)
      .join("");

    // Eksempel på grafer (kan fjernes hvis du ikke vil bruge dem endnu)
    const lineCtx = document.getElementById("lineChart");
    const barCtx = document.getElementById("barChart");

    if (lineCtx) {
      createLineChart(lineCtx, ["Man", "Tir", "Ons", "Tor", "Fre"], [3, 5, 4, 6, 2]);
    }

    if (barCtx) {
      createBarChart(barCtx, ["Jakob", "Maria", "Jonas"], [5, 3, 4]);
    }
  }

  loadDashboard();
});
