// === Plug & Pause – Reminderfunktion (bygger oven på widget.js) ===

const PP_DEFAULT_INTERVAL_MIN = 40;
const PP_DURATION_SEC = 30;

const ppTabId = sessionStorage.getItem("pp_tab") || crypto.randomUUID();
sessionStorage.setItem("pp_tab", ppTabId);

function ppIsLeader() {
  const raw = localStorage.getItem("pp_leader");
  if (!raw) return true;
  try {
    const data = JSON.parse(raw);
    const age = Date.now() - data.ts;
    return age > 8000 || data.tabId === ppTabId;
  } catch {
    return true;
  }
}

function ppHeartbeat() {
  if (ppIsLeader()) {
    localStorage.setItem("pp_leader", JSON.stringify({ tabId: ppTabId, ts: Date.now() }));
  }
}
setInterval(ppHeartbeat, 3000);

let ppTimer = null;

function ppSchedule(fromNow = true) {
  clearTimeout(ppTimer);
  const intervalMs = PP_DEFAULT_INTERVAL_MIN * 60 * 1000;
  const delay = fromNow ? intervalMs : Math.max(0, intervalMs - (Date.now() - (window.ppLastReminder || 0)));
  ppTimer = setTimeout(() => {
    if (ppIsLeader()) ppTriggerReminder();
  }, delay);
}

async function ppTriggerReminder() {
  window.ppLastReminder = Date.now();

  const permission = await ppEnsurePermission();
  if (permission === "granted") {
    new Notification("Tid til en mikropause", {
      body: `Klik for at få en aktivitet (ca. ${PP_DURATION_SEC} sek.)`,
      tag: "plugpause"
    }).onclick = () => {
      window.focus();
      ppFireIdea();
    };
  } else {
    ppShowModal();
  }

  ppSchedule(true);
}

async function ppEnsurePermission() {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

function ppFireIdea() {
  const btn = document.getElementById("ideaBtn");
  if (btn) btn.click();
}

function ppShowModal() {
  const root = document.createElement("div");
  root.className = "pp-modal";
  root.innerHTML = `
    <div class="pp-card">
      <h3>Mikropause</h3>
      <p>Vil du have en ny aktivitet nu?</p>
      <button id="pp-now">Ja, giv mig en</button>
      <button id="pp-snooze">Snooze 5 min</button>
      <button id="pp-close">Luk</button>
    </div>
  `;
  document.body.appendChild(root);

  document.getElementById("pp-now").onclick = () => {
    ppFireIdea();
    root.remove();
  };
  document.getElementById("pp-snooze").onclick = () => {
    root.remove();
    clearTimeout(ppTimer);
    ppTimer = setTimeout(ppTriggerReminder, 5 * 60 * 1000);
  };
  document.getElementById("pp-close").onclick = () => {
    root.remove();
  };
}

(function ppInit() {
  ppHeartbeat();
  ppSchedule(true);
})();
