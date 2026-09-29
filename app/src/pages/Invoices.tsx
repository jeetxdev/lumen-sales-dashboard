import { useState } from 'react';
import { Export } from '@phosphor-icons/react';
import { useCustomers, useInvoices, useSendReminder } from '../api/hooks';
import { INVOICE_TAG, NOT_BUILT } from '../components/tags';
import { Seg } from '../components/controls';
import { invoiceStatus, type InvoiceStatus } from '../domain/finance';
import { compactMoney, matchesQuery, money } from '../domain/format';
import { useIsMobile } from '../hooks/useIsMobile';
import { PageHeader } from '../layout/PageHeader';
import { paths, useOpen } from '../routes';
import { AgingStrip, AgingTiles, useAging } from './shared/Aging';
import { invoiceStatusLabel } from './shared/credit';

type InvFilter = 'All' | InvoiceStatus;
const FILTERS: InvFilter[] = ['All', 'Open', 'Overdue', 'Paid'];

export function Invoices() {
  const mobile = useIsMobile();
  const invoices = useInvoices();
  const customers = useCustomers();
  const remind = useSendReminder();
  const open = useOpen();
  const aging = useAging(invoices);
  const [filter, setFilter] = useState<InvFilter>('All');
  const [query, setQuery] = useState('');

  const countFor = (f: InvFilter) => (f === 'All' ? invoices.length : invoices.filter((i) => invoiceStatus(i) === f).length);
  // Most overdue first, so collections work starts at the top.
  const rows = invoices
    .filter((i) => (filter === 'All' || invoiceStatus(i) === filter) && matchesQuery(query, i.id, customers[i.customerId].name))
    .sort((a, b) => b.daysLate - a.daysLate);

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle={`${compactMoney(aging.total)} outstanding`}
        search={{ value: query, onChange: setQuery, placeholder: 'Search invoices…' }}
        action={mobile ? null : { label: 'Export aging', icon: <Export />, onClick: NOT_BUILT }}
      />
      <section className="card elev-sm card--pad card--gap-md">
        <div className="card-head card-head--baseline">
          <div className="card-title card-head__title">Aging</div>
          <span className="muted text-13">
            {compactMoney(aging.total)} outstanding · {compactMoney(aging.overdue)} overdue
          </span>
        </div>
        <AgingStrip aging={aging} />
        <AgingTiles aging={aging} />
      </section>
      <section className="toolbar">
        <Seg label="Invoice status" value={filter} onChange={setFilter} options={FILTERS.map((f) => ({ value: f, label: f, meta: countFor(f) }))} />
      </section>
      <section className="card elev-sm card--table">
        <div className="scroll-x">
          <table className="table min-680">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Account</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Terms</th>
                <th>Status</th>
                <th className="r">Amount</th>
                <th>
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const c = customers[i.customerId];
                const st = invoiceStatus(i);
                const btnClass = i.reminded ? 'btn-ghost' : st === 'Overdue' ? 'btn-primary' : 'btn-secondary';
                return (
                  <tr key={i.id}>
                    <td className="muted">{i.id}</td>
                    <td>
                      <button type="button" className="btn btn-ghost link-plain" onClick={() => open(paths.customer(c.id))}>
                        {c.name}
                      </button>
                    </td>
                    <td className="muted">{i.issued}</td>
                    <td className="muted">{i.due}</td>
                    <td className="muted">{c.terms}</td>
                    <td>
                      <span className={`tag ${INVOICE_TAG[st]}`}>{invoiceStatusLabel(st, i.daysLate)}</span>
                    </td>
                    <td className="r num">{money(i.amount)}</td>
                    <td className="r">
                      {st !== 'Paid' && (
                        <button type="button" className={`btn ${btnClass} btn--row`} onClick={() => remind.mutate(i.id)} disabled={i.reminded}>
                          {i.reminded ? 'Reminder sent' : 'Send reminder'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
