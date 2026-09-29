import type { SalesSeries } from '../../api/types';
import { money } from '../../domain/format';

interface MonthTableProps {
  sales: SalesSeries;
  /** Most recent months to show, newest first. */
  count: number;
  withLastYear?: boolean;
}

export function MonthTable({ sales, count, withLastYear = false }: MonthTableProps) {
  const rows = sales.labels
    .map((_, i) => i)
    .reverse()
    .slice(0, count);
  return (
    <div className="scroll-x">
      <table className={`table ${withLastYear ? 'min-520' : ''}`}>
        <thead>
          <tr>
            <th>Month</th>
            <th className="r">Orders</th>
            <th className="r">Revenue</th>
            {withLastYear && <th className="r">Last year</th>}
            <th className="r">Margin</th>
            <th className="r">vs LY</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={sales.fullLabels[i]}>
              <td>{sales.fullLabels[i]}</td>
              <td className="r">{sales.orders[i]}</td>
              <td className="r num">{money(sales.revenue[i])}</td>
              {withLastYear && <td className="r muted">{money(sales.lastYear[i])}</td>}
              <td className="r muted">{sales.margin[i].toFixed(1)}%</td>
              <td className="r text-a300">+{((sales.revenue[i] / sales.lastYear[i] - 1) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
