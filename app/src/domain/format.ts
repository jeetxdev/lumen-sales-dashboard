const THOUSAND = 1e3;
const MILLION = 1e6;

export function money(n: number, decimals = 0): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function compactMoney(n: number): string {
  if (n >= MILLION) return '$' + (n / MILLION).toFixed(2) + 'M';
  if (n >= THOUSAND) return '$' + (n / THOUSAND).toFixed(1) + 'k';
  return money(n);
}

/** Share of a in b as a whole percentage, clamped to 0–100. */
export function clampedPct(a: number, b: number): number {
  if (b <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((a / b) * 100)));
}

export function num(n: number): string {
  return n.toLocaleString('en-US');
}

export function plural(n: number, one: string, many = one + 's'): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Matches a free-text query against any of the given fields, case-insensitively. */
export function matchesQuery(query: string, ...fields: (string | number)[]): boolean {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => String(f).toLowerCase().includes(q));
}

export function sumBy<T>(items: readonly T[], pick: (item: T) => number): number {
  return items.reduce((a, item) => a + pick(item), 0);
}
