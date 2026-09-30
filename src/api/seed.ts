import type {
  Category,
  Customer,
  Incoming,
  Invoice,
  KpiTrends,
  Order,
  OrderStatus,
  PaymentTerms,
  Product,
  Promotion,
  Range,
  RangeSummary,
  SalesSeries,
  Settings,
  Supplier,
  TeamMember,
  Tier,
  Warehouse,
} from './types';

// Placeholder data for Lumen Goods. The mock server clones it on start, so edits never leak back here.

export const CURRENT_USER = { name: 'Maya Rivera', role: 'Sales lead', initials: 'MR' };
export const COMPANY = { legalName: 'Lumen Goods Wholesale LLC', taxId: '93-4418207', currency: 'USD', billingEmail: 'ar@lumengoods.co', defaultCreditLimit: 10000 };

// The data describes one fixed business day.
export const TODAY = new Date(2026, 8, 24);
export const TODAY_SHORT = 'Sep 24';
export const TODAY_LONG = 'Sep 24, 2026';
export const TODAY_HEADING = 'Thursday, September 24';
export const REPORT_PERIOD = 'October 2025 – September 2026';

const TIER_DISCOUNT_AT_SEED: Record<Tier, number> = { Standard: 0, Silver: 0.04, Gold: 0.08 };
const TIER_QTY_MULTIPLIER: Record<Tier, number> = { Standard: 1, Silver: 2, Gold: 3 };
const BASE_FREIGHT = 45;
const FREIGHT_PER_LINE = 30;
const FIRST_ORDER_ID = 20486;
const FIRST_PO = 7730;
const FIRST_INVOICE_FOR_ORDERS = 2300;
const HISTORY_SEED_RATIO = 0.95;
const SOLD_PER_REORDER_POINT = 60;

export const WAREHOUSES: Warehouse[] = [
  { code: 'PDX', name: 'Portland DC', city: 'Portland, OR', capacity: 9000 },
  { code: 'CMH', name: 'Columbus DC', city: 'Columbus, OH', capacity: 6500 },
  { code: 'RNO', name: 'Reno DC', city: 'Reno, NV', capacity: 4000 },
];

export const SUPPLIERS: Record<Category, Supplier> = {
  Kitchen: { name: 'Kiln & Co. Ceramics', leadDays: 21 },
  Linens: { name: 'Fernhill Textiles', leadDays: 28 },
  Home: { name: 'Westbrook Weavers', leadDays: 18 },
  Candles: { name: 'Hollow Oak Chandlery', leadDays: 12 },
};

export const CATEGORIES: Category[] = ['Kitchen', 'Linens', 'Home', 'Candles'];

export const SALES: SalesSeries = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  fullLabels: ['October 2025', 'November 2025', 'December 2025', 'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026'],
  revenue: [312, 298, 356, 241, 268, 305, 334, 352, 368, 341, 389, 412].map((v) => v * 1000),
  lastYear: [281, 270, 318, 226, 239, 262, 297, 309, 321, 306, 338, 352].map((v) => v * 1000),
  orders: [142, 137, 161, 112, 121, 139, 151, 158, 166, 154, 172, 186],
  margin: [41.2, 40.8, 39.6, 42.1, 41.7, 42.4, 42.9, 43.1, 42.6, 43.4, 43.8, 44.1],
};

export const RANGE_SUMMARIES: Record<Range, RangeSummary> = {
  '30d': { revenue: 412400, revenueDelta: '+7.9%', orders: 186, ordersDelta: '+4.1%' },
  QTD: { revenue: 1142000, revenueDelta: '+11.2%', orders: 521, ordersDelta: '+6.8%' },
  YTD: { revenue: 3284000, revenueDelta: '+14.6%', orders: 1498, ordersDelta: '+9.3%' },
};

export const KPI_TRENDS: KpiTrends = {
  receivables: [98, 104, 112, 108, 117, 121, 119, 126, 131, 128, 134, 130],
  inventoryValue: [61, 64, 59, 57, 62, 66, 63, 60, 58, 61, 59, 57],
};

