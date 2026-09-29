import { useState } from 'react';
import { ArrowsLeftRight, Minus, Plus, Truck } from '@phosphor-icons/react';
import { useCreateRestock, useNextPoNumber, useWarehouses } from '../api/hooks';
import { TODAY } from '../api/seed';
import type { Product } from '../api/types';
import { Seg } from '../components/controls';
import { Dialog, Warning } from '../components/Dialog';
import { money } from '../domain/format';
import { defaultRestockWarehouses, etaLabel, restockTransitDays, suggestPurchase, suggestTransfer, totalStock } from '../domain/inventory';

type Mode = 'po' | 'transfer';

export function RestockDialog({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const warehouses = useWarehouses();
  const nextPo = useNextPoNumber();
  const create = useCreateRestock();
  const [plan, setPlan] = useState(() => ({ mode: 'po' as Mode, ...defaultRestockWarehouses(p.stock), qty: suggestPurchase(p) }));
  const update = (patch: Partial<typeof plan>) => setPlan((x) => ({ ...x, ...patch }));

  const isPO = plan.mode === 'po';
  const destCode = warehouses[plan.dest].code;
  const fromCode = warehouses[plan.from].code;
  const available = p.stock[plan.from];
  const total = totalStock(p);
  const eta = etaLabel(TODAY, restockTransitDays(plan.mode, p.supplier.leadDays));
  const split = warehouses.map((w, i) => `${w.code} ${p.stock[i]}`).join(' · ');

  let warn = '';
  if (!isPO && plan.from === plan.dest) warn = 'Pick two different warehouses.';
  else if (!isPO && plan.qty > available) warn = `Only ${available} units at ${fromCode}.`;
  else if (isPO && plan.qty < p.moq) warn = `Below the supplier minimum of ${p.moq}.`;
  const invalid = plan.qty <= 0 || (!isPO && (plan.from === plan.dest || plan.qty > available));

  const summary: [string, string][] = isPO
    ? [
        ['Unit cost', money(p.cost, 2)],
        ['PO total', money(plan.qty * p.cost, 2)],
        [`Expected at ${destCode}`, eta],
        ['Total on hand after', `${total + plan.qty} units`],
      ]
    : [
        [`${fromCode} after transfer`, `${available - plan.qty} units`],
        [`${destCode} after transfer`, `${p.stock[plan.dest] + plan.qty} units`],
        ['Expected', eta],
        ['Total on hand', `Unchanged · ${total}`],
      ];

  const whOptions = warehouses.map((w, i) => ({ value: String(i), label: w.code, meta: p.stock[i] }));

  const confirm = () => {
    if (invalid) return;
    create.mutate({ sku: p.sku, ...plan }, { onSuccess: onClose });
  };

  return (
    <Dialog
      kicker="Restock"
      title={p.name}
      subtitle={`${p.sku} · ${split} · reorder point ${p.reorderPoint}`}
      size="sm"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={confirm} disabled={invalid || create.isPending}>
            {isPO ? `Create ${nextPo}` : 'Create transfer'}
          </button>
        </>
      }
    >
      <Seg
        className="seg--fixed align-start"
        label="Restock method"
        value={plan.mode}
        onChange={(mode) => update({ mode, qty: mode === 'po' ? suggestPurchase(p) : suggestTransfer(p, plan.from) })}
        options={[
          { value: 'po', label: 'Purchase order', icon: <Truck /> },
          { value: 'transfer', label: 'Transfer', icon: <ArrowsLeftRight /> },
        ]}
      />
      {isPO ? (
        <div className="grid-supplier">
          <div className="field">
            <label>Supplier</label>
            <div className="input input--static">{p.supplier.name}</div>
          </div>
          <div className="field">
            <label>Lead time</label>
            <div className="input input--static">{p.supplier.leadDays} days</div>
          </div>
        </div>
      ) : (
        <div className="field">
          <label>Transfer from</label>
          <Seg label="Transfer from" value={String(plan.from)} onChange={(v) => update({ from: Number(v), qty: suggestTransfer(p, Number(v)) })} options={whOptions} />
        </div>
      )}
      <div className="field">
        <label>Deliver to</label>
        <Seg label="Deliver to" value={String(plan.dest)} onChange={(v) => update({ dest: Number(v) })} options={whOptions} />
      </div>
      <div className="field">
        <label>Quantity · cases of {p.casePack}</label>
        <div className="stepper">
          <button type="button" className="btn btn-secondary btn-icon" aria-label="One case fewer" onClick={() => update({ qty: Math.max(0, plan.qty - p.casePack) })}>
            <Minus />
          </button>
          <div className="stepper__value num" aria-live="polite">
            {plan.qty}
          </div>
          <button type="button" className="btn btn-secondary btn-icon" aria-label="One case more" onClick={() => update({ qty: plan.qty + p.casePack })}>
            <Plus />
          </button>
          <span className="muted-sm">{isPO ? `Suggested ${suggestPurchase(p)} · MOQ ${p.moq}` : `${available} available at ${fromCode}`}</span>
        </div>
      </div>
      <div className="summary-box">
        {summary.map(([k, v]) => (
          <div key={k} className="summary-box__row">
            <span className="grow muted">{k}</span>
            <span className="num">{v}</span>
          </div>
        ))}
      </div>
      {warn && <Warning>{warn}</Warning>}
      {create.error && <Warning>{create.error.message}</Warning>}
    </Dialog>
  );
}
