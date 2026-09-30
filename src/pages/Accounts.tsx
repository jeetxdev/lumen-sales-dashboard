import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { useCustomers, useInvoices } from '../api/hooks';
import { Meter } from '../components/charts';
import { ClickCard, ClickRow } from '../components/ClickRow';
import { CUSTOMER_TAG, NOT_BUILT, TIER_TAG } from '../components/tags';
import { customerStatus } from '../domain/finance';
import { compactMoney, matchesQuery, sumBy } from '../domain/format';
import { useIsMobile } from '../hooks/useIsMobile';
import { PageHeader } from '../layout/PageHeader';
import { paths, useOpen } from '../routes';
import { creditView } from './shared/credit';

export function Accounts() {
  const mobile = useIsMobile();
  const customers = useCustomers();
  const invoices = useInvoices();
  const open = useOpen();
  const [query, setQuery] = useState('');

  const rows = customers
    .filter((c) => matchesQuery(query, c.name, c.contact, c.city, c.rep))
    .map((c) => ({ c, status: customerStatus(c, invoices), credit: creditView(c) }));

  const stats = [
    { label: 'Active accounts', value: customers.length },
    { label: 'Credit extended', value: compactMoney(sumBy(customers, (c) => c.creditLimit)) },
    { label: 'Balance owed', value: compactMoney(sumBy(customers, (c) => c.balance)) },
    { label: 'On hold / overdue', value: customers.filter((c) => customerStatus(c, invoices) !== 'Good standing').length },
  ];

  return (
    <>
      <PageHeader
        title="Accounts"
        subtitle={`${customers.length} wholesale accounts`}
        search={{ value: query, onChange: setQuery, placeholder: 'Search accounts…' }}
        action={mobile ? null : { label: 'Add account', icon: <Plus />, onClick: NOT_BUILT }}
      />
      <section className="grid-kpi">
        {stats.map((s) => (
          <div key={s.label} className="card elev-sm card--pad card--gap-xs">
            <div className="muted-sm">{s.label}</div>
            <div className="stat-lg">{s.value}</div>
          </div>
        ))}
      </section>

      {mobile ? (
        <section className="card-list">
          {rows.map(({ c, status, credit }) => (
            <ClickCard key={c.id} className="m-card" label={`Open ${c.name}`} onOpen={() => open(paths.customer(c.id))}>
              <div className="row-center gap-md">
                <div className="avatar avatar--lg">{c.initials}</div>
                <div className="cell-stack grow">
                  <span>{c.name}</span>
                  <span className="muted-xs-12">
                    {c.city} · {c.terms}
                  </span>
                </div>
                <span className={`tag ${CUSTOMER_TAG[status]}`}>{status}</span>
              </div>
              <Meter value={credit.barPct} tone={credit.tone} label={`${c.name} credit used`} />
              <div className="row-between muted-sm">
                <span className="grow">
                  {compactMoney(c.balance)} of {compactMoney(c.creditLimit)} credit
                </span>
                <span>{compactMoney(c.ytd)} YTD</span>
              </div>
            </ClickCard>
          ))}
        </section>
      ) : (
        <section className="card elev-sm card--table">
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Tier</th>
                <th>Terms</th>
                <th>Rep</th>
                <th className="w-20">Credit used</th>
                <th className="r">YTD revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, status, credit }) => (
                <ClickRow key={c.id} label={`Open ${c.name}`} onOpen={() => open(paths.customer(c.id))}>
                  <td>
                    <div className="row-center gap-md">
                      <div className="avatar">{c.initials}</div>
                      <div className="cell-stack">
                        <span>{c.name}</span>
                        <span className="muted-xs-12">
                          {c.contact} · {c.city}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${TIER_TAG[c.tier]}`}>{c.tier}</span>
                  </td>
                  <td className="muted">{c.terms}</td>
                  <td className="muted">{c.rep}</td>
                  <td>
                    <div className="meter-cell">
                      <Meter value={credit.barPct} tone={credit.tone} label={`${c.name} credit used`} />
                      <span className="muted-xs">
                        {compactMoney(c.balance)} of {compactMoney(c.creditLimit)}
                      </span>
                    </div>
                  </td>
                  <td className="r num">{compactMoney(c.ytd)}</td>
                  <td>
                    <span className={`tag ${CUSTOMER_TAG[status]}`}>{status}</span>
                  </td>
                </ClickRow>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
