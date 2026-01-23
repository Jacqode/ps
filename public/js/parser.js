// parser.js
export function parseEvents(raw) {
  return (raw || [])
    .map(e => {
      const ts = e && e.timestamp;
      if (!ts) return null;
      const d = new Date(ts);
      if (isNaN(d.getTime())) {
        console.warn('Invalid timestamp skipped', ts);
        return null;
      }
      return { ...e, timestamp: d.toISOString() };
    })
    .filter(Boolean);
}
