import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarBlank, Percent, PencilSimple, Tag, Truck } from '@phosphor-icons/react';
import { useCustomers, useIncoming, useOrders, useProducts, usePromotions, useSalesSeries, useSettings, useWarehouses } from '../api/hooks';
import { ColumnChart, Meter } from '../components/charts';
import { ViewToggle, type ViewMode } from '../components/controls';
import { ClickRow } from '../components/ClickRow';
import { ORDER_TAG, stockTag } from '../components/tags';
import { PriceEditDialog } from '../dialogs/PriceEditDialog';
import { PromotionDialog } from '../dialogs/PromotionDialog';
import { RestockDialog } from '../dialogs/RestockDialog';
import { activePromotionFor, marginPct } from '../domain/finance';
import { clampedPct, money, num, sumBy } from '../domain/format';
import { stockStatus, totalStock, warehouseReorderPoint } from '../domain/inventory';
import { useIsMobile } from '../hooks/useIsMobile';
import { PageHeader } from '../layout/PageHeader';
import { paths, useOpen } from '../routes';
import { NotFound } from './NotFound';

const RECENT_ORDERS = 6;
const TOP_BUYERS = 4;
const HISTORY_ROWS = 4;
// Each warehouse bar is full at twice that warehouse's share of the reorder point.
const WAREHOUSE_BAR_SCALE = 2;

type DialogKind = 'restock' | 'price' | 'promo' | null;

