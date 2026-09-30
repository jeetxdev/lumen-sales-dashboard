import { useState, type MouseEvent } from 'react';
import { ArrowsLeftRight, Package } from '@phosphor-icons/react';
import { useIncoming, useProducts, useReceiveIncoming, useWarehouses } from '../api/hooks';
import type { Product, WarehouseCode } from '../api/types';
import { ActionButton } from '../components/ActionButton';
import { Meter, type BarTone } from '../components/charts';
import { ClickCard, ClickRow } from '../components/ClickRow';
import { Seg } from '../components/controls';
import { NOT_BUILT, stockTag } from '../components/tags';
import { RestockDialog } from '../dialogs/RestockDialog';
import { clampedPct, compactMoney, matchesQuery, num, sumBy } from '../domain/format';
import { stockStatus, totalStock, type StockStatus } from '../domain/inventory';
import { useIsMobile } from '../hooks/useIsMobile';
import { PageHeader } from '../layout/PageHeader';
import { paths, useOpen } from '../routes';

type InvFilter = 'All' | Exclude<StockStatus, 'Healthy'>;
const FILTERS: InvFilter[] = ['All', 'Low', 'Reorder'];
// A warehouse counts a SKU as low when it holds under a third of the SKU's reorder point.
const WAREHOUSE_LOW_SHARE = 3;
const LOW_RATIO = 0.5;

function barTone(p: Product): BarTone {
  const r = totalStock(p) / p.reorderPoint;
  if (r < LOW_RATIO) return 'a300';
  return r < 1 ? 'a500' : 'n600';
}

