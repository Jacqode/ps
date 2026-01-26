document.getElementById("doneBtn").onclick = async () => {
  await fetch("https://plugandpause-backend.jakobhelkjaer.workers.dev/pause", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "JAKOB123",
      companyId: "TEST",
      timestamp: Date.now()
    })
  });

  document.getElementById("status").textContent = "Pause registreret!";
};

