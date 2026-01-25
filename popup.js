// 1) Læs userId og companyId fra URL-hash første gang (hvis du bruger links)
const hash = window.location.hash; // fx "#user=U123&company=C9"

if (hash) {
  const params = new URLSearchParams(hash.substring(1));
  const userId = params.get("user");
  const companyId = params.get("company");

  if (userId && companyId) {
    chrome.storage.local.set({ userId, companyId });
  }
}

// 2) Hent eksisterende pause-count
chrome.storage.local.get(["pauseCount"], (data) => {
  const count = data.pauseCount || 0;
  document.getElementById("count").textContent = "Pauser: " + count;
});

// 3) Når brugeren trykker på knappen
document.getElementById("pauseBtn").onclick = () => {
  chrome.storage.local.get(["pauseCount", "userId", "companyId"], (data) => {
    const newCount = (data.pauseCount || 0) + 1;

    // gem lokalt
    chrome.storage.local.set({ pauseCount: newCount });

    // opdater dashboard
    document.getElementById("count").textContent = "Pauser: " + newCount;

    // her kan du senere sende til backend
  });
};
