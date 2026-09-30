import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { useCustomers, useOrders } from '../api/hooks';
import type { OrderStatus } from '../api/types';
import { Seg } from '../components/controls';
import { NOT_BUILT } from '../components/tags';
import { matchesQuery } from '../domain/format';
import { useIsMobile } from '../hooks/useIsMobile';
import { PageHeader } from '../layout/PageHeader';
import { OrderCards, OrderTable } from './shared/OrderRows';

type OrderFilter = 'All' | OrderStatus;
const FILTERS: OrderFilter[] = ['All', 'Placed', 'Picking', 'Shipped', 'Delivered', 'On hold'];

export function Orders() {
  const mobile = useIsMobile();
  const orders = useOrders();
  const customers = useCustomers();
  const [filter, setFilter] = useState<OrderFilter>('All');
  const [query, setQuery] = useState('');

  const openCount = orders.filter((o) => o.status !== 'Delivered').length;
  const countFor = (f: OrderFilter) => (f === 'All' ? orders.length : orders.filter((o) => o.status === f).length);
  // Empty statuses are hidden, unless the user already has that filter selected.
  const filters = FILTERS.filter((f) => countFor(f) > 0 || f === filter);
  const shown = orders.filter((o) => (filter === 'All' || o.status === filter) && matchesQuery(query, o.id, o.po, customers[o.customerId].name));

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${openCount} open · ${orders.length} this month`}
        search={{ value: query, onChange: setQuery, placeholder: 'Search orders…' }}
        action={{ label: 'New order', icon: <Plus />, onClick: NOT_BUILT }}
      />
      <section className="toolbar">
        <Seg scroll label="Order status" value={filter} onChange={setFilter} options={filters.map((f) => ({ value: f, label: f, meta: countFor(f) }))} />
        <span className="toolbar__note">
          {shown.length} of {orders.length} orders
        </span>
      </section>
      {mobile ? (
        <OrderCards orders={shown} customers={customers} />
      ) : (
        <section className="card elev-sm card--table">
          <OrderTable orders={shown} customers={customers} columns={['id', 'po', 'placed', 'customer', 'warehouse', 'units', 'status', 'total']} />
        </section>
      )}
    </>
  );
}
