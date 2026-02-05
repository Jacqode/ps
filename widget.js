const apiBase = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

function getCompanyId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("companyId") || "FIRMAJ";
}

async function getIdea() {
  const res = await fetch(`${apiBase}/api/random?companyId=${getCompanyId()}`);
  const data = await res.json();
  return data.activity;
}

async function markDone(activity) {
  const name = localStorage.getItem("pp_name") || "Ukendt";
  await fetch(`${apiBase}/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      activity,
      companyId: getCompanyId()
    })
  });
}

async function loadFeed() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "Indlæser…";

  const res = await fetch(`${apiBase}/api/feed?companyId=${getCompanyId()}`);
  const list = await res.json();

  feed.innerHTML = "";
  list.forEach(item => {
    const div = document.createElement("div");
    div.textContent = `${item.time} – ${item.name} lavede: ${item.activity}`;
    feed.appendChild(div);
  });
}

document.getElementById("ideaBtn").onclick = async () => {
  const idea = await getIdea();
  document.getElementById("currentIdea").textContent = idea;
};

document.getElementById("doneBtn").onclick = async () => {
  const idea = document.getElementById("currentIdea").textContent;
  if (!idea) return;
  await markDone(idea);
  loadFeed();
};

document.getElementById("saveName").onclick = () => {
  const name = document.getElementById("nameInput").value.trim();
  if (name) localStorage.setItem("pp_name", name);
};

window.onload = () => {
  const saved = localStorage.getItem("pp_name");
  if (saved) document.getElementById("nameInput").value = saved;
  loadFeed();
};
