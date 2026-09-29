import { useState } from 'react';
import { Export } from '@phosphor-icons/react';
import { useCustomers, useSalesSeries } from '../api/hooks';
import { AVG_MARGIN_LABEL, REPORT_PERIOD, REVENUE_BY_CATEGORY } from '../api/seed';
import type { Range } from '../api/types';
import { LineChart, Meter } from '../components/charts';
import { ClickRow } from '../components/ClickRow';
import { ViewToggle, type ViewMode } from '../components/controls';
import { NOT_BUILT } from '../components/tags';
import { compactMoney, money, sumBy } from '../domain/format';
import { useIsMobile } from '../hooks/useIsMobile';
import { PageHeader } from '../layout/PageHeader';
import { paths, useOpen } from '../routes';
import { MonthTable } from './shared/MonthTable';

const TOP_ACCOUNTS = 6;
const REPS = ['Maya Rivera', 'Jordan Lee', 'Priya Shah'];

interface BreakdownRow {
  name: string;
  meta: string;
  value: number;
  pct: number;
}

function Breakdown({ title, nameHead, metaHead, rows }: { title: string; nameHead: string; metaHead: string; rows: BreakdownRow[] }) {
  const [view, setView] = useState<ViewMode>('chart');
  return (
    <div className="card elev-sm card--pad card--gap-md">
      <div className="card-head">
        <div className="card-title card-head__title">{title}</div>
        <ViewToggle label={`${title} view`} value={view} onChange={setView} />
      </div>
      {view === 'chart' ? (
        rows.map((r) => (
          <div key={r.name} className="breakdown">
            <div className="row-between text-13">
              <span className="grow">{r.name}</span>
              <span className="breakdown__value num">{compactMoney(r.value)}</span>
            </div>
            <Meter value={r.pct} size="lg" label={`${r.name} revenue`} />
          </div>
        ))
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{nameHead}</th>
              <th className="r">{metaHead}</th>
              <th className="r">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td className="r muted">{r.meta}</td>
                <td className="r num">{compactMoney(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function Reports() {
  const mobile = useIsMobile();
  const sales = useSalesSeries();
  const customers = useCustomers();
  const open = useOpen();
  // The range switch sits in the header like on Overview. The design keeps these reports on the trailing 12 months.
  const [range, setRange] = useState<Range>('30d');
  const [revView, setRevView] = useState<ViewMode>('chart');

  const revTotal = sumBy(sales.revenue, (v) => v);
  const maxShare = Math.max(...Object.values(REVENUE_BY_CATEGORY));
  const byCategory: BreakdownRow[] = Object.entries(REVENUE_BY_CATEGORY).map(([name, share]) => ({
    name,
    meta: `${Math.round(share * 100)}%`,
    value: revTotal * share,
    pct: Math.round((share / maxShare) * 100),
  }));

  const reps = REPS.map((name) => {
    const list = customers.filter((c) => c.rep === name);
    return { name, value: sumBy(list, (c) => c.ytd), n: list.length };
  });
  const repMax = Math.max(...reps.map((r) => r.value));
  const byRep: BreakdownRow[] = reps.map((r) => ({ name: r.name, meta: `${r.n} accounts`, value: r.value, pct: Math.round((r.value / repMax) * 100) }));

  const ytdTotal = sumBy(customers, (c) => c.ytd);
  const top = [...customers].sort((a, b) => b.ytd - a.ytd).slice(0, TOP_ACCOUNTS);
  const labels = mobile ? sales.labels.map((l) => l[0]) : sales.labels;

  return (
    <>
      <PageHeader title="Reports" subtitle={REPORT_PERIOD} range={{ value: range, onChange: setRange }} action={mobile ? null : { label: 'Export', icon: <Export />, onClick: NOT_BUILT }} />

      <section className="card elev-sm card--pad card--gap-lg">
        <div className="card-head card-head--baseline">
          <div className="card-title card-head__title">Revenue vs last year</div>
          <span className="muted-sm">
            {compactMoney(revTotal)} · {AVG_MARGIN_LABEL}
          </span>
          <ViewToggle label="Revenue view" value={revView} onChange={setRevView} />
        </div>
        {revView === 'chart' ? <LineChart current={sales.revenue} previous={sales.lastYear} labels={labels} size="lg" /> : <MonthTable sales={sales} count={sales.labels.length} withLastYear />}
      </section>

      <section className="grid-auto-320">
        <Breakdown title="Revenue by category" nameHead="Category" metaHead="Share" rows={byCategory} />
        <Breakdown title="Revenue by rep" nameHead="Rep" metaHead="Accounts" rows={byRep} />
      </section>

      <section className="card elev-sm card--pad card--gap-md">
        <div className="card-title">Top accounts</div>
        <div className="scroll-x">
          <table className="table min-520">
            <thead>
              <tr>
                <th>Account</th>
                <th>Rep</th>
                <th className="r">Orders</th>
                <th className="r">YTD revenue</th>
                <th className="r">Share</th>
              </tr>
            </thead>
            <tbody>
              {top.map((c) => (
                <ClickRow key={c.id} label={`Open ${c.name}`} onOpen={() => open(paths.customer(c.id))}>
                  <td>{c.name}</td>
                  <td className="muted">{c.rep}</td>
                  <td className="r">{c.orderCount}</td>
                  <td className="r num">{money(c.ytd)}</td>
                  <td className="r muted">{((c.ytd / ytdTotal) * 100).toFixed(1)}%</td>
                </ClickRow>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
