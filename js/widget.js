// Submit a completed pause to the backend
async function submitPause(activityText) {
    try {
        const response = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/pause", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                activity: activityText,
                timestamp: new Date().toISOString(),
                user: localStorage.getItem("userName") || "Jakob"
            })
        });

        if (!response.ok) {
            console.error("Fejl ved submitPause:", response.statusText);
        }
    } catch (error) {
        console.error("Netværksfejl ved submitPause:", error);
    }
}

// Load feed from backend
async function loadFeed() {
    try {
        const response = await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/feed");
        if (!response.ok) {
            console.error("Fejl ved hentning af feed:", response.statusText);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("Netværksfejl ved hentning af feed:", error);
        return [];
    }
}

// Render feed items into the UI
function renderFeed(feedItems) {
    const feedContainer = document.getElementById("feed");
    if (!feedContainer) return;

    feedContainer.innerHTML = "";

    if (!feedItems || feedItems.length === 0) {
        feedContainer.innerHTML = "<p>Ingen aktiviteter endnu – tryk på ‘Få en aktivitet’ for at komme i gang.</p>";
        return;
    }

    feedItems.forEach(item => {
        const div = document.createElement("div");
        div.className = "feed-item";

        const time = new Date(item.timestamp);
        const formatted = time.toLocaleTimeString("da-DK", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Copenhagen"
        });

        div.textContent = `${item.user} lavede: ${item.activity} (${formatted})`;
        feedContainer.appendChild(div
