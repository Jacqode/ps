// JavaScript = Elektrikeren i køkkenet
// Denne funktion sender en besked ned i kælderen (Cloudflare Worker)
// om at brugeren har taget en pause.

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

// Når brugeren trykker på knappen (doneBtn),
// så sender vi pausen og opdaterer displayet på widgeten.

document.getElementById("doneBtn").onclick = async () => {
  await sendPause("JAKOB123", "TEST");
  document.getElementById("status").textContent = "Pause registreret!";
};
