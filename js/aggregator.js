// aggregator.js
export function groupByHour(events, hours = 24) {
  function hourKeyLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    const h = String(date.getHours()).padStart(2,'0');
    return `${y}-${m}-${d}T${h}`;
  }

  const now = new Date();
  now.setMinutes(0,0,0);
  const buckets = new Map();
  for (let i = hours - 1; i >= 0; i--) {
    const dt = new Date(now.getTime() - i * 3600_000);
    buckets.set(hourKeyLocal(dt), 0);
  }

  events.forEach(e => {
    const d = new Date(e.timestamp);
    const key = hourKeyLocal(d);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
  });

  const labels = [], values = [];
  for (const [key, val] of buckets) {
    const [datePart, hourPart] = key.split('T');
    const [y,mo,da] = datePart.split('-');
    labels.push(`${da}/${mo} ${hourPart}:00`);
    values.push(val);
  }
  return { labels, values };
}
