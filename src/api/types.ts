export type WarehouseCode = 'PDX' | 'CMH' | 'RNO';
export type Category = 'Kitchen' | 'Linens' | 'Home' | 'Candles';
export type Tier = 'Standard' | 'Silver' | 'Gold';
export type PaymentTerms = 'Net 15' | 'Net 30' | 'Net 45' | 'Net 60';
export type OrderStatus = 'Placed' | 'Picking' | 'Shipped' | 'Delivered' | 'On hold';
export type PriceChangeWhen = 'Immediately' | 'Oct 1' | 'Nov 1';
export type PromoAudience = 'All accounts' | 'Silver & Gold' | 'Gold only';
export type PromoEnd = 'Oct 31' | 'Nov 30' | 'No end date';
export type Range = '30d' | 'QTD' | 'YTD';

export interface Warehouse {
  code: WarehouseCode;
  name: string;
  city: string;
  capacity: number;
}

export interface Supplier {
  name: string;
  leadDays: number;
}

export interface PriceHistoryEntry {
  date: string;
  from: number;
  to: number;
  by: string;
}

export interface ScheduledPrice {
  when: Exclude<PriceChangeWhen, 'Immediately'>;
  cost: number;
  ws: number;
  msrp: number;
}

export interface Product {
  sku: string;
  name: string;
  category: Category;
  cost: number;
  ws: number;
  msrp: number;
  moq: number;
  casePack: number;
  /** Units per warehouse, in the same order as the warehouse list. */
  stock: number[];
  allocated: number;
  reorderPoint: number;
  supplier: Supplier;
  priceHistory: PriceHistoryEntry[];
  scheduled: ScheduledPrice | null;
  /** Units sold per month, oldest first, aligned with the sales series. */
  unitsSold: number[];
}

export interface Customer {
  id: number;
  name: string;
  contact: string;
  city: string;
  tier: Tier;
  terms: PaymentTerms;
  creditLimit: number;
  balance: number;
  rep: string;
  ytd: number;
  orderCount: number;
  since: string;
  email: string;
  phone: string;
  address: string;
  initials: string;
}

export interface Invoice {
  id: string;
  customerId: number;
  issued: string;
  due: string;
  amount: number;
  daysLate: number;
  paid: boolean;
  reminded: boolean;
}

export interface OrderLine {
  sku: string;
  name: string;
  casePack: number;
  qty: number;
  /** Wholesale price when the order was placed. Later price changes do not touch it. */
  unitPrice: number;
  warehouse: WarehouseCode;
}

export interface Order {
  id: number;
  po: string;
  customerId: number;
  placed: string;
  status: OrderStatus;
  warehouse: WarehouseCode;
  lines: OrderLine[];
  tierAtOrder: Tier;
  subtotal: number;
  discount: number;
  freight: number;
  total: number;
  units: number;
  invoiceId: string;
}

export interface Promotion {
  id: string;
  name: string;
  pct: number;
  skus: string[];
  scopeLabel: string;
  audience: PromoAudience;
  start: string;
  end: string | null;
  stack: boolean;
  active: boolean;
}

export interface Incoming {
  sku: string;
  type: 'PO' | 'Transfer';
  ref: string;
  qty: number;
  warehouse: WarehouseCode;
  eta: string;
  source: string;
}

export interface SettingToggles {
  autohold: boolean;
  approve: boolean;
  low: boolean;
  overdue: boolean;
  digest: boolean;
  autopo: boolean;
}

export interface Settings {
  tierDiscounts: { Silver: number; Gold: number };
  defaultTerms: PaymentTerms;
  toggles: SettingToggles;
}

export interface TeamMember {
  name: string;
  email: string;
  role: string;
}

export interface SalesSeries {
  labels: string[];
  fullLabels: string[];
  revenue: number[];
  lastYear: number[];
  orders: number[];
  margin: number[];
}

export interface RangeSummary {
  revenue: number;
  revenueDelta: string;
  orders: number;
  ordersDelta: string;
}

export interface KpiTrends {
  receivables: number[];
  inventoryValue: number[];
}

export interface RestockInput {
  sku: string;
  mode: 'po' | 'transfer';
  from: number;
  dest: number;
  qty: number;
}

export interface PriceUpdateInput {
  sku: string;
  cost: number;
  ws: number;
  msrp: number;
  when: PriceChangeWhen;
}

export interface PromotionInput {
  name: string;
  pct: number;
  skus: string[];
  scopeLabel: string;
  audience: PromoAudience;
  end: PromoEnd;
  stack: boolean;
}
