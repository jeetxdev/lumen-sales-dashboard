import { useId, useState } from 'react';
import { useCategories, useCreatePromotion, useProducts, useSettings } from '../api/hooks';
import type { Category, PromoAudience, PromoEnd } from '../api/types';
import { Seg, Switch } from '../components/controls';
import { Dialog, Warning } from '../components/Dialog';
import { money, plural } from '../domain/format';

type Scope = 'Category' | 'Specific products';
const AUDIENCES: PromoAudience[] = ['All accounts', 'Silver & Gold', 'Gold only'];
const ENDS: PromoEnd[] = ['Oct 31', 'Nov 30', 'No end date'];
const DEFAULT_PCT = '10';
const MAX_PCT = 90;

export function PromotionDialog({ initialSku, onClose }: { initialSku?: string; onClose: () => void }) {
  const products = useProducts();
  const categories = useCategories();
  const settings = useSettings();
  const create = useCreatePromotion();
  const nameId = useId();
  const pctId = useId();
  const [draft, setDraft] = useState({
    name: '',
    pct: DEFAULT_PCT,
    scope: (initialSku ? 'Specific products' : 'Category') as Scope,
    cat: categories[0] as Category,
    skus: new Set(initialSku ? [initialSku] : []),
    audience: 'All accounts' as PromoAudience,
    end: 'Oct 31' as PromoEnd,
    stack: true,
  });
  const update = (patch: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...patch }));
  const toggleSku = (sku: string) =>
    setDraft((d) => {
      const skus = new Set(d.skus);
      if (skus.has(sku)) skus.delete(sku);
      else skus.add(sku);
      return { ...d, skus };
    });

  const skus = draft.scope === 'Category' ? products.filter((p) => p.category === draft.cat).map((p) => p.sku) : products.filter((p) => draft.skus.has(p.sku)).map((p) => p.sku);
  const pct = Math.max(0, Math.min(MAX_PCT, parseFloat(draft.pct) || 0));
  const invalid = !skus.length || pct <= 0 || !draft.name.trim();
  const example = products.find((p) => p.sku === skus[0]);
  const sale = example ? example.ws * (1 - pct / 100) : 0;
  const goldPct = settings.tierDiscounts.Gold;

  const confirm = () => {
    if (invalid) return;
    create.mutate(
      { name: draft.name, pct, skus, scopeLabel: draft.scope === 'Category' ? draft.cat : plural(skus.length, 'product'), audience: draft.audience, end: draft.end, stack: draft.stack },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog
      kicker="New promotion"
      title="Discount on selected products"
      size="lg"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={confirm} disabled={invalid || create.isPending}>
            Create promotion
          </button>
        </>
      }
    >
      <div className="grid-promo">
        <div className="field">
          <label htmlFor={nameId}>Name</label>
          <input id={nameId} className="input" placeholder="e.g. Holiday kitchen sale" value={draft.name} onChange={(e) => update({ name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor={pctId}>Discount</label>
          <div className="affix">
            <input id={pctId} className="input input--post" type="number" min="1" max={MAX_PCT} value={draft.pct} onChange={(e) => update({ pct: e.target.value })} />
            <span className="affix__post">%</span>
          </div>
        </div>
      </div>
      <div className="field">
        <label>Applies to</label>
        <Seg label="Applies to" value={draft.scope} onChange={(scope) => update({ scope })} options={(['Category', 'Specific products'] as Scope[]).map((s) => ({ value: s, label: s }))} />
      </div>
      {draft.scope === 'Category' ? (
        <Seg className="align-start" label="Category" value={draft.cat} onChange={(cat) => update({ cat })} options={categories.map((c) => ({ value: c, label: c }))} />
      ) : (
        <div className="pick-list">
          {products.map((p) => (
            <label key={p.sku} className="pick-list__item">
              <input type="checkbox" className="checkbox" checked={draft.skus.has(p.sku)} onChange={() => toggleSku(p.sku)} />
              <span className="grow">{p.name}</span>
              <span className="muted-xs-12">{money(p.ws, 2)}</span>
            </label>
          ))}
        </div>
      )}
      <div className="muted-sm">{plural(skus.length, 'product')} selected</div>
      <div className="field">
        <label>Eligible accounts</label>
        <Seg label="Eligible accounts" value={draft.audience} onChange={(audience) => update({ audience })} options={AUDIENCES.map((a) => ({ value: a, label: a }))} />
      </div>
      <div className="field">
        <label>Ends</label>
        <Seg label="Ends" value={draft.end} onChange={(end) => update({ end })} options={ENDS.map((e) => ({ value: e, label: e }))} />
      </div>
      <div className="switch-row">
        <div className="switch-row__text">
          <span className="switch-row__label">Stack with tier discount</span>
          <span className="muted-xs-12">Off: accounts get whichever discount is larger</span>
        </div>
        <Switch on={draft.stack} onToggle={() => update({ stack: !draft.stack })} label="Stack with tier discount" />
      </div>
      <div className="summary-box">
        {example
          ? `${example.name}: ${money(example.ws, 2)} → ${money(sale, 2)}` + (draft.stack ? ` · Gold account pays ${money(sale * (1 - goldPct / 100), 2)}` : ' for every eligible account')
          : 'Select at least one product.'}
      </div>
      {create.error && <Warning>{create.error.message}</Warning>}
    </Dialog>
  );
}