export function ProductDetail() {
  const { sku } = useParams();
  const mobile = useIsMobile();
  const products = useProducts();
  const warehouses = useWarehouses();
  const incoming = useIncoming();
  const orders = useOrders();
  const customers = useCustomers();
  const promotions = usePromotions();
  const settings = useSettings();
  const sales = useSalesSeries();
  const open = useOpen();
  const [soldView, setSoldView] = useState<ViewMode>('chart');
  const [dialog, setDialog] = useState<DialogKind>(null);

  const p = products.find((x) => x.sku === sku);
  if (!p) return <NotFound what="Product" />;

  const total = totalStock(p);
  const inc = incoming.find((i) => i.sku === p.sku);
  const whPar = warehouseReorderPoint(p);
  const status = stockStatus(p);
  const promo = activePromotionFor(p, promotions);
  const withProduct = orders.filter((o) => o.lines.some((l) => l.sku === p.sku));
  const qtyIn = (lines: { sku: string; qty: number }[]) => sumBy(lines.filter((l) => l.sku === p.sku), (l) => l.qty);

  const buyers = new Map<number, number>();
  withProduct.forEach((o) => buyers.set(o.customerId, (buyers.get(o.customerId) ?? 0) + qtyIn(o.lines)));
  const topBuyers = [...buyers.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_BUYERS);

  const tiers: [string, number][] = [
    ['Standard', 0],
    ['Silver', settings.tierDiscounts.Silver],
    ['Gold', settings.tierDiscounts.Gold],
  ];

  const facts = [
    { k: 'Wholesale', v: money(p.ws, 2), sub: `MSRP ${money(p.msrp, 2)}` },
    { k: 'Margin', v: `${marginPct(p.cost, p.ws)}%`, sub: `Cost ${money(p.cost, 2)}` },
    { k: 'On hand', v: num(total), sub: `${p.allocated} allocated to orders` },
    { k: 'Available', v: num(total - p.allocated), sub: `Reorder point ${p.reorderPoint}` },
  ];

  const specs: [string, string][] = [
    ['Supplier', p.supplier.name],
    ['Lead time', `${p.supplier.leadDays} days`],
    ['Case pack', `${p.casePack} units`],
    ['Minimum order', `${p.moq} units`],
    ['Category', p.category],
  ];

  const history = [...p.priceHistory].reverse().slice(0, HISTORY_ROWS);
  const tag = inc ? { label: 'On order', cls: stockTag('On order') } : { label: status === 'Healthy' ? 'In stock' : status, cls: stockTag(status) };
  const action = inc ? { label: 'Edit pricing', icon: <Tag />, onClick: () => setDialog('price') } : { label: 'Restock', icon: <Truck />, onClick: () => setDialog('restock') };
  const labels = mobile ? sales.labels.map((l) => l[0]) : sales.labels;

  return (
    <>
      <PageHeader title={p.name} subtitle={`${p.sku} · ${p.category}`} tag={tag} action={action} />

      <section className="grid-kpi">
        {facts.map((f) => (
          <div key={f.k} className="card elev-sm card--pad card--gap-xs">
            <div className="muted-sm">{f.k}</div>
            <div className="stat-lg">{f.v}</div>
            <div className="muted-xs-12">{f.sub}</div>
          </div>
        ))}
      </section>

      <section className="grid-split">
        <div className="col">
          <div className="card elev-sm card--pad card--gap-md">
            <div className="card-head card-head--baseline">
              <div className="card-title card-head__title">Stock by warehouse</div>
              <span className="muted-sm">
                {total} / {p.reorderPoint} reorder point
              </span>
            </div>
            {warehouses.map((w, i) => {
              const low = p.stock[i] < whPar;
              return (
                <div key={w.code} className="wh-row">
                  <span className="tag tag-neutral wh-row__code">{w.code}</span>
                  <span className="wh-row__name">{w.name}</span>
                  <Meter value={clampedPct(p.stock[i], whPar * WAREHOUSE_BAR_SCALE)} tone={low ? 'a300' : 'accent'} size="md" className="grow" label={`${w.name} stock`} />
                  <span className="wh-row__qty num">{p.stock[i]}</span>
                  <span className="wh-row__note">{low ? `Below ${whPar}` : ''}</span>
                </div>
              );
            })}
            {inc && (
              <div className="note-accent">
                <Truck />
                {inc.ref} · +{inc.qty} to {inc.warehouse} · ETA {inc.eta} ({inc.source})
              </div>
            )}
          </div>

          <div className="card elev-sm card--pad card--gap-md">
            <div className="card-head card-head--baseline">
              <div className="card-title card-head__title">Units sold</div>
              <span className="muted-sm">{num(sumBy(p.unitsSold, (v) => v))} in 12 months</span>
              <ViewToggle label="Units sold view" value={soldView} onChange={setSoldView} />
            </div>
            {soldView === 'chart' ? (
              <ColumnChart size="md" values={p.unitsSold} labels={labels} tips={p.unitsSold.map((v) => num(v))} label="Units sold per month" />
            ) : (
              <div className="grid-sold">
                {p.unitsSold.map((v, i) => (
                  <div key={sales.labels[i]} className="cell-stack">
                    <span className="muted-xs-11">{labels[i]}</span>
                    <span className="text-14 num">{num(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card elev-sm card--pad card--gap-md">
            <div className="card-title">Recent orders</div>
            <div className="scroll-x">
              <table className="table min-440">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Account</th>
                    <th className="r">Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withProduct.slice(0, RECENT_ORDERS).map((o) => (
                    <ClickRow key={o.id} label={`Open order #${o.id}`} onOpen={() => open(paths.order(o.id))}>
                      <td className="muted">#{o.id}</td>
                      <td>{customers[o.customerId].name}</td>
                      <td className="r">{qtyIn(o.lines)}</td>
                      <td>
                        <span className={`tag ${ORDER_TAG[o.status]}`}>{o.status}</span>
                      </td>
                    </ClickRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card elev-sm card--pad card--gap-sm">
            <div className="card-head">
              <div className="card-kicker card-head__title">Wholesale pricing</div>
              <button type="button" className="btn btn-primary btn--sm" onClick={() => setDialog('price')}>
                <PencilSimple />
                Edit prices
              </button>
            </div>
            {tiers.map(([tier, d]) => {
              const price = p.ws * (1 - d / 100);
              return (
                <div key={tier} className="tier-row">
                  <span className="tier-row__name">{tier}</span>
                  <span className="tier-row__disc">{d ? `−${d}%` : 'List'}</span>
                  <span className="num">{money(price, 2)}</span>
                  <span className="tier-row__margin">{marginPct(p.cost, price)}% margin</span>
                </div>
              );
            })}
            {p.scheduled && (
              <div className="note-accent note-accent--sm">
                <CalendarBlank />
                Scheduled: {money(p.scheduled.ws, 2)} wholesale from {p.scheduled.when}
              </div>
            )}
            {promo && (
              <div className="note-accent note-accent--sm note-accent--top">
                <Percent />
                <span>
                  {promo.name} · {promo.pct}% off → {money(p.ws * (1 - promo.pct / 100), 2)}
                  {promo.end ? ` until ${promo.end}` : ''} · {promo.audience}
                </span>
              </div>
            )}
            <button type="button" className="btn btn-ghost btn--xs align-start" onClick={() => setDialog('promo')}>
              <Percent />
              Add promotion
            </button>
            <div className="overline">Price history</div>
            {history.map((h, i) => (
              <div key={h.date + i} className="history">
                <span>
                  {money(h.from, 2)} → {money(h.to, 2)}
                </span>
                <span className="muted-n500">
                  {h.date} · {h.by}
                </span>
              </div>
            ))}
          </div>

          <div className="card elev-sm card--pad card--gap-sm">
            <div className="card-kicker">Sourcing</div>
            {specs.map(([k, v]) => (
              <div key={k} className="fact">
                <span className="fact__k">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>

          <div className="card elev-sm card--pad card--gap-sm">
            <div className="card-kicker">Top buyers</div>
            {topBuyers.map(([cid, units]) => (
              <button key={cid} type="button" className="btn buyer" onClick={() => open(paths.customer(cid))}>
                <span className="grow text-left">{customers[cid].name}</span>
                <span className="muted">{units} units</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {dialog === 'restock' && <RestockDialog product={p} onClose={() => setDialog(null)} />}
      {dialog === 'price' && <PriceEditDialog product={p} onClose={() => setDialog(null)} />}
      {dialog === 'promo' && <PromotionDialog initialSku={p.sku} onClose={() => setDialog(null)} />}
    </>
  );
}
