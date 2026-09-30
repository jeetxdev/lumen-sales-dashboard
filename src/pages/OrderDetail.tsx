import { useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, LockOpen } from '@phosphor-icons/react';
import { useCustomers, useOrders, useSetOrderStatus, useWarehouses } from '../api/hooks';
import type { OrderStatus } from '../api/types';
import { ORDER_TAG } from '../components/tags';
import { money } from '../domain/format';
import type { HeaderAction } from '../layout/PageHeader';
import { PageHeader } from '../layout/PageHeader';
import { paths, useOpen } from '../routes';
import { NotFound } from './NotFound';

const STEPS: OrderStatus[] = ['Placed', 'Picking', 'Shipped', 'Delivered'];
const NEXT_LABELS = ['Start picking', 'Mark shipped', 'Mark delivered'];
// Orders above this many units ship by freight truck instead of parcel.
const LTL_THRESHOLD_UNITS = 150;
const SHIPPED_STEP = 2;

export function OrderDetail() {
  const { id } = useParams();
  const orders = useOrders();
  const customers = useCustomers();
  const warehouses = useWarehouses();
  const setStatus = useSetOrderStatus();
  const open = useOpen();

  const o = orders.find((x) => x.id === Number(id));
  if (!o) return <NotFound what="Order" />;
  const c = customers[o.customerId];
  const step = STEPS.indexOf(o.status);
  const shipped = step >= SHIPPED_STEP;
  const wh = warehouses.find((w) => w.code === o.warehouse);

  let action: HeaderAction | null = null;
  if (o.status === 'On hold') {
    action = { label: 'Release hold', icon: <LockOpen />, onClick: () => setStatus.mutate({ id: o.id, status: 'Placed' }), pending: setStatus.isPending, pendingLabel: 'Updating…' };
  } else if (step < STEPS.length - 1) {
    action = { label: NEXT_LABELS[step], icon: <ArrowRight />, onClick: () => setStatus.mutate({ id: o.id, status: STEPS[step + 1] }), pending: setStatus.isPending, pendingLabel: 'Updating…' };
  }

  const facts = (rows: [string, string][]) =>
    rows.map(([k, v]) => (
      <div key={k} className="fact">
        <span className="fact__k">{k}</span>
        <span>{v}</span>
      </div>
    ));

  return (
    <>
      <PageHeader title={`#${o.id}`} subtitle={`${o.po} · placed ${o.placed}`} tag={{ label: o.status, cls: ORDER_TAG[o.status] }} action={action} />

      <section className="card elev-sm card--pad card--gap-md">
        <div className="steps">
          {STEPS.map((label, i) => {
            const done = i <= step;
            const date = !done ? '—' : i === 0 ? o.placed : i === step ? 'Today' : o.placed;
            return (
              <div key={label} className={`step ${done ? 'step--done' : ''} ${i === step ? 'step--now' : ''}`}>
                <div className="step__bar" />
                <span className="step__label">{label}</span>
                <span className="muted-xs">{date}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid-split">
        <div className="card elev-sm card--pad card--gap-md">
          <div className="card-title">Line items</div>
          <div className="scroll-x">
            <table className="table min-480">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>From</th>
                  <th className="r">Qty</th>
                  <th className="r">Unit</th>
                  <th className="r">Total</th>
                </tr>
              </thead>
              <tbody>
                {o.lines.map((l) => (
                  <tr key={l.sku}>
                    <td>
                      <div className="cell-stack">
                        <span>{l.name}</span>
                        <span className="muted-xs-12">
                          {l.sku} · case of {l.casePack}
                        </span>
                      </div>
                    </td>
                    <td className="muted">{l.warehouse}</td>
                    <td className="r">{l.qty}</td>
                    <td className="r muted">{money(l.unitPrice, 2)}</td>
                    <td className="r num">{money(l.qty * l.unitPrice, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="totals">
            {(
              [
                ['Subtotal', money(o.subtotal, 2)],
                [`${o.tierAtOrder} discount`, '−' + money(o.discount, 2)],
                ['Freight', money(o.freight, 2)],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="totals__row">
                <span className="grow">{k}</span>
                <span className="num">{v}</span>
              </div>
            ))}
            <div className="totals__total">
              <span className="grow">Total</span>
              <span className="num">{money(o.total, 2)}</span>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card elev-sm card--pad card--gap-sm">
            <div className="card-kicker">Account</div>
            <button type="button" className="btn btn-ghost link-title" onClick={() => open(paths.customer(c.id))}>
              {c.name}
              <ArrowUpRight className="text-accent" />
            </button>
            <div className="row-wrap">
              <span className="tag tag-accent">{c.tier} tier</span>
              <span className="tag tag-neutral">{c.terms}</span>
            </div>
            <div className="muted text-13">{c.address}</div>
          </div>
          <div className="card elev-sm card--pad card--gap-sm">
            <div className="card-kicker">Invoice</div>
            {facts([
              ['Invoice', shipped ? o.invoiceId : 'On shipment'],
              ['Terms', c.terms],
              ['Credit available', money(Math.max(0, c.creditLimit - c.balance))],
            ])}
          </div>
          <div className="card elev-sm card--pad card--gap-sm">
            <div className="card-kicker">Fulfilment</div>
            {facts([
              ['Ships from', wh?.name ?? o.warehouse],
              ['Carrier', o.units > LTL_THRESHOLD_UNITS ? 'LTL freight' : 'UPS Ground'],
              ['Tracking', shipped ? `1Z84${o.po.slice(3)}W` : '—'],
            ])}
          </div>
        </div>
      </section>
    </>
  );
}
