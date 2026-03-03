// Dynamisk hilsen
function setGreeting() {
    const userName = localStorage.getItem("userName") || "ven";
    const greetingEl = document.getElementById("greeting");
    if (greetingEl) greetingEl.textContent = `Hej ${userName} 😊`;
}

// Hent aktivitet
async function getActivity() {
    try {
        const res = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/activity");
        if (!res.ok) return "Tag en kort pause 🌿";
        const data = await res.json();
        return data.activity;
    } catch {
        return "Tag en kort pause 🌿";
    }
}

// Send pause til backend
async function submitPause(activityText) {
    try {
        await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/pause", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                activity: activityText,
                timestamp: new Date().toISOString(),
                user: localStorage.getItem("userName") || "ven"
            })
        });
    } catch (err) {
        console.error("Fejl ved submitPause:", err);
    }
}

// Hent feed
async function loadFeed() {
    try {
        const res = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/feed");
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

// Render feed
function renderFeed(items) {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    if (!items.length) {
        feed.innerHTML = "<p>Ingen aktiviteter endnu.</p>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "feed-item";

        const t = new Date(item.timestamp);
        const time = t.toLocaleTimeString("da-DK", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Copenhagen"
        });

        div.textContent = `${item.user} lavede: ${item.activity} (${time})`;
        feed.appendChild(div);
    });
}

// Micro-feedback
function showMicroFeedback() {
    const el = document.getElementById("microFeedback");
    const userName = localStorage.getItem("userName") || "ven";
    el.textContent = `Godt gået, ${userName}!`;
    el.style.opacity = "1";
    setTimeout(() => el.style.opacity = "0", 1500);
}

// Init
async function initWidget() {
    setGreeting();

    const ideaBtn = document.getElementById("ideaBtn");
    const doneBtn = document.getElementById("doneBtn");
    const currentIdea = document.getElementById("currentIdea");

    ideaBtn.addEventListener("click", async () => {
        currentIdea.textContent = await getActivity();
    });

    doneBtn.addEventListener("click", async () => {
        const text = currentIdea.textContent || "Ukendt aktivitet";
        await submitPause(text);
        showMicroFeedback();
        renderFeed(await loadFeed());
    });

    renderFeed(await loadFeed());
}

document.addEventListener("DOMContentLoaded", initWidget);
