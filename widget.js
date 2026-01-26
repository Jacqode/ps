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

document.getElementById("doneBtn").onclick = async () => {
  await sendPause("JAKOB123", "TEST");
  document.getElementById("status").textContent = "Pause registreret!";
};


