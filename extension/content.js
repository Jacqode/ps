// Find companyId ud fra URL'en
function getCompanyId() {
  const path = window.location.pathname;
  const match = path.match(/\/ps\/(.*)\.html/);

  if (match && match[1]) {
    return match[1].toUpperCase(); // FirmaJ → FIRMAJ
  }

  return "DEMO";
}

// Find reminder-tidspunkt fra localStorage
function getReminderTime() {
  return localStorage.getItem("reminderTime");
}

// Send data til background.js
function sendReminderSettings() {
  const companyId = getCompanyId();
  const time = getReminderTime();

  if (!time) return; // ingen reminder sat endnu

  chrome.runtime.sendMessage(
    {
      type: "SET_REMINDER",
      companyId: companyId,
      time: time
    },
    (response) => {
      // valgfrit: console.log("Reminder opdateret", response);
    }
  );
}

// Kør når siden loader
sendReminderSettings();

// Lyt efter ændringer i localStorage (hvis brugeren ændrer tidspunkt)
window.addEventListener("storage", (event) => {
  if (event.key === "reminderTime") {
    sendReminderSettings();
  }
});
