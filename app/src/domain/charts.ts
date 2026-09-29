const CHART_TOP_PAD = 8;
const CHART_BOTTOM_PAD = 2;

/** SVG path through evenly spaced values, scaled from [lo, hi] into a w × h box. */
export function linePath(values: number[], w: number, h: number, lo: number, hi: number): string {
  const span = hi - lo || 1;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const pts = values.map((v, i) => [i * step, h - ((v - lo) / span) * (h - CHART_TOP_PAD) - CHART_BOTTOM_PAD]);
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');
}

export function areaPath(values: number[], w: number, h: number, lo: number, hi: number): string {
  return `${linePath(values, w, h, lo, hi)} L${w} ${h} L0 ${h} Z`;
}