export function Inventory() {
  const mobile = useIsMobile();
  const products = useProducts();
  const warehouses = useWarehouses();
  const incoming = useIncoming();
  const receive = useReceiveIncoming();
  const open = useOpen();
  const [filter, setFilter] = useState<InvFilter>('All');
  const [highlight, setHighlight] = useState<WarehouseCode | null>(null);
  const [query, setQuery] = useState('');
  const [restocking, setRestocking] = useState<Product | null>(null);

  const inventoryValue = sumBy(products, (p) => totalStock(p) * p.cost);
  const countFor = (f: InvFilter) => (f === 'All' ? products.length : products.filter((p) => stockStatus(p) === f).length);
  const incomingFor = (sku: string) => incoming.find((i) => i.sku === sku);

  const rows = products
    .filter((p) => (filter === 'All' || stockStatus(p) === filter) && matchesQuery(query, p.name, p.sku))
    .map((p) => {
      const inc = incomingFor(p.sku);
      const status = stockStatus(p);
      return { p, inc, label: inc ? ('On order' as const) : status, canRestock: !inc && status !== 'Healthy' };
    });

  const cellTone = (v: number, code: WarehouseCode) => {
    if (v === 0) return 'text-a300';
    if (highlight === code) return 'text-strong';
    return highlight === null ? 'text-n300' : 'text-n600';
  };

  const restockButton = (p: Product) => (
    <button
      type="button"
      className="btn btn-primary btn--row"
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        setRestocking(p);
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      Restock
    </button>
  );

  const split = (p: Product) => warehouses.map((w, i) => `${w.code} ${p.stock[i]}`).join(' · ');

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${warehouses.length} warehouses · ${compactMoney(inventoryValue)} at cost`}
        search={{ value: query, onChange: setQuery, placeholder: 'Search inventory…' }}
        action={mobile ? null : { label: 'Transfer stock', icon: <ArrowsLeftRight />, onClick: NOT_BUILT }}
      />

      <section className="grid-wh">
        {warehouses.map((w, wi) => {
          const units = sumBy(products, (p) => p.stock[wi]);
          const value = sumBy(products, (p) => p.stock[wi] * p.cost);
          const low = products.filter((p) => p.stock[wi] < p.reorderPoint / WAREHOUSE_LOW_SHARE).length;
          const on = highlight === w.code;
          const cap = clampedPct(units, w.capacity);
          return (
            <button key={w.code} type="button" className={`card card--pad card--gap-sm wh-card ${on ? 'wh-card--on' : ''}`} aria-pressed={on} onClick={() => setHighlight(on ? null : w.code)}>
              <div className="row-center gap-sm">
                <span className="tag tag-neutral">{w.code}</span>
                <span className="text-14 grow">{w.name}</span>
                <span className="muted-xs-12">{w.city}</span>
              </div>
              <div className="row-baseline gap-md">
                <span className="stat-lg">{num(units)}</span>
                <span className="muted-sm">units · {compactMoney(value)}</span>
              </div>
              <Meter value={cap} size="md" label={`${w.name} capacity used`} />
              <div className="muted-sm">
                {cap}% capacity · {low} SKUs low
              </div>
            </button>
          );
        })}
      </section>

      <section className="toolbar">
        <Seg label="Stock status" value={filter} onChange={setFilter} options={FILTERS.map((f) => ({ value: f, label: f === 'All' ? 'All SKUs' : f, meta: countFor(f) }))} />
        <span className="toolbar__note">{highlight ? `Highlighting ${highlight} · click card again to clear` : 'All warehouses'}</span>
      </section>

      {incoming.length > 0 && (
        <section className="card elev-sm card--pad card--gap-xs">
          <div className="card-head">
            <div className="card-title card-head__title">Inbound</div>
            <span className="muted-sm">
              {incoming.length} open · {num(sumBy(incoming, (i) => i.qty))} units
            </span>
          </div>
          {incoming.map((b) => (
            <div key={b.ref} className="inbound">
              <span className={`tag ${b.type === 'PO' ? 'tag-accent' : 'tag-neutral'} inbound__type`}>{b.type}</span>
              <div className="inbound__main">
                <span className="text-14">{products.find((p) => p.sku === b.sku)?.name}</span>
                <span className="muted-xs-12">
                  {b.ref} · {b.source}
                </span>
              </div>
              <span className="text-13 num">
                +{b.qty} → {b.warehouse}
              </span>
              <span className="inbound__eta">ETA {b.eta}</span>
              <ActionButton className="btn btn-ghost btn--xs" onClick={() => receive.mutate(b.sku)} pending={receive.isPending && receive.variables === b.sku} pendingLabel="Receiving…">
                <Package />
                Receive
              </ActionButton>
            </div>
          ))}
        </section>
      )}

      {mobile ? (
        <section className="card-list">
          {rows.map(({ p, inc, label, canRestock }) => (
            <ClickCard key={p.sku} className="m-card" label={`Open ${p.name}`} onOpen={() => open(paths.product(p.sku))}>
              <div className="row-center gap-sm">
                <div className="cell-stack grow">
                  <span>{p.name}</span>
                  <span className="muted-xs-12">{p.sku}</span>
                </div>
                <span className={`tag ${stockTag(label)}`}>{label}</span>
              </div>
              <Meter value={clampedPct(totalStock(p), p.reorderPoint)} tone={barTone(p)} label={`${p.name} stock against reorder point`} />
              <div className="row-center gap-md muted-sm">
                <span className="cell-stack grow">
                  <span>{split(p)}</span>
                  {inc && (
                    <span className="text-a300">
                      Incoming +{inc.qty} to {inc.warehouse}, ETA {inc.eta}
                    </span>
                  )}
                </span>
                {canRestock && restockButton(p)}
              </div>
            </ClickCard>
          ))}
        </section>
      ) : (
        <section className="card elev-sm card--table">
          <div className="scroll-x">
            <table className="table min-760">
              <thead>
                <tr>
                  <th>Product</th>
                  {warehouses.map((w) => (
                    <th key={w.code} className={`r ${highlight === w.code ? 'text-accent' : ''}`}>
                      {w.code}
                    </th>
                  ))}
                  <th className="r">Allocated</th>
                  <th className="w-18">On hand / reorder pt</th>
                  <th>Incoming</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ p, inc, label, canRestock }) => (
                  <ClickRow key={p.sku} label={`Open ${p.name}`} onOpen={() => open(paths.product(p.sku))}>
                    <td>
                      <div className="cell-stack">
                        <span>{p.name}</span>
                        <span className="muted-xs-12">{p.sku}</span>
                      </div>
                    </td>
                    {p.stock.map((v, i) => (
                      <td key={warehouses[i].code} className={`r num ${cellTone(v, warehouses[i].code)}`}>
                        {v}
                      </td>
                    ))}
                    <td className="r muted">{p.allocated}</td>
                    <td>
                      <div className="row-center gap-md">
                        <Meter value={clampedPct(totalStock(p), p.reorderPoint)} tone={barTone(p)} className="grow" label={`${p.name} stock against reorder point`} />
                        <span className="text-12 num nowrap">
                          {totalStock(p)} / {p.reorderPoint}
                        </span>
                      </div>
                    </td>
                    <td className={`text-12 nowrap ${inc ? 'text-a300' : 'text-n600'}`}>{inc ? `+${inc.qty} ${inc.warehouse} · ${inc.eta}` : '—'}</td>
                    <td>
                      <span className={`tag ${stockTag(label)}`}>{label}</span>
                    </td>
                    <td className="r">{canRestock && restockButton(p)}</td>
                  </ClickRow>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {restocking && <RestockDialog product={restocking} onClose={() => setRestocking(null)} />}
    </>
  );
}
