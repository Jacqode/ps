// Beder om notifikationstilladelse
function requestNotificationPermission() {
    if (Notification.permission === "default") {
        Notification.requestPermission();
    }
}

// Sender selve påmindelsen
function sendReminder() {
    if (Notification.permission === "granted") {
        new Notification("Plug & Pause", {
            body: "Tid til en kort pause 🌿",
        });
    }
}

// Starter loopet baseret på brugerens interval
function startReminderLoop() {
    const interval = Number(localStorage.getItem("reminderInterval")) || 30;
    setInterval(sendReminder, interval * 60 * 1000);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    requestNotificationPermission();
    startReminderLoop();
});
