// ---------------------------------------------------------
// 1) Hent firma-ID fra script-URL
// ---------------------------------------------------------
export function getCompanyId() {
  try {
    const url = new URL(import.meta.url);
    return url.searchParams.get("companyId") || "UNKNOWN_COMPANY";
  } catch {
    return "FirmaJ";
  }
}

// ---------------------------------------------------------
// 2) Generér eller hent anonymt user-ID
// ---------------------------------------------------------
export function getOrCreateUserId() {
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
export const aktiviteter = [
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
export function rulTerning() {
  const index = Math.floor(Math.random() * aktiviteter.length);
  return aktiviteter[index];
}

// ---------------------------------------------------------
// 5) API-kald (Pause)
// ---------------------------------------------------------
export async function sendPause(userId, companyId) {
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
export async function sendSocialEvent(groupId, userId, activity, name) {
  return fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupId,
      userId,
      name,
      activity
    })
  });
}
