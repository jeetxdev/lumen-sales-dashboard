import { ChartLineUp, DotsThreeOutline, FileText, GearSix, Package, Percent, Receipt, SquaresFour, UsersThree, Warehouse, type Icon } from '@phosphor-icons/react';
import { paths, type Section } from '../routes';

export interface NavItem {
  id: Section;
  label: string;
  path: string;
  icon: Icon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', path: paths.overview, icon: SquaresFour },
  { id: 'orders', label: 'Orders', path: paths.orders, icon: Receipt },
  { id: 'customers', label: 'Customers', path: paths.customers, icon: UsersThree },
  { id: 'products', label: 'Products', path: paths.products, icon: Package },
  { id: 'promotions', label: 'Promotions', path: paths.promotions, icon: Percent },
  { id: 'inventory', label: 'Inventory', path: paths.inventory, icon: Warehouse },
  { id: 'invoices', label: 'Invoices', path: paths.invoices, icon: FileText },
  { id: 'reports', label: 'Reports', path: paths.reports, icon: ChartLineUp },
  { id: 'settings', label: 'Settings', path: paths.settings, icon: GearSix },
];

export const TAB_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Home', path: paths.overview, icon: SquaresFour },
  { id: 'orders', label: 'Orders', path: paths.orders, icon: Receipt },
  { id: 'customers', label: 'Accounts', path: paths.customers, icon: UsersThree },
  { id: 'inventory', label: 'Stock', path: paths.inventory, icon: Warehouse },
  { id: 'more', label: 'More', path: paths.more, icon: DotsThreeOutline },
];

/** Sections reached through the mobile "More" tab. */
export const MORE_SECTIONS: Section[] = ['products', 'promotions', 'invoices', 'reports', 'settings', 'more'];
