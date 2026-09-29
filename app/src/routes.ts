import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type Section = 'overview' | 'orders' | 'customers' | 'products' | 'promotions' | 'inventory' | 'invoices' | 'reports' | 'settings' | 'more';
export type Screen = Section | 'order' | 'customer' | 'product';

export const paths = {
  overview: '/',
  orders: '/orders',
  order: (id: number) => `/orders/${id}`,
  customers: '/accounts',
  customer: (id: number) => `/accounts/${id}`,
  products: '/products',
  product: (sku: string) => `/products/${sku}`,
  promotions: '/promotions',
  inventory: '/inventory',
  invoices: '/invoices',
  reports: '/reports',
  settings: '/settings',
  more: '/more',
} as const;

const SCREEN_BY_SEGMENT: Record<string, [list: Screen, detail: Screen]> = {
  orders: ['orders', 'order'],
  accounts: ['customers', 'customer'],
  products: ['products', 'product'],
  promotions: ['promotions', 'promotions'],
  inventory: ['inventory', 'inventory'],
  invoices: ['invoices', 'invoices'],
  reports: ['reports', 'reports'],
  settings: ['settings', 'settings'],
  more: ['more', 'more'],
};

export function screenOf(pathname: string): Screen {
  const [segment, detail] = pathname.split('/').filter(Boolean);
  const match = segment ? SCREEN_BY_SEGMENT[segment] : undefined;
  if (!match) return 'overview';
  return detail ? match[1] : match[0];
}

const SECTION_OF_DETAIL: Partial<Record<Screen, Section>> = { order: 'orders', customer: 'customers', product: 'products' };

export function sectionOf(screen: Screen): Section {
  return SECTION_OF_DETAIL[screen] ?? (screen as Section);
}

/** Names used on the back button, keyed by the screen the user came from. */
export const SCREEN_NAMES: Record<Screen, string> = {
  overview: 'Overview',
  orders: 'Orders',
  order: 'Order',
  customers: 'Accounts',
  customer: 'Account',
  products: 'Products',
  product: 'Product',
  promotions: 'Promotions',
  inventory: 'Inventory',
  invoices: 'Invoices',
  reports: 'Reports',
  settings: 'Settings',
  more: 'More',
};

export interface NavState {
  back?: string;
  section?: Section;
}

export function useNavState(): NavState {
  return (useLocation().state as NavState | null) ?? {};
}

export function useCurrentSection(): Section {
  const { pathname } = useLocation();
  const state = useNavState();
  return state.section ?? sectionOf(screenOf(pathname));
}

/** Opens a screen with a back button that returns here. */
export function useOpen() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = useCurrentSection();
  return useCallback(
    (to: string) => {
      const target = screenOf(to);
      // A product opened from Inventory keeps Inventory highlighted in the navigation.
      const section = target === 'product' && current === 'inventory' ? 'inventory' : undefined;
      const state: NavState = { back: SCREEN_NAMES[screenOf(pathname)], section };
      navigate(to, { state });
    },
    [navigate, pathname, current],
  );
}
