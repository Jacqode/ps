async function loadFeed() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "Indlæser…";

  try {
    const res = await fetch(`${apiBase}/api/feed?companyId=${getCompanyId()}`);
    if (!res.ok) throw new Error("Backend gav ikke OK");
    const list = await res.json();

    if (!Array.isArray(list)) {
      feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
      return;
    }

    feed.innerHTML = "";
    if (list.length === 0) {
      feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
      return;
    }

    list.forEach(item => {
      const div = document.createElement("div");
      div.textContent = `${item.timestamp} – ${item.name} lavede: ${item.activity}`;
      feed.appendChild(div);
    });
  } catch (e) {
    feed.innerHTML = "Ingen data endnu – vær den første til at tage en pause.";
  }
}
