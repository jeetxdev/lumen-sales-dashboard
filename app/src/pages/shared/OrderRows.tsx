import type { Customer, Order } from '../../api/types';
import { ClickCard, ClickRow } from '../../components/ClickRow';
import { ORDER_TAG } from '../../components/tags';
import { money } from '../../domain/format';
import { paths, useOpen } from '../../routes';

export type OrderColumn = 'id' | 'po' | 'placed' | 'customer' | 'warehouse' | 'units' | 'status' | 'total';

const HEADS: Record<OrderColumn, [string, boolean]> = {
  id: ['Order', false],
  po: ['PO #', false],
  placed: ['Placed', false],
  customer: ['Account', false],
  warehouse: ['Ship from', false],
  units: ['Units', true],
  status: ['Status', false],
  total: ['Total', true],
};

function cell(col: OrderColumn, o: Order, customerName: string) {
  switch (col) {
    case 'id':
      return <td key={col} className="muted">#{o.id}</td>;
    case 'po':
      return <td key={col} className="muted text-13">{o.po}</td>;
    case 'placed':
      return <td key={col} className="muted">{o.placed}</td>;
    case 'customer':
      return <td key={col}>{customerName}</td>;
    case 'warehouse':
      return <td key={col} className="muted">{o.warehouse}</td>;
    case 'units':
      return <td key={col} className="r">{o.units}</td>;
    case 'status':
      return (
        <td key={col}>
          <span className={`tag ${ORDER_TAG[o.status]}`}>{o.status}</span>
        </td>
      );
    case 'total':
      return <td key={col} className="r num">{money(o.total)}</td>;
  }
}

interface OrderTableProps {
  orders: Order[];
  customers: Customer[];
  columns: OrderColumn[];
  minWidth?: boolean;
}

export function OrderTable({ orders, customers, columns, minWidth = false }: OrderTableProps) {
  const open = useOpen();
  const table = (
    <table className={`table ${minWidth ? 'min-460' : ''}`}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} className={HEADS[c][1] ? 'r' : undefined}>
              {HEADS[c][0]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <ClickRow key={o.id} label={`Open order #${o.id}`} onOpen={() => open(paths.order(o.id))}>
            {columns.map((c) => cell(c, o, customers[o.customerId].name))}
          </ClickRow>
        ))}
      </tbody>
    </table>
  );
  return minWidth ? <div className="scroll-x">{table}</div> : table;
}

/** Compact rows for the Overview card on mobile. */
export function OrderList({ orders, customers }: { orders: Order[]; customers: Customer[] }) {
  const open = useOpen();
  return (
    <div className="stack">
      {orders.map((o) => (
        <ClickCard key={o.id} className="list-row" label={`Open order #${o.id}`} onOpen={() => open(paths.order(o.id))}>
          <div className="list-row__main">
            <span className="text-14">{customers[o.customerId].name}</span>
            <span className="muted-xs-12">
              #{o.id} · {o.warehouse}
            </span>
          </div>
          <div className="list-row__side">
            <span className="num text-14">{money(o.total)}</span>
            <span className={`tag ${ORDER_TAG[o.status]}`}>{o.status}</span>
          </div>
        </ClickCard>
      ))}
    </div>
  );
}

/** Full cards for the Orders screen on mobile. */
export function OrderCards({ orders, customers }: { orders: Order[]; customers: Customer[] }) {
  const open = useOpen();
  return (
    <section className="card-list">
      {orders.map((o) => (
        <ClickCard key={o.id} className="m-card m-card--tight" label={`Open order #${o.id}`} onOpen={() => open(paths.order(o.id))}>
          <div className="row-center">
            <span className="muted-sm">
              #{o.id} · {o.po}
            </span>
            <span className={`tag ${ORDER_TAG[o.status]} push-right`}>{o.status}</span>
          </div>
          <div className="row-baseline">
            <span className="grow text-15">{customers[o.customerId].name}</span>
            <span className="num">{money(o.total)}</span>
          </div>
          <div className="muted-xs-12">
            {o.placed} · {o.warehouse} · {o.units} units
          </div>
        </ClickCard>
      ))}
    </section>
  );
}
