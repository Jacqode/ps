// reminder.js — Plug & Pause reminderfunktion (vanilla JS)
// Kræver at widget.js allerede er indlæst og at elementer med id'erne
// "ideaBtn" og evt. "doneBtn" findes i DOM.

(() => {
  const DEFAULT_INTERVAL_MIN = 40;   // standard hyppighed
  const DEFAULT_DURATION_SEC = 30;   // informativ varighed
  const SNOOZE_MIN = 5;

  // unik tab-id for cross-tab koordinering
  const tabId = sessionStorage.getItem('pp_tab') || crypto.randomUUID();
  sessionStorage.setItem('pp_tab', tabId);

  // leader-heartbeat i localStorage for at undgå dobbelte reminders
  const LEADER_KEY = 'pp_leader_v1';
  function getLeader() {
    try { return JSON.parse(localStorage.getItem(LEADER_KEY)); } catch { return null; }
  }
  function setLeader(obj) { localStorage.setItem(LEADER_KEY, JSON.stringify(obj)); }

  function isLeader() {
    const l = getLeader();
    if (!l) return true;
    const age = Date.now() - (l.ts || 0);
    return age > 9000 || l.tabId === tabId;
  }

  function heartbeat() {
    if (isLeader()) setLeader({ tabId, ts: Date.now() });
  }
  setInterval(heartbeat, 3000);
  heartbeat();

  // scheduler
  let timerId = null;
  let lastReminderTs = null;

  function scheduleNext(delayMs) {
    clearTimeout(timerId);
    const d = typeof delayMs === 'number' ? delayMs : DEFAULT_INTERVAL_MIN * 60 * 1000;
    timerId = setTimeout(() => {
      if (isLeader()) triggerReminder();
    }, d);
  }

  // ensure Notification permission
  async function ensureNotificationPermission() {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  // trigger reminder: notification or modal fallback
  async function triggerReminder() {
    lastReminderTs = Date.now();
    const perm = await ensureNotificationPermission();

    if (perm === 'granted') {
      const n = new Notification('Tid til en mikropause', {
        body: `Klik for at få en aktivitet (ca. ${DEFAULT_DURATION_SEC} sek.)`,
        tag: 'plugpause'
      });
      n.onclick = () => {
        window.focus();
        fireIdea();
      };
    } else {
      showModal();
    }

    // planlæg næste
    scheduleNext();
  }

  // klikker på eksisterende "Klik og få en let aktivitet"-knap
  function fireIdea() {
    const btn = document.getElementById('ideaBtn');
    if (btn) {
      try { btn.click(); } catch (e) { /* no-op */ }
    } else {
      // hvis knappen ikke findes endnu, prøv igen kort efter
      setTimeout(fireIdea, 200);
    }
  }

  // modal fallback UI
  function showModal() {
    // undgå at oprette flere modaler
    if (document.querySelector('.pp-modal')) return;

    const root = document.createElement('div');
    root.className = 'pp-modal';
    root.innerHTML = `
      <div class="pp-card" role="dialog" aria-modal="true" aria-label="Mikropause">
        <h3>Mikropause</h3>
        <p>Vil du have en aktivitet nu? Varighed: ${DEFAULT_DURATION_SEC} sek.</p>
        <div class="pp-actions">
          <button id="pp-now" class="primary">Ja, giv mig en</button>
          <button id="pp-snooze">Snooze ${SNOOZE_MIN} min</button>
          <button id="pp-close">Luk</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const remove = () => { root.remove(); };

    root.querySelector('#pp-now').addEventListener('click', () => {
      fireIdea();
      remove();
    });
    root.querySelector('#pp-snooze').addEventListener('click', () => {
      remove();
      clearTimeout(timerId);
      scheduleNext(SNOOZE_MIN * 60 * 1000);
    });
    root.querySelector('#pp-close').addEventListener('click', () => {
      remove();
    });
  }

  // hvis bruger klikker "done" i widget, kan vi logge tidspunkt (valgfrit)
  const doneBtn = document.getElementById('doneBtn');
  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      // opdater sidste reminder så næste planlægning starter fra nu
      lastReminderTs = Date.now();
      clearTimeout(timerId);
      scheduleNext();
    });
  }

  // synkroniser across tabs: hvis en anden fane viser reminder, vi skal ikke duplikere
  window.addEventListener('storage', (ev) => {
    if (ev.key === LEADER_KEY) {
      // hvis leader ændres, genberegn om vi skal være leader
      // heartbeat-funktionen håndterer det; her kan vi reschedule hvis nødvendigt
      // ingen yderligere handling nødvendig
    }
  });

  // start scheduler når DOM er klar (sikrer widget.js er kørt)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scheduleNext();
    });
  } else {
    scheduleNext();
  }

  // eksponér et simpelt API for debugging (valgfrit)
  window.__ppReminder = {
    scheduleNow: () => { clearTimeout(timerId); scheduleNext(0); },
    snoozeMinutes: (m) => { clearTimeout(timerId); scheduleNext(m * 60 * 1000); },
    getTabId: () => tabId,
    isLeader: isLeader
  };
})();
