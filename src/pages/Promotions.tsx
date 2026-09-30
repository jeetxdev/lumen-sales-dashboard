import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { usePromotions, useSetPromotionActive } from '../api/hooks';
import { ActionButton } from '../components/ActionButton';
import { PromotionDialog } from '../dialogs/PromotionDialog';
import { PageHeader } from '../layout/PageHeader';

export function Promotions() {
  const promotions = usePromotions();
  const setActive = useSetPromotionActive();
  const [creating, setCreating] = useState(false);
  const activeCount = promotions.filter((p) => p.active).length;

  return (
    <>
      <PageHeader title="Promotions" subtitle={`${activeCount} active · product-level discounts`} action={{ label: 'New promotion', icon: <Plus />, onClick: () => setCreating(true) }} />
      <section className="card elev-sm card--table">
        <div className="scroll-x">
          <table className="table min-780">
            <thead>
              <tr>
                <th>Promotion</th>
                <th>Applies to</th>
                <th>Discount</th>
                <th>Accounts</th>
                <th>Dates</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((pr) => (
                <tr key={pr.id}>
                  <td>
                    <div className="cell-stack">
                      <span>{pr.name}</span>
                      <span className="muted-xs-12">
                        {pr.id} · {pr.stack ? 'Stacks with tier discount' : 'Replaces tier discount'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-stack">
                      <span>{pr.scopeLabel}</span>
                      <span className="muted-xs-12">{pr.skus.length} products</span>
                    </div>
                  </td>
                  <td className="num">{pr.pct}% off</td>
                  <td className="muted">{pr.audience}</td>
                  <td className="muted nowrap">
                    {pr.start} – {pr.end ?? 'no end date'}
                  </td>
                  <td>
                    <span className={`tag ${pr.active ? 'tag-accent' : 'tag-neutral'}`}>{pr.active ? 'Active' : 'Ended'}</span>
                  </td>
                  <td className="r">
                    <ActionButton
                      className="btn btn-secondary btn--row"
                      onClick={() => setActive.mutate({ id: pr.id, active: !pr.active })}
                      pending={setActive.isPending && setActive.variables?.id === pr.id}
                      pendingLabel={pr.active ? 'Ending…' : 'Reactivating…'}
                    >
                      {pr.active ? 'End now' : 'Reactivate'}
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="muted-xs-12">Promotions apply at checkout, on top of or instead of the account's tier discount. Open orders keep the price they were placed at.</div>
      {creating && <PromotionDialog onClose={() => setCreating(false)} />}
    </>
  );
}
