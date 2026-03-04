document.addEventListener("DOMContentLoaded", () => {
    const ideaBtn = document.getElementById("ideaBtn");
    const doneBtn = document.getElementById("doneBtn");
    const currentIdea = document.getElementById("currentIdea");
    const feed = document.getElementById("feed");
    const microFeedback = document.getElementById("microFeedback");
    const greeting = document.getElementById("greeting");

    const API_BASE = "https://plugandpause-backend.jakobhelkjaer.workers.dev";

    // Sprog
    const lang = localStorage.getItem("lang") || "da";
    const t = {
        da: {
            unknown: "Hej ukendt",
            done: "Godt gået! 💚",
            feedTitle: "Det gør dine buddies:"
        },
        en: {
            unknown: "Hi stranger",
            done: "Nice job! 💚",
            feedTitle: "Your buddies are doing:"
        }
    };

    // Navn + team
    const savedName = localStorage.getItem("userName") || t[lang].unknown;
    const savedTeam = localStorage.getItem("teamName") || null;

    greeting.textContent = savedName;

    // Aktiviteter
    const ideas = [
        "Stræk armene over hovedet 🙆‍♂️",
        "Rul skuldrene 10 gange 🔄",
        "Rejs dig op og stræk benene 🧍‍♂️",
        "Tag 5 dybe vejrtrækninger 🌬️",
        "Ryst hænderne i 10 sekunder 🤲",
        "Drej nakken langsomt fra side til side 🧘‍♂️",
        "Lav 10 tåhævninger 🦶",
        "Stræk brystet ved at åbne armene ud til siden 👐",
        "Rul håndleddene i 20 sekunder ↻",
        "Lav 10 langsomme knæbøjninger 🏋️‍♂️",
        "Massér tindingerne i 20 sekunder 💆‍♀️",
        "Kig ud af vinduet og fokuser langt væk 👀",
        "Tag 10 rolige maveåndedrag 🌬️",
        "Stræk siden ved at række én arm op og over kroppen ↗️",
        "Ryst hele kroppen let i 15 sekunder 🕺"
    ];

    function getTime() {
        const d = new Date();
        return d.toLocaleTimeString("da-DK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }

    // Gem lokalt (fallback)
    function saveLocal(text) {
        const list = JSON.parse(localStorage.getItem("feed") || "[]");
        list.unshift({
            name: savedName,
            team: savedTeam,
            text,
            time: getTime()
        });
        localStorage.setItem("feed", JSON.stringify(list));
    }

    // Send pause til backend
    async function saveBreak(text) {
        const payload = {
            name: savedName,
            team: savedTeam,
            activity: text
        };

        try {
            await fetch(`${API_BASE}/api/break`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            // fallback til localStorage
            saveLocal(text);
        }

        renderFeed();
    }

    // Hent feed fra backend
    async function fetchFeed() {
        try {
            const res = await fetch(`${API_BASE}/api/feed`);
            if (!res.ok) throw new Error("Bad response");
            const data = await res.json();

            // Konverter backend-data til widget-format
            return data.map(item => ({
                name: item.name,
                team: item.team,
                text: item.activity,
                time: new Date(item.created_at).toLocaleTimeString("da-DK", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                })
            }));
        } catch (err) {
            // fallback til localStorage
            return JSON.parse(localStorage.getItem("feed") || "[]");
        }
    }

    // Vis feed (seneste 5)
    async function renderFeed() {
        const list = await fetchFeed();
        const latest = list.slice(0, 5);

        if (latest.length === 0) {
            feed.innerHTML = "<p>Ingen aktiviteter endnu.</p>";
            return;
        }

        feed.innerHTML = latest
            .map(item =>
                `<div class="feed-item"><strong>${item.name}</strong>${item.team ? " (" + item.team + ")" : ""} kl. ${item.time}: ${item.text}</div>`
            )
            .join("");
    }

    ideaBtn.addEventListener("click", () => {
        const idea = ideas[Math.floor(Math.random() * ideas.length)];
        currentIdea.style.opacity = 1;
        currentIdea.textContent = idea;
    });

    doneBtn.addEventListener("click", () => {
        if (!currentIdea.textContent) return;

        saveBreak(currentIdea.textContent);

        microFeedback.textContent = t[lang].done;
        microFeedback.style.opacity = 1;

        setTimeout(() => {
            microFeedback.style.opacity = 0;
        }, 3000);

        setTimeout(() => {
            currentIdea.style.opacity = 0;
        }, 3000);
    });

    renderFeed();
});
