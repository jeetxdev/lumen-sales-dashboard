import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CurrencyDollar, Export, FileText, Receipt, Warehouse } from '@phosphor-icons/react';
import { useCustomers, useInvoices, useKpiTrends, useOrders, useProducts, useRangeSummary, useSalesSeries, useWarehouses } from '../api/hooks';
import { CURRENT_USER, TODAY_HEADING, YOY_LABEL } from '../api/seed';
import type { Range } from '../api/types';
import { LineChart, Meter, Sparkline } from '../components/charts';
import { ViewToggle, type ViewMode } from '../components/controls';
import { NOT_BUILT } from '../components/tags';
import { invoiceStatus } from '../domain/finance';
import { compactMoney, clampedPct, num, sumBy } from '../domain/format';
import { stockStatus, totalStock } from '../domain/inventory';
import { useIsMobile } from '../hooks/useIsMobile';
import { PageHeader } from '../layout/PageHeader';
import { paths } from '../routes';
import { AgingList, AgingStrip, useAging } from './shared/Aging';
import { MonthTable } from './shared/MonthTable';
import { OrderList, OrderTable } from './shared/OrderRows';

const SPARK_RANGES = { revenue: [230000, 420000], orders: [105, 190], receivables: [95, 136], inventory: [55, 67] } as const;
const RECENT_ORDER_COUNT = 5;
const LOW_STOCK_COUNT = 5;
const RECENT_MONTHS = 6;

export function Overview() {
  const mobile = useIsMobile();
  const [range, setRange] = useState<Range>('30d');
  const [revView, setRevView] = useState<ViewMode>('chart');
  const summary = useRangeSummary(range);
  const trends = useKpiTrends();
  const sales = useSalesSeries();
  const orders = useOrders();
  const customers = useCustomers();
  const invoices = useInvoices();
  const products = useProducts();
  const warehouses = useWarehouses();
  const aging = useAging(invoices);

  const openOrders = orders.filter((o) => o.status !== 'Delivered').length;
  const overdue = invoices.filter((i) => invoiceStatus(i) === 'Overdue');
  const lowList = products.filter((p) => stockStatus(p) !== 'Healthy');
  const inventoryValue = sumBy(products, (p) => totalStock(p) * p.cost);

  const kpis = [
    { label: 'Revenue', icon: <CurrencyDollar />, value: compactMoney(summary.revenue), delta: summary.revenueDelta, note: 'vs prior period', spark: sales.revenue, lohi: SPARK_RANGES.revenue },
    { label: 'Orders', icon: <Receipt />, value: num(summary.orders), delta: summary.ordersDelta, note: `${openOrders} open`, spark: sales.orders, lohi: SPARK_RANGES.orders },
    { label: 'Outstanding AR', icon: <FileText />, value: compactMoney(aging.total), delta: compactMoney(aging.overdue), note: `overdue · ${overdue.length} invoices`, spark: trends.receivables, lohi: SPARK_RANGES.receivables },
    { label: 'Inventory value', icon: <Warehouse />, value: compactMoney(inventoryValue), delta: `${lowList.length} SKUs`, note: 'at or below reorder', spark: trends.inventoryValue, lohi: SPARK_RANGES.inventory },
  ];

  const labels = mobile ? sales.labels.map((l) => l[0]) : sales.labels;

  return (
    <>
      <PageHeader
        title={`Good morning, ${CURRENT_USER.name.split(' ')[0]}`}
        subtitle={TODAY_HEADING}
        range={{ value: range, onChange: setRange }}
        action={mobile ? null : { label: 'Export', icon: <Export />, onClick: NOT_BUILT }}
      />

      <section className="grid-kpi">
        {kpis.map((k) => (
          <div key={k.label} className="card elev-sm card--pad kpi">
            <div className="kpi__label">
              <span className="kpi__icon">{k.icon}</span>
              {k.label}
            </div>
            <div className="kpi__row">
              <div className="kpi__value">{k.value}</div>
              <Sparkline values={k.spark} lo={k.lohi[0]} hi={k.lohi[1]} />
            </div>
            <div className="muted-sm">
              <span className="text-a300">{k.delta}</span> {k.note}
            </div>
          </div>
        ))}
      </section>

      <section className="grid-split">
        <div className="card elev-sm card--pad card--gap-lg">
          <div className="card-head card-head--baseline">
            <div className="card-title card-head__title">Revenue</div>
            <span className="muted-sm">{compactMoney(sumBy(sales.revenue, (v) => v))} trailing 12 mo</span>
            <span className="tag tag-accent">{YOY_LABEL}</span>
            <ViewToggle label="Revenue view" value={revView} onChange={setRevView} />
          </div>
          {revView === 'chart' ? <LineChart current={sales.revenue} previous={sales.lastYear} labels={labels} legend /> : <MonthTable sales={sales} count={RECENT_MONTHS} />}
        </div>

        <div className="card elev-sm card--pad card--gap-md">
          <div className="card-head card-head--baseline">
            <div className="card-title card-head__title">Receivables</div>
            <span className="stat-md">{compactMoney(aging.total)}</span>
          </div>
          <AgingStrip aging={aging} />
          <AgingList aging={aging} />
          <Link to={paths.invoices} className="btn btn-ghost push-bottom">
            Review invoices
            <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="grid-split">
        <div className="card elev-sm card--pad card--gap-md">
          <div className="card-head">
            <div className="card-title card-head__title">Recent orders</div>
            <Link to={paths.orders} className="btn btn-ghost">
              All orders
              <ArrowRight />
            </Link>
          </div>
          {mobile ? (
            <OrderList orders={orders.slice(0, RECENT_ORDER_COUNT)} customers={customers} />
          ) : (
            <OrderTable orders={orders.slice(0, RECENT_ORDER_COUNT)} customers={customers} columns={['id', 'customer', 'warehouse', 'status', 'total']} />
          )}
        </div>

        <div className="card elev-sm card--pad card--gap-sm">
          <div className="card-head">
            <div className="card-title card-head__title">Low stock</div>
            <span className="tag tag-outline">{lowList.length} SKUs</span>
          </div>
          {lowList.slice(0, LOW_STOCK_COUNT).map((p) => (
            <div key={p.sku} className="low-item">
              <div className="row-between text-13">
                <span className="grow">{p.name}</span>
                <span className="muted num">
                  {totalStock(p)} / {p.reorderPoint}
                </span>
              </div>
              <Meter value={clampedPct(totalStock(p), p.reorderPoint)} tone="a500" size="xs" label={`${p.name} stock against reorder point`} />
              <div className="muted-xs">{warehouses.map((w, i) => `${w.code} ${p.stock[i]}`).join(' · ')}</div>
            </div>
          ))}
          <Link to={paths.inventory} className="btn btn-primary push-bottom">
            Review reorders
          </Link>
        </div>
      </section>
    </>
  );
}
