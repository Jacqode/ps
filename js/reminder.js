function requestNotificationPermission() {
    if (Notification.permission === "default") {
        Notification.requestPermission();
    }
}

function sendReminder() {
    if (Notification.permission === "granted") {
        new Notification("Plug & Pause", {
            body: "Tid til en kort pause 🌿",
        });
    }
}

function startReminderLoop() {
    const interval = Number(localStorage.getItem("reminderInterval")) || 30;
    setInterval(sendReminder, interval * 60 * 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    requestNotificationPermission();
    startReminderLoop();
});
