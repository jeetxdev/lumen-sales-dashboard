import { useId, type ReactNode } from 'react';
import { ChartBar, Table } from '@phosphor-icons/react';

export interface SegOption<T extends string> {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  title?: string;
}

interface SegProps<T extends string> {
  options: SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  compact?: boolean;
  scroll?: boolean;
  className?: string;
}

/** Nocturne segmented control on native radio inputs. */
export function Seg<T extends string>({ options, value, onChange, label, compact = false, scroll = false, className = '' }: SegProps<T>) {
  const name = useId();
  return (
    <div className={`seg ${scroll ? 'seg--scroll' : ''} ${className}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value} className={`seg-opt ${compact ? 'seg-opt--compact' : ''}`} title={o.title}>
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} aria-label={o.title} />
          {o.icon}
          {o.label}
          {o.meta !== undefined && <span className="seg-opt__meta">{o.meta}</span>}
        </label>
      ))}
    </div>
  );
}

export type ViewMode = 'chart' | 'table';

export function ViewToggle({ value, onChange, label }: { value: ViewMode; onChange: (v: ViewMode) => void; label: string }) {
  return (
    <Seg
      compact
      className="seg--fixed"
      label={label}
      value={value}
      onChange={onChange}
      options={[
        { value: 'chart', icon: <ChartBar />, title: 'Chart' },
        { value: 'table', icon: <Table />, title: 'Table' },
      ]}
    />
  );
}

export function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`switch ${on ? 'switch--on' : ''}`} onClick={onToggle}>
      <span className="switch__knob" />
    </button>
  );
}

export function SwitchRow({ label, sub, on, onToggle }: { label: string; sub: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="switch-row">
      <div className="switch-row__text">
        <span className="switch-row__label">{label}</span>
        <span className="muted-sm">{sub}</span>
      </div>
      <Switch on={on} onToggle={onToggle} label={label} />
    </div>
  );
}

const SWATCH_SIZE = 36;
const SWATCH_RING_R = 17;
const SWATCH_DOT_R = 14;

/** A colour circle. The hex goes into SVG attributes, so no inline style is needed. */
export function SwatchDot({ hex, selected }: { hex: string; selected: boolean }) {
  const c = SWATCH_SIZE / 2;
  return (
    <svg className="swatch__svg" width={SWATCH_SIZE} height={SWATCH_SIZE} viewBox={`0 0 ${SWATCH_SIZE} ${SWATCH_SIZE}`} aria-hidden="true">
      {selected && <circle cx={c} cy={c} r={SWATCH_RING_R} fill="none" stroke={hex} strokeWidth="2" />}
      <circle cx={c} cy={c} r={SWATCH_DOT_R} fill={hex} />
    </svg>
  );
}
