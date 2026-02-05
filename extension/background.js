// Lytter efter beskeder fra content.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SET_REMINDER") {
    const { companyId, time } = msg;

    // Gem tidspunktet i extension storage
    chrome.storage.local.set({ reminderTime: time, companyId: companyId });

    // Ryd gamle alarmer
    chrome.alarms.clearAll(() => {
      // Opret ny alarm
      chrome.alarms.create("plugpauseReminder", {
        when: Date.now() + timeUntil(time),
        periodInMinutes: 24 * 60 // dagligt
      });
    });

    sendResponse({ status: "OK" });
  }
});

// Når alarmen går af → send notifikation
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "plugpauseReminder") {
    chrome.storage.local.get(["companyId"], (data) => {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Plug & Pause",
        message: `Tid til en pause – ${data.companyId || "din virksomhed"}`,
        priority: 2
      });
    });
  }
});

// Beregn hvor lang tid der er til næste reminder
function timeUntil(timeString) {
  const [h, m] = timeString.split(":").map(Number);
  const now = new Date();
  const target = new Date();

  target.setHours(h, m, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target - now;
}
