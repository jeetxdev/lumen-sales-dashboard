import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { useCategories, useProducts, usePromotions } from '../api/hooks';
import type { Category } from '../api/types';
import { Meter } from '../components/charts';
import { ClickRow } from '../components/ClickRow';
import { Seg } from '../components/controls';
import { NOT_BUILT } from '../components/tags';
import { activePromotionFor, marginPct } from '../domain/finance';
import { matchesQuery, money, num } from '../domain/format';
import { totalStock } from '../domain/inventory';
import { useIsMobile } from '../hooks/useIsMobile';
import { PageHeader } from '../layout/PageHeader';
import { paths, useOpen } from '../routes';

type CatFilter = 'All' | Category;

export function Products() {
  const mobile = useIsMobile();
  const products = useProducts();
  const categories = useCategories();
  const promotions = usePromotions();
  const open = useOpen();
  const [cat, setCat] = useState<CatFilter>('All');
  const [query, setQuery] = useState('');

  const rows = products.filter((p) => (cat === 'All' || p.category === cat) && matchesQuery(query, p.name, p.sku, p.category));
  const filters: CatFilter[] = ['All', ...categories];

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} SKUs · wholesale price list`}
        search={{ value: query, onChange: setQuery, placeholder: 'Search products…' }}
        action={mobile ? null : { label: 'Add product', icon: <Plus />, onClick: NOT_BUILT }}
      />
      <section className="toolbar">
        <Seg scroll label="Category" value={cat} onChange={setCat} options={filters.map((f) => ({ value: f, label: f }))} />
        <span className="toolbar__note">{rows.length} products</span>
      </section>
      <section className="card elev-sm card--table">
        <div className="scroll-x">
          <table className="table min-720">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th className="r">Cost</th>
                <th className="r">Wholesale</th>
                <th className="r">MSRP</th>
                <th className="w-16">Margin</th>
                <th className="r">MOQ</th>
                <th className="r">Available</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const margin = marginPct(p.cost, p.ws);
                const promo = activePromotionFor(p, promotions);
                return (
                  <ClickRow key={p.sku} label={`Open ${p.name}`} onOpen={() => open(paths.product(p.sku))}>
                    <td>
                      <div className="cell-stack">
                        <span className="row-center gap-xs">
                          {p.name}
                          {promo && <span className="tag tag-accent tag--sm">−{promo.pct}%</span>}
                        </span>
                        <span className="muted-xs-12">
                          {p.sku} · case of {p.casePack}
                        </span>
                      </div>
                    </td>
                    <td className="muted">{p.category}</td>
                    <td className="r muted">{money(p.cost, 2)}</td>
                    <td className="r">{money(p.ws, 2)}</td>
                    <td className="r muted">{money(p.msrp, 2)}</td>
                    <td>
                      <div className="row-center gap-md">
                        <Meter value={margin} tone="a500" className="grow" label={`${p.name} margin`} />
                        <span className="pct-label">{margin}%</span>
                      </div>
                    </td>
                    <td className="r">{p.moq}</td>
                    <td className="r num">{num(totalStock(p) - p.allocated)}</td>
                  </ClickRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