export const REVENUE_BY_CATEGORY: Record<Category, number> = { Kitchen: 0.38, Candles: 0.24, Linens: 0.22, Home: 0.16 };
export const AVG_MARGIN_LABEL = '43.1% avg margin';
export const YOY_LABEL = '+13.2% YoY';

export const TEAM: TeamMember[] = [
  { name: 'Maya Rivera', email: 'maya@lumengoods.co', role: 'Admin' },
  { name: 'Jordan Lee', email: 'jordan@lumengoods.co', role: 'Sales rep' },
  { name: 'Priya Shah', email: 'priya@lumengoods.co', role: 'Sales rep' },
  { name: 'Dana Kim', email: 'dana@lumengoods.co', role: 'Finance' },
];

type ProductRow = [string, string, Category, number, number, number, number, number, number[], number, number];

const PRODUCT_ROWS: ProductRow[] = [
  ['Ceramic Pour-Over Set', 'LG-1042', 'Kitchen', 18, 32, 64, 6, 6, [420, 210, 96], 120, 300],
  ['Stoneware Mug, Dusk', 'LG-1051', 'Kitchen', 4.2, 9, 24, 24, 12, [1840, 1210, 640], 600, 1200],
  ['Walnut Serving Board', 'LG-1188', 'Kitchen', 14, 28, 62, 6, 4, [96, 40, 12], 60, 150],
  ['Glass Carafe, 1L', 'LG-1077', 'Kitchen', 9, 19, 42, 6, 6, [330, 190, 120], 80, 200],
  ['Cotton Napkins, Set of 4', 'LG-1210', 'Linens', 6, 12, 26, 12, 12, [80, 24, 0], 40, 200],
  ['Linen Throw, Slate', 'LG-2210', 'Linens', 22, 44, 89, 4, 4, [36, 12, 8], 30, 120],
  ['Wool Blend Blanket', 'LG-2240', 'Linens', 38, 72, 142, 4, 2, [140, 90, 44], 50, 120],
  ['Rattan Tray', 'LG-2275', 'Home', 12, 26, 54, 6, 6, [210, 160, 70], 40, 150],
  ['Jute Doormat', 'LG-2290', 'Home', 11, 22, 48, 4, 4, [150, 0, 60], 20, 100],
  ['Hand-Poured Soy Candle', 'LG-3305', 'Candles', 6, 15, 32, 12, 12, [980, 640, 410], 300, 600],
  ['Beeswax Taper Pair', 'LG-3301', 'Candles', 3.5, 8, 18, 24, 24, [60, 30, 0], 50, 300],
  ['Brass Candle Snuffer', 'LG-3320', 'Candles', 7, 14, 28, 6, 6, [18, 6, 4], 10, 80],
];

function roundToHalf(n: number) {
  return Math.round(n * 2) / 2;
}

export function seedProducts(): Product[] {
  return PRODUCT_ROWS.map(([name, sku, category, cost, ws, msrp, moq, casePack, stock, allocated, reorderPoint]) => ({
    sku,
    name,
    category,
    cost,
    ws,
    msrp,
    moq,
    casePack,
    stock: [...stock],
    allocated,
    reorderPoint,
    supplier: SUPPLIERS[category],
    priceHistory: [{ date: 'Mar 1, 2026', from: roundToHalf(ws * HISTORY_SEED_RATIO), to: ws, by: CURRENT_USER.name }],
    scheduled: null,
    unitsSold: SALES.orders.map((n) => Math.round(n * (reorderPoint / SOLD_PER_REORDER_POINT))),
  }));
}

type CustomerRow = [string, string, string, Tier, PaymentTerms, number, number, string, number, number, string];

