import { CaretRight } from '@phosphor-icons/react';
import { MORE_SECTIONS, NAV_ITEMS } from '../layout/nav';
import { PageHeader } from '../layout/PageHeader';
import { useOpen } from '../routes';

export function More() {
  const open = useOpen();
  const items = NAV_ITEMS.filter((n) => MORE_SECTIONS.includes(n.id));
  return (
    <>
      <PageHeader title="More" subtitle="" />
      <section className="more-list">
        {items.map(({ id, label, path, icon: Icon }) => (
          <button key={id} type="button" className="btn more-item" onClick={() => open(path)}>
            <Icon className="more-item__icon" />
            <span className="grow text-left">{label}</span>
            <CaretRight className="muted-n500" />
          </button>
        ))}
      </section>
    </>
  );
}
