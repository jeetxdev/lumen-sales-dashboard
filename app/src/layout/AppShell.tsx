import { Suspense, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MoonStars } from '@phosphor-icons/react';
import { useInvoices, useOrders, useProducts } from '../api/hooks';
import { CURRENT_USER } from '../api/seed';
import { invoiceStatus } from '../domain/finance';
import { stockStatus } from '../domain/inventory';
import { useIsMobile } from '../hooks/useIsMobile';
import { useCurrentSection, type Section } from '../routes';
import { MORE_SECTIONS, NAV_ITEMS, TAB_ITEMS } from './nav';

function useNavBadges(): Partial<Record<Section, number>> {
  const orders = useOrders();
  const invoices = useInvoices();
  const products = useProducts();
  return {
    orders: orders.filter((o) => o.status !== 'Delivered').length,
    invoices: invoices.filter((i) => invoiceStatus(i) === 'Overdue').length,
    inventory: products.filter((p) => stockStatus(p) !== 'Healthy').length,
  };
}

function Sidebar() {
  const section = useCurrentSection();
  const badges = useNavBadges();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark">
          <MoonStars />
        </div>
        <div className="brand__text">
          <span className="brand__name">Lumen Goods</span>
          <span className="brand__sub">Wholesale</span>
        </div>
      </div>
      <nav className="sidebar__nav" aria-label="Main">
        {NAV_ITEMS.map(({ id, label, path, icon: Icon }) => (
          <Link key={id} to={path} className={`btn nav-item ${section === id ? 'nav-item--on' : ''}`} aria-current={section === id ? 'page' : undefined}>
            <Icon className="nav-item__icon" />
            <span className="nav-item__label">{label}</span>
            <span className="nav-item__badge">{badges[id] || ''}</span>
          </Link>
        ))}
      </nav>
      <div className="user">
        <div className="avatar avatar--accent">{CURRENT_USER.initials}</div>
        <div className="user__text">
          <span className="user__name">{CURRENT_USER.name}</span>
          <span className="brand__sub">{CURRENT_USER.role}</span>
        </div>
      </div>
    </aside>
  );
}

function TabBar() {
  const section = useCurrentSection();
  return (
    <nav className="tabbar" aria-label="Main">
      {TAB_ITEMS.map(({ id, label, path, icon: Icon }) => {
        const on = id === 'more' ? MORE_SECTIONS.includes(section) : section === id;
        return (
          <Link key={id} to={path} className={`tabbar__item ${on ? 'tabbar__item--on' : ''}`} aria-current={on ? 'page' : undefined}>
            <Icon className="tabbar__icon" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Loading() {
  return (
    <div className="loading" role="status">
      Loading…
    </div>
  );
}

export function AppShell() {
  const mobile = useIsMobile();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="shell">
      <Suspense fallback={null}>{!mobile && <Sidebar />}</Suspense>
      <main ref={mainRef} className="main">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      {mobile && <TabBar />}
    </div>
  );
}