const CUSTOMER_ROWS: CustomerRow[] = [
  ['Harbor & Pine Mercantile', 'Alana Brooks', 'Portland, OR', 'Gold', 'Net 45', 60000, 38400, 'Maya Rivera', 184200, 46, '2019'],
  ['Northfield Home', 'Sam Whitaker', 'Denver, CO', 'Gold', 'Net 45', 50000, 21250, 'Maya Rivera', 142800, 38, '2020'],
  ['Ellis Park Café', 'Rosa Jimenez', 'Chicago, IL', 'Silver', 'Net 30', 15000, 14100, 'Jordan Lee', 48600, 22, '2021'],
  ['Quill & Ash', 'Theo Grant', 'Brooklyn, NY', 'Silver', 'Net 30', 20000, 6800, 'Jordan Lee', 61300, 19, '2021'],
  ['Tidewater Goods', 'Nina Patel', 'Charleston, SC', 'Standard', 'Net 15', 8000, 9200, 'Priya Shah', 22400, 11, '2023'],
  ['Kestrel Design Co.', 'Owen Park', 'Seattle, WA', 'Gold', 'Net 60', 75000, 42900, 'Maya Rivera', 212500, 51, '2018'],
  ['Maple & Main', 'Grace Olsen', 'Madison, WI', 'Standard', 'Net 30', 10000, 2300, 'Priya Shah', 18900, 9, '2024'],
  ['Saltbox General', 'Leo Fischer', 'Portland, ME', 'Silver', 'Net 30', 20000, 11750, 'Jordan Lee', 57200, 24, '2022'],
  ['Bramble Studio', 'Iris Chen', 'Austin, TX', 'Standard', 'Net 15', 6000, 0, 'Priya Shah', 9800, 5, '2025'],
  ['Copper Kettle Shops', 'Marcus Hale', 'Minneapolis, MN', 'Gold', 'Net 45', 50000, 27600, 'Maya Rivera', 131400, 33, '2019'],
];

