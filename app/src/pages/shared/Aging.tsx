import type { Invoice } from '../../api/types';
import { StackedBar } from '../../components/charts';
import { agingBuckets, invoiceStatus, type AgingBucket } from '../../domain/finance';
import { compactMoney, sumBy } from '../../domain/format';

// From current (quiet) to 90+ days (loudest).
const AGING_TONES = ['n700', 'a800', 'a700', 'a500', 'a300'];

export interface Aging {
  buckets: (AgingBucket & { tone: string; pct: number })[];
  total: number;
  overdue: number;
}

export function useAging(invoices: Invoice[]): Aging {
  const raw = agingBuckets(invoices);
  const total = sumBy(raw, (b) => b.amount);
  const overdue = sumBy(
    invoices.filter((i) => invoiceStatus(i) === 'Overdue'),
    (i) => i.amount,
  );
  return {
    buckets: raw.map((b, i) => ({ ...b, tone: AGING_TONES[i], pct: total ? (b.amount / total) * 100 : 0 })),
    total,
    overdue,
  };
}

export function AgingStrip({ aging }: { aging: Aging }) {
  return <StackedBar label="Receivables by age" segments={aging.buckets.map((b) => ({ key: b.label, pct: b.pct, tone: `fill--${b.tone}` }))} />;
}

export function AgingList({ aging }: { aging: Aging }) {
  return (
    <div className="stack">
      {aging.buckets.map((b) => (
        <div key={b.label} className="aging-row">
          <span className={`dot bg--${b.tone}`} />
          <span className="grow">{b.label}</span>
          <span className="muted-sm">{b.count} inv</span>
          <span className="aging-row__amount num">{compactMoney(b.amount)}</span>
        </div>
      ))}
    </div>
  );
}

export function AgingTiles({ aging }: { aging: Aging }) {
  return (
    <div className="grid-aging">
      {aging.buckets.map((b) => (
        <div key={b.label} className="tile">
          <span className="tile__label">
            <span className={`dot bg--${b.tone}`} />
            {b.label}
          </span>
          <span className="tile__value num">{compactMoney(b.amount)}</span>
          <span className="muted-xs">{b.count} invoices</span>
        </div>
      ))}
    </div>
  );
}
