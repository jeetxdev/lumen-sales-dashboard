import { useId, useState } from 'react';
import { useSettings, useUpdatePrices } from '../api/hooks';
import type { PriceChangeWhen, Product } from '../api/types';
import { Seg } from '../components/controls';
import { Dialog, Warning } from '../components/Dialog';
import { marginPct } from '../domain/finance';
import { money } from '../domain/format';

const WHEN_OPTIONS: PriceChangeWhen[] = ['Immediately', 'Oct 1', 'Nov 1'];
// Prices closer than half a cent count as unchanged.
const PRICE_EPSILON = 0.005;

function MoneyField({ label, value, onChange, emphasis = false }: { label: string; value: string; onChange: (v: string) => void; emphasis?: boolean }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="affix">
        <span className="affix__pre">$</span>
        <input id={id} className={`input input--pre ${emphasis ? 'input--emphasis' : ''}`} type="number" step="0.01" min="0" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export function PriceEditDialog({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const settings = useSettings();
  const update = useUpdatePrices();
  const start = p.scheduled ?? { cost: p.cost, ws: p.ws, msrp: p.msrp, when: 'Immediately' as PriceChangeWhen };
  const [draft, setDraft] = useState({ cost: String(start.cost), ws: String(start.ws), msrp: String(start.msrp), when: start.when as PriceChangeWhen });
  const set = (k: 'cost' | 'ws' | 'msrp') => (v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const cost = parseFloat(draft.cost) || 0;
  const ws = parseFloat(draft.ws) || 0;
  const msrp = parseFloat(draft.msrp) || 0;
  const invalid = ws <= 0 || ws <= cost;

  const change = Math.abs(ws - p.ws) < PRICE_EPSILON ? 'Same as current wholesale price' : `${ws > p.ws ? '+' : '−'}${Math.abs((ws / p.ws - 1) * 100).toFixed(1)}% vs current ${money(p.ws, 2)}`;
  const warn = ws <= cost ? 'Wholesale price must be above cost.' : msrp && msrp < ws ? 'MSRP is below the wholesale price.' : '';

  const tiers: [string, number][] = [
    ['Standard', 0],
    ['Silver', settings.tierDiscounts.Silver],
    ['Gold', settings.tierDiscounts.Gold],
  ];

  const confirm = () => {
    if (invalid) return;
    update.mutate({ sku: p.sku, cost, ws, msrp, when: draft.when }, { onSuccess: onClose });
  };

  return (
    <Dialog
      kicker="Edit pricing"
      title={p.name}
      subtitle={`${p.sku} · ${change}`}
      size="md"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={confirm} disabled={invalid || update.isPending}>
            {draft.when === 'Immediately' ? 'Save prices' : `Schedule for ${draft.when}`}
          </button>
        </>
      }
    >
      <div className="grid-3">
        <MoneyField label="Unit cost" value={draft.cost} onChange={set('cost')} />
        <MoneyField label="Wholesale price" value={draft.ws} onChange={set('ws')} emphasis />
        <MoneyField label="MSRP" value={draft.msrp} onChange={set('msrp')} />
      </div>
      <div className="grid-2">
        <div className="tile tile--dialog">
          <span className="muted-xs-11">Your margin</span>
          <span className="text-18">{ws ? `${marginPct(cost, ws)}%` : '—'}</span>
        </div>
        <div className="tile tile--dialog">
          <span className="muted-xs-11">Retailer margin at MSRP</span>
          <span className="text-18">{msrp ? `${marginPct(ws, msrp)}%` : '—'}</span>
        </div>
      </div>
      <div className="stack-4">
        <span className="muted-sm">Tier prices</span>
        {tiers.map(([tier, d]) => (
          <div key={tier} className="tier-row tier-row--dialog">
            <span className="tier-row__name tier-row__name--wide">{tier}</span>
            <span className="tier-row__disc">{d ? `−${d}%` : 'List'}</span>
            <span className="num">{money(ws * (1 - d / 100), 2)}</span>
          </div>
        ))}
      </div>
      <div className="field">
        <label>Takes effect</label>
        <Seg label="Takes effect" value={draft.when} onChange={(when) => setDraft((d) => ({ ...d, when }))} options={WHEN_OPTIONS.map((w) => ({ value: w, label: w }))} />
      </div>
      <div className="muted-xs-12">Open orders keep the price they were placed at. Tier discounts are set in Settings.</div>
      {warn && <Warning>{warn}</Warning>}
      {update.error && <Warning>{update.error.message}</Warning>}
    </Dialog>
  );
}
