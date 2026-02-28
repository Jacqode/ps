// reminder.js — debug‑venlig version
(() => {
  const INTERVAL_MIN = 40;
  const DURATION_SEC = 30;
  const SNOOZE_MIN = 5;
  const CHANNEL = 'plugpause_channel_v1';
  const LEADER_KEY = 'pp_leader_v2';

  console.info('[pp] reminder.js loaded');

  // tab id
  const tabId = sessionStorage.getItem('pp_tab') || crypto.randomUUID();
  sessionStorage.setItem('pp_tab', tabId);
  console.debug('[pp] tabId', tabId);

  // BroadcastChannel for cross-tab messages (fallback safe-guard)
  let bc = null;
  try { bc = new BroadcastChannel(CHANNEL); } catch (e) { console.warn('[pp] BroadcastChannel not available', e); }

  // leader heartbeat via localStorage
  function getLeader() {
    try { return JSON.parse(localStorage.getItem(LEADER_KEY)); } catch { return null; }
  }
  function setLeader(obj) { localStorage.setItem(LEADER_KEY, JSON.stringify(obj)); }

  function amILeader() {
    const l = getLeader();
    if (!l) return true;
    const age = Date.now() - (l.ts || 0);
    const leader = (age > 9000) || (l.tabId === tabId);
    console.debug('[pp] amILeader', leader, 'leaderAgeMs', age);
    return leader;
  }

  function heartbeat() {
    if (amILeader()) setLeader({ tabId, ts: Date.now() });
    if (bc) bc.postMessage({ type: 'heartbeat', tabId, ts: Date.now() });
  }
  setInterval(heartbeat, 3000);
  heartbeat();

  // scheduler
  let timer = null;
  function schedule(ms) {
    clearTimeout(timer);
    const delay = (typeof ms === 'number') ? ms : INTERVAL_MIN * 60 * 1000;
    console.info('[pp] scheduling next reminder in ms', delay);
    timer = setTimeout(() => {
      if (amILeader()) triggerReminder();
      else console.info('[pp] not leader at trigger time, skipping');
    }, delay);
  }

  // ensure Notification permission
  async function ensurePermission() {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try { return await Notification.requestPermission(); } catch (e) { console.warn('[pp] permission request failed', e); return 'denied'; }
  }

  // robust click helper: retry until ideaBtn exists
  function fireIdea(retries = 6) {
    const btn = document.getElementById('ideaBtn');
    if (btn) {
      try { btn.click(); console.info('[pp] fired ideaBtn click'); } catch (e) { console.error('[pp] click failed', e); }
      return true;
    }
    if (retries > 0) {
      console.debug('[pp] ideaBtn not found, retrying in 200ms', retries);
      setTimeout(() => fireIdea(retries - 1), 200);
      return false;
    }
    console.warn('[pp] ideaBtn not found after retries');
    return false;
  }

  // modal fallback
  function showModal() {
    if (document.querySelector('.pp-modal')) return;
    const root = document.createElement('div');
    root.className = 'pp-modal';
    root.innerHTML = `
      <div class="pp-card" role="dialog" aria-modal="true" aria-label="Mikropause">
        <h3>Mikropause</h3>
        <p>Vil du have en aktivitet nu? Varighed: ${DURATION_SEC} sek.</p>
        <div class="pp-actions">
          <button id="pp-now" class="primary">Ja, giv mig en</button>
          <button id="pp-snooze">Snooze ${SNOOZE_MIN} min</button>
          <button id="pp-close">Luk</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    root.querySelector('#pp-now').addEventListener('click', () => { fireIdea(); root.remove(); });
    root.querySelector('#pp-snooze').addEventListener('click', () => { root.remove(); clearTimeout(timer); schedule(SNOOZE_MIN * 60 * 1000); });
    root.querySelector('#pp-close').addEventListener('click', () => root.remove());
    console.info('[pp] modal shown');
  }

  // trigger
  async function triggerReminder() {
    console.info('[pp] triggerReminder called');
    const perm = await ensurePermission();
    if (perm === 'granted') {
      try {
        const n = new Notification('Tid til en mikropause', {
          body: `Klik for at få en aktivitet (ca. ${DURATION_SEC} sek.)`,
          tag: 'plugpause'
        });
        n.onclick = () => { window.focus(); fireIdea(); };
        console.info('[pp] notification shown');
      } catch (e) {
        console.error('[pp] Notification error', e);
        showModal();
      }
    } else {
      console.info('[pp] permission not granted, showing modal');
      showModal();
    }
    schedule(); // schedule next after trigger
  }

  // BroadcastChannel messages handling
  if (bc) {
    bc.onmessage = (ev) => {
      const m = ev.data;
      if (!m) return;
      if (m.type === 'request_trigger' && amILeader()) triggerReminder();
      if (m.type === 'heartbeat') { /* optional: could reschedule */ }
    };
  }

  // expose debug API
  window.__ppReminder = {
    scheduleNow: () => { clearTimeout(timer); schedule(0); },
    snoozeMinutes: (m) => { clearTimeout(timer); schedule(m * 60 * 1000); },
    status: () => ({ tabId, leader: getLeader(), isLeader: amILeader(), nextTimer: !!timer }),
    forceTrigger: () => triggerReminder()
  };

  // start when DOM ready
  function startWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { console.info('[pp] DOMContentLoaded'); schedule(); });
    } else {
      schedule();
    }
  }
  startWhenReady();

  // helpful console hints
  console.info('[pp] debug helpers: window.__ppReminder.scheduleNow(), .snoozeMinutes(m), .status(), .forceTrigger()');
})();
