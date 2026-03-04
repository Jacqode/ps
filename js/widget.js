document.addEventListener("DOMContentLoaded", () => {
    const ideaBtn = document.getElementById("ideaBtn");
    const doneBtn = document.getElementById("doneBtn");
    const currentIdea = document.getElementById("currentIdea");
    const feed = document.getElementById("feed");
    const microFeedback = document.getElementById("microFeedback");

    const ideas = [
        "Stræk armene over hovedet",
        "Rul skuldrene 10 gange",
        "Rejs dig op og stræk benene",
        "Tag 5 dybe vejrtrækninger",
        "Ryst hænderne i 10 sekunder"
    ];

    function saveBreak(text) {
        const list = JSON.parse(localStorage.getItem("feed") || "[]");
        list.unshift({ text, time: new Date().toLocaleTimeString() });
        localStorage.setItem("feed", JSON.stringify(list));
        renderFeed();
    }

    function renderFeed() {
        const list = JSON.parse(localStorage.getItem("feed") || "[]");

        if (list.length === 0) {
            feed.innerHTML = "<p>Ingen aktiviteter endnu.</p>";
            return;
        }

        feed.innerHTML = list
            .map(item => `<div class="feed-item">${item.time}: ${item.text}</div>`)
            .join("");
    }

    ideaBtn.addEventListener("click", () => {
        const idea = ideas[Math.floor(Math.random() * ideas.length)];
        currentIdea.textContent = idea;
    });

    doneBtn.addEventListener("click", () => {
        if (!currentIdea.textContent) return;

        saveBreak(currentIdea.textContent);

        microFeedback.textContent = "Godt gået!";
        microFeedback.style.opacity = 1;

        setTimeout(() => {
            microFeedback.style.opacity = 0;
        }, 1500);
    });

    renderFeed();
});
