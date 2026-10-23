export function fmtDate(ts: number | null | undefined): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) +
    ', ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
}

export function fmtDurMin(mins: number | null | undefined): string {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return h + 'h ' + String(rm).padStart(2, '0') + 'm';
  const d = Math.floor(h / 24);
  return d + 'd ' + (h % 24) + 'h';
}

export function fmtMWh(n: number | null | undefined): string {
  if (n === null || n === undefined || !isFinite(n)) return '—';
  return n >= 100 ? String(Math.round(n)) : n.toFixed(1);
}

export function toLocalInput(ts: number): string {
  const d = new Date(ts);
  const p = (num: number) => String(num).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' +
    p(d.getMonth() + 1) +
    '-' +
    p(d.getDate()) +
    'T' +
    p(d.getHours()) +
    ':' +
    p(d.getMinutes())
  );
}
