import { useParams } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { useCustomers, useInvoices, useOrders, useSetCustomerTier, useSettings } from '../api/hooks';
import type { Tier } from '../api/types';
import { Meter } from '../components/charts';
import { Seg } from '../components/controls';
import { CUSTOMER_TAG, INVOICE_TAG, NOT_BUILT } from '../components/tags';
import { customerStatus, invoiceStatus, tierDiscountPct } from '../domain/finance';
import { compactMoney, money } from '../domain/format';
import { PageHeader } from '../layout/PageHeader';
import { NotFound } from './NotFound';
import { creditView, invoiceStatusLabel } from './shared/credit';
import { OrderTable } from './shared/OrderRows';

const TIERS: Tier[] = ['Standard', 'Silver', 'Gold'];
const TOP_PRODUCTS = 4;

export function AccountDetail() {
  const { id } = useParams();
  const customers = useCustomers();
  const invoices = useInvoices();
  const orders = useOrders();
  const settings = useSettings();
  const setTier = useSetCustomerTier();

  const c = customers.find((x) => x.id === Number(id));
  if (!c) return <NotFound what="Account" />;

  const status = customerStatus(c, invoices);
  const credit = creditView(c);
  const available = c.creditLimit - c.balance;
  const myInvoices = invoices.filter((i) => i.customerId === c.id);
  const myOrders = orders.filter((o) => o.customerId === c.id);

  const tally = new Map<string, number>();
  myOrders.forEach((o) => o.lines.forEach((l) => tally.set(l.name, (tally.get(l.name) ?? 0) + l.qty)));
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_PRODUCTS);

  const creditNote =
    available < 0
      ? `Over limit by ${money(-available)}. New orders are held until payment clears.`
      : status === 'Overdue'
        ? 'Within limit, but has overdue invoices.'
        : `${money(available)} available on ${c.terms} terms.`;

  const facts = [
    { k: 'YTD revenue', v: compactMoney(c.ytd) },
    { k: 'Balance', v: money(c.balance) },
    { k: 'Credit limit', v: money(c.creditLimit) },
    { k: 'Available', v: available < 0 ? '−' + money(-available) : money(available) },
  ];

  const info: [string, string][] = [
    ['Buyer', c.contact],
    ['Email', c.email],
    ['Phone', c.phone],
    ['Ship to', c.address],
    ['Sales rep', c.rep],
    ['Customer since', c.since],
  ];

  const disc = tierDiscountPct(c.tier, settings);

  return (
    <>
      <PageHeader title={c.name} subtitle={`${c.tier} · ${c.terms} · ${c.city}`} tag={{ label: status, cls: CUSTOMER_TAG[status] }} action={{ label: 'New order', icon: <Plus />, onClick: NOT_BUILT }} />

      <section className="grid-kpi">
        {facts.map((f) => (
          <div key={f.k} className="card elev-sm card--pad card--gap-xs">
            <div className="muted-sm">{f.k}</div>
            <div className="stat-lg">{f.v}</div>
          </div>
        ))}
      </section>

      <section className="grid-split">
        <div className="card elev-sm card--pad card--gap-md">
          <div className="card-head card-head--baseline">
            <div className="card-title card-head__title">Credit</div>
            <span className="muted text-13">{credit.usedLabel} used</span>
          </div>
          <Meter value={credit.barPct} tone={credit.tone} size="xl" label="Credit used" className="meter--glow" />
          <div className="text-13 text-n300">{creditNote}</div>

          <div className="card-title card-title--sub">Invoices</div>
          <div className="scroll-x">
            <table className="table min-460">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th className="r">Amount</th>
                </tr>
              </thead>
              <tbody>
                {myInvoices.map((i) => {
                  const st = invoiceStatus(i);
                  return (
                    <tr key={i.id}>
                      <td className="muted">{i.id}</td>
                      <td className="muted">{i.due}</td>
                      <td>
                        <span className={`tag ${INVOICE_TAG[st]}`}>{invoiceStatusLabel(st, i.daysLate)}</span>
                      </td>
                      <td className="r num">{money(i.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card-title card-title--sub">Orders</div>
          <OrderTable orders={myOrders} customers={customers} columns={['id', 'placed', 'status', 'total']} minWidth />
        </div>

        <div className="col">
          <div className="card elev-sm card--pad card--gap-sm">
            <div className="card-kicker">Pricing tier</div>
            <Seg
              className="seg--fixed align-start"
              label="Pricing tier"
              value={c.tier}
              onChange={(tier) => setTier.mutate({ id: c.id, tier })}
              options={TIERS.map((t) => ({ value: t, label: t, meta: t === 'Standard' ? 'List' : `−${tierDiscountPct(t, settings)}%` }))}
            />
            <div className="muted-sm">
              {c.tier === 'Standard' ? 'Pays wholesale list price.' : `Gets ${disc}% off wholesale list price on every order.`} Discounts are set in Settings → Price tiers.
            </div>
            <div className="card-kicker spaced-top">Account</div>
            {info.map(([k, v]) => (
              <div key={k} className="info">
                <span className="muted-xs-11">{k}</span>
                <span className="text-14">{v}</span>
              </div>
            ))}
          </div>
          <div className="card elev-sm card--pad card--gap-sm">
            <div className="card-kicker">Buys most</div>
            {top.map(([name, units]) => (
              <div key={name} className="row-between text-13">
                <span className="grow">{name}</span>
                <span className="muted">{units} units</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
