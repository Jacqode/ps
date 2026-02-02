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
  "Stræk armene
