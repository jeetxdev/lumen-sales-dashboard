import { areaPath, linePath } from '../domain/charts';

export type BarTone = 'accent' | 'a300' | 'a400' | 'a500' | 'a600' | 'n600';
export type BarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface MeterProps {
  /** Filled share, 0–100. */
  value: number;
  tone?: BarTone;
  size?: BarSize;
  label: string;
  className?: string;
}

/** Horizontal bar. SVG percentages keep the fill width out of inline styles. */
export function Meter({ value, tone = 'accent', size = 'sm', label, className = '' }: MeterProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <svg className={`meter meter--${size} ${className}`} role="meter" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <rect className="meter__track" width="100%" height="100%" rx="3" />
      {pct > 0 && <rect className={`meter__fill tone--${tone}`} width={`${pct}%`} height="100%" rx="3" />}
    </svg>
  );
}

interface StackedBarProps {
  segments: { key: string; pct: number; tone: string }[];
  label: string;
}

export function StackedBar({ segments, label }: StackedBarProps) {
  const starts = segments.map((_, i) => segments.slice(0, i).reduce((a, s) => a + s.pct, 0));
  return (
    <svg className="stacked" role="img" aria-label={label}>
      {segments.map((s, i) => (
        <rect key={s.key} className={`stacked__seg ${s.tone}`} x={`${starts[i]}%`} width={`${s.pct}%`} height="100%" />
      ))}
      {/* Separators between segments, painted in the card colour. */}
      {starts.slice(1).map((x, i) => (
        <line key={segments[i + 1].key} className="stacked__gap" x1={`${x}%`} x2={`${x}%`} y1="0" y2="100%" />
      ))}
    </svg>
  );
}

interface ColumnChartProps {
  values: number[];
  labels: string[];
  tips: string[];
  size?: 'md' | 'lg';
  label: string;
}

const COLUMN_GAP_PCT = 1.6;

/** Monthly columns. The last one is the current month and is highlighted. */
export function ColumnChart({ values, labels, tips, size = 'lg', label }: ColumnChartProps) {
  const max = Math.max(...values, 1);
  const slot = 100 / values.length;
  const width = slot - COLUMN_GAP_PCT;
  return (
    <div className={`columns columns--${size}`}>
      <svg className="columns__plot" role="img" aria-label={label}>
        {values.map((v, i) => {
          const h = (v / max) * 100;
          return (
            <rect key={labels[i] + i} className={i === values.length - 1 ? 'columns__bar columns__bar--now' : 'columns__bar'} x={`${i * slot + COLUMN_GAP_PCT / 2}%`} width={`${width}%`} y={`${100 - h}%`} height={`${h}%`} rx="4">
              <title>{tips[i]}</title>
            </rect>
          );
        })}
      </svg>
      <MonthAxis labels={labels} />
    </div>
  );
}

export function MonthAxis({ labels }: { labels: string[] }) {
  return (
    <div className="axis">
      {labels.map((l, i) => (
        <span key={l + i}>{l}</span>
      ))}
    </div>
  );
}

const LINE_W = 600;
const LINE_H = 200;

interface LineChartProps {
  current: number[];
  previous: number[];
  labels: string[];
  size?: 'md' | 'lg';
  legend?: boolean;
}

export function LineChart({ current, previous, labels, size = 'md', legend = false }: LineChartProps) {
  const max = Math.max(...current, ...previous);
  return (
    <div className="line-chart">
      <svg className={`line-chart__plot line-chart__plot--${size}`} viewBox={`0 0 ${LINE_W} ${LINE_H}`} preserveAspectRatio="none" role="img" aria-label="Revenue this year compared with last year">
        <path className="line-chart__area" d={areaPath(current, LINE_W, LINE_H, 0, max)} />
        <path className="line-chart__ly" d={linePath(previous, LINE_W, LINE_H, 0, max)} vectorEffect="non-scaling-stroke" />
        <path className="line-chart__line" d={linePath(current, LINE_W, LINE_H, 0, max)} vectorEffect="non-scaling-stroke" />
      </svg>
      <MonthAxis labels={labels} />
      {legend && (
        <div className="legend">
          <span className="legend__item">
            <span className="legend__swatch legend__swatch--line" />
            This year
          </span>
          <span className="legend__item">
            <span className="legend__swatch legend__swatch--dashed" />
            Last year
          </span>
        </div>
      )}
    </div>
  );
}

const SPARK_W = 100;
const SPARK_H = 28;

export function Sparkline({ values, lo, hi }: { values: number[]; lo: number; hi: number }) {
  return (
    <svg className="spark" viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={linePath(values, SPARK_W, SPARK_H, lo, hi)} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