export function seedCustomers(): Customer[] {
  return CUSTOMER_ROWS.map(([name, contact, city, tier, terms, creditLimit, balance, rep, ytd, orderCount, since], id) => ({
    id,
    name,
    contact,
    city,
    tier,
    terms,
    creditLimit,
    balance,
    rep,
    ytd,
    orderCount,
    since,
    email: `${contact.split(' ')[0].toLowerCase()}@${name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)}.com`,
    phone: `(503) 555-01${10 + id}`,
    address: `218 Market St, ${city}`,
    initials: name.replace(/&/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join(''),
  }));
}

type InvoiceRow = [string, number, string, string, number, number, boolean];

const INVOICE_ROWS: InvoiceRow[] = [
  ['INV-2291', 0, 'Aug 12', 'Sep 26', 12400, 0, false],
  ['INV-2288', 5, 'Jul 30', 'Sep 28', 18600, 0, false],
  ['INV-2284', 2, 'Aug 01', 'Aug 31', 6200, 24, false],
  ['INV-2279', 4, 'Jul 18', 'Aug 02', 4800, 53, false],
  ['INV-2276', 4, 'Jun 20', 'Jul 05', 4400, 81, false],
  ['INV-2274', 1, 'Aug 20', 'Oct 04', 9850, 0, false],
  ['INV-2270', 7, 'Aug 25', 'Sep 24', 5600, 0, false],
  ['INV-2266', 9, 'Aug 14', 'Sep 28', 11200, 0, false],
  ['INV-2261', 3, 'Aug 10', 'Sep 09', 3400, 0, true],
  ['INV-2259', 0, 'Jul 02', 'Aug 16', 14800, 0, true],
  ['INV-2255', 7, 'Jul 15', 'Aug 14', 6150, 41, false],
  ['INV-2251', 6, 'Aug 22', 'Sep 21', 2300, 3, false],
  ['INV-2248', 5, 'Aug 30', 'Oct 29', 24300, 0, false],
  ['INV-2244', 9, 'Sep 02', 'Oct 17', 16400, 0, false],
  ['INV-2240', 2, 'Sep 05', 'Oct 05', 7900, 0, false],
  ['INV-2236', 1, 'Jul 11', 'Aug 25', 11400, 0, true],
];

export function seedInvoices(): Invoice[] {
  return INVOICE_ROWS.map(([id, customerId, issued, due, amount, daysLate, paid]) => ({ id, customerId, issued, due, amount, daysLate, paid, reminded: false }));
}

const ORDER_CUSTOMERS = [0, 5, 1, 2, 9, 3, 7, 0, 4, 6, 5, 1, 8, 9, 2, 3];
const ORDER_STATUSES: OrderStatus[] = ['Placed', 'Picking', 'Placed', 'Shipped', 'Picking', 'Delivered', 'Shipped', 'Delivered', 'On hold', 'Delivered', 'Delivered', 'Shipped', 'Delivered', 'Delivered', 'Delivered', 'Delivered'];
const ORDER_DATES = ['Sep 24', 'Sep 24', 'Sep 23', 'Sep 23', 'Sep 23', 'Sep 22', 'Sep 22', 'Sep 21', 'Sep 21', 'Sep 20', 'Sep 19', 'Sep 19', 'Sep 18', 'Sep 17', 'Sep 16', 'Sep 15'];

export function seedOrders(products: Product[], customers: Customer[]): Order[] {
  return ORDER_CUSTOMERS.map((customerId, i) => {
    const c = customers[customerId];
    const warehouse = WAREHOUSES[i % WAREHOUSES.length].code;
    const lines = Array.from({ length: 2 + (i % 3) }, (_, k) => {
      const p = products[(i * 5 + k * 3) % products.length];
      const qty = p.casePack * (1 + ((i + k) % 4)) * TIER_QTY_MULTIPLIER[c.tier];
      return { sku: p.sku, name: p.name, casePack: p.casePack, qty, unitPrice: p.ws, warehouse };
    });
    const subtotal = lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);
    const discount = subtotal * TIER_DISCOUNT_AT_SEED[c.tier];
    const freight = BASE_FREIGHT + lines.length * FREIGHT_PER_LINE;
    return {
      id: FIRST_ORDER_ID - i,
      po: `PO-${FIRST_PO + i * 7}`,
      customerId,
      placed: ORDER_DATES[i],
      status: ORDER_STATUSES[i],
      warehouse,
      lines,
      tierAtOrder: c.tier,
      subtotal,
      discount,
      freight,
      total: subtotal - discount + freight,
      units: lines.reduce((a, l) => a + l.qty, 0),
      invoiceId: `INV-${FIRST_INVOICE_FOR_ORDERS - i}`,
    };
  });
}

export function seedPromotions(): Promotion[] {
  return [
    { id: 'PR-07', name: 'Fall candle push', pct: 15, skus: ['LG-3305', 'LG-3301', 'LG-3320'], scopeLabel: 'Candles', audience: 'All accounts', start: 'Sep 15', end: 'Oct 31', stack: false, active: true },
    { id: 'PR-06', name: 'Summer linens clearance', pct: 20, skus: ['LG-2210', 'LG-1210'], scopeLabel: '2 products', audience: 'Silver & Gold', start: 'Jul 1', end: 'Aug 31', stack: true, active: false },
  ];
}

export function seedIncoming(): Incoming[] {
  return [
    { sku: 'LG-1051', type: 'PO', ref: 'PO-1181', qty: 1200, warehouse: 'CMH', eta: 'Oct 2', source: 'Kiln & Co. Ceramics' },
    { sku: 'LG-2290', type: 'Transfer', ref: 'TR-0412', qty: 40, warehouse: 'CMH', eta: 'Sep 26', source: 'from PDX' },
  ];
}

export function seedSettings(): Settings {
  return {
    tierDiscounts: { Silver: 4, Gold: 8 },
    defaultTerms: 'Net 30',
    toggles: { autohold: true, approve: true, low: true, overdue: true, digest: false, autopo: false },
  };
}

export const SEQ_START = { promo: 8, po: 1190, transfer: 413 };
