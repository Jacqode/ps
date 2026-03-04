document.addEventListener("DOMContentLoaded", () => {
    const ideaBtn = document.getElementById("ideaBtn");
    const doneBtn = document.getElementById("doneBtn");
    const currentIdea = document.getElementById("currentIdea");
    const feed = document.getElementById("feed");
    const microFeedback = document.getElementById("microFeedback");
    const greeting = document.getElementById("greeting");

    // Hent navn fra settings (fallback: Jakob)
    const savedName = localStorage.getItem("userName") || "Jakob";

    // Hilsen med smiley
    greeting.textContent = "Hej " + savedName + " 😊";

    // 15 aktiviteter
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

    // 24-timers tidsformat
    function getTime() {
        const d = new Date();
        return d.toLocaleTimeString("da-DK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }

    // Gem aktivitet i feed (med navn)
    function saveBreak(text) {
        const list = JSON.parse(localStorage.getItem("feed") || "[]");
        list.unshift({
            name: savedName,
            text,
            time: getTime()
        });
        localStorage.setItem("feed", JSON.stringify(list));
        renderFeed();
    }

    // Vis feed
    function renderFeed() {
        const list = JSON.parse(localStorage.getItem("feed") || "[]");

        if (list.length === 0) {
            feed.innerHTML = "<p>Ingen aktiviteter endnu.</p>";
            return;
        }

        feed.innerHTML = list
            .map(item =>
                `<div class="feed-item"><strong>${item.name}</strong> kl. ${item.time}: ${item.text}</div>`
            )
            .join("");
    }

    // Få aktivitet
    ideaBtn.addEventListener("click", () => {
        const idea = ideas[Math.floor(Math.random() * ideas.length)];
        currentIdea.textContent = idea;
    });

    // Jeg er færdig
    doneBtn.addEventListener("click", () => {
        if (!currentIdea.textContent) return;

        saveBreak(currentIdea.textContent);

        microFeedback.textContent = "Godt gået! 💚";
        microFeedback.style.opacity = 1;

        setTimeout(() => {
            microFeedback.style.opacity = 0;
        }, 1500);
    });

    // Indlæs feed ved start
    renderFeed();
});
