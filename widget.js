// ---------------------------------------------------------
// 1) Hent firma-ID fra script-URL
// ---------------------------------------------------------

function getCompanyId() {
  try {
    const url = new URL(import.meta.url);
    return url.searchParams.get("companyId") || "UNKNOWN_COMPANY";
  } catch {
    return "UNKNOWN_COMPANY";
  }
}

// ---------------------------------------------------------
// 2) Generér eller hent anonymt user-ID
// ---------------------------------------------------------

function getOrCreateUserId() {
  let userId = localStorage.getItem("pp_userId");

  if (!userId) {
    userId = "u_" + Math.random().toString(16).slice(2, 10);
    localStorage.setItem("pp_userId", userId);
  }

  return userId;
}

// ---------------------------------------------------------
// 3) DATA (aktiviteter)
// ---------------------------------------------------------

const aktiviteter = [
  "Lav 10 squats",
  "Hop 20 gange",
  "Stræk armene i 30 sekunder",
  "Gå en tur rundt om stolen",
  "Lav 5 dybe vejrtrækninger",
  "Planke i 20 sekunder"
];

// ---------------------------------------------------------
// 4) Forretningslogik (terning)
// ---------------------------------------------------------

function rulTerning() {
  const index = Math.floor(Math.random() * aktiviteter.length);
  return aktiviteter[index];
}

// ---------------------------------------------------------
// 5) API-kald (Firma J)
// ---------------------------------------------------------

async function sendPause(userId, companyId) {
  return fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/pause", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      companyId,
      timestamp: Date.now()
    })
  });
}

// ---------------------------------------------------------
// 6) API-kald (Social Feature)
// ---------------------------------------------------------

async function sendSocialEvent(groupId, userId, activity) {
  return fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupId,
      userId,
      activity
    })
  });
}

// ---------------------------------------------------------
// 7) UI-håndtering
// ---------------------------------------------------------

let currentActivity = null;

document.getElementById("rollBtn").onclick = () => {
  currentActivity = rulTerning();
  document.getElementById("aktivitet").textContent = currentActivity;
};

document.getElementById("doneBtn").onclick = async () => {
  const companyId = getCompanyId();
  const userId = getOrCreateUserId();

  // Firma J registrering
  await sendPause(userId, companyId);

  // Social registrering
  await sendSocialEvent(companyId, userId, currentActivity);

  document.getElementById("status").textContent = "Pause registreret!";
};
