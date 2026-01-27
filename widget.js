// ---------------------------------------------------------
// 1) DATA (skuffen med motionskort)
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
// 2) FORRETNINGSLOGIK (terningen)
// ---------------------------------------------------------

// Træk en tilfældig aktivitet
function rulTerning() {
  const index = Math.floor(Math.random() * aktiviteter.length);
  return aktiviteter[index];
}


// ---------------------------------------------------------
// 3) API-KALD (elektrikeren sender besked til kælderen)
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
// 4) UI-HÅNDTERING (knapper, DOM, visning)
// ---------------------------------------------------------

// Når brugeren ruller terningen
document.getElementById("rollBtn").onclick = () => {
  const aktivitet = rulTerning();
  document.getElementById("aktivitet").textContent = aktivitet;
};

// Når brugeren er færdig og registrerer pausen
document.getElementById("doneBtn").onclick = async () => {
  await sendPause("JAKOB123", "TEST");
  document.getElementById("status").textContent = "Pause registreret!";
};
