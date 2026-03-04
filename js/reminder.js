document.addEventListener("DOMContentLoaded", () => {
    const interval = parseInt(localStorage.getItem("reminderInterval"), 10);

    if (!interval) return;

    setInterval(() => {
        alert("Tid til en kort pause 💚");
    }, interval * 60 * 1000);
});
