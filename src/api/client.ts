import {
  CATEGORIES,
  CURRENT_USER,
  KPI_TRENDS,
  RANGE_SUMMARIES,
  SALES,
  SEQ_START,
  TEAM,
  TODAY,
  TODAY_LONG,
  TODAY_SHORT,
  WAREHOUSES,
  seedCustomers,
  seedIncoming,
  seedInvoices,
  seedOrders,
  seedProducts,
  seedPromotions,
  seedSettings,
} from './seed';
import type {
  Category,
  Customer,
  Incoming,
  Invoice,
  KpiTrends,
  Order,
  OrderStatus,
  PriceUpdateInput,
  Product,
  Promotion,
  PromotionInput,
  Range,
  RangeSummary,
  RestockInput,
  SalesSeries,
  Settings,
  TeamMember,
  Tier,
  Warehouse,
} from './types';
import { etaLabel, restockTransitDays } from '../domain/inventory';

// An in-memory stand-in for a REST backend. Each function maps to one future endpoint,
// returns copies, and resolves after a short delay so loading states behave as they would in production.

export const MOCK_LATENCY_MS = 120;
const ID_PAD = 2;
const TRANSFER_ID_PAD = 4;
export const MAX_TIER_DISCOUNT_PCT = 50;
// A loose check. The real backend would confirm the address by sending mail to it.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Db {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  orders: Order[];
  promotions: Promotion[];
  incoming: Incoming[];
  settings: Settings;
  seq: { promo: number; po: number; transfer: number };
}

function createDb(): Db {
  const products = seedProducts();
  const customers = seedCustomers();
  return {
    products,
    customers,
    invoices: seedInvoices(),
    orders: seedOrders(products, customers),
    promotions: seedPromotions(),
    incoming: seedIncoming(),
    settings: seedSettings(),
    seq: { ...SEQ_START },
  };
}

let db = createDb();
let latency = MOCK_LATENCY_MS;

/** Restores the seed data. Tests call it between cases. */
export function resetMockDb(options: { latencyMs?: number } = {}) {
  db = createDb();
  latency = options.latencyMs ?? MOCK_LATENCY_MS;
}

export class ApiError extends Error {}

function respond<T>(value: T): Promise<T> {
  const copy = structuredClone(value);
  return new Promise((resolve) => setTimeout(() => resolve(copy), latency));
}

function fail(message: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new ApiError(message)), latency));
}

function findProduct(sku: string): Product | undefined {
  return db.products.find((p) => p.sku === sku);
}

// GET endpoints

export const getWarehouses = (): Promise<Warehouse[]> => respond(WAREHOUSES);
export const getCategories = (): Promise<Category[]> => respond(CATEGORIES);
export const getProducts = (): Promise<Product[]> => respond(db.products);
export const getCustomers = (): Promise<Customer[]> => respond(db.customers);
export const getInvoices = (): Promise<Invoice[]> => respond(db.invoices);
export const getOrders = (): Promise<Order[]> => respond(db.orders);
export const getPromotions = (): Promise<Promotion[]> => respond(db.promotions);
export const getIncoming = (): Promise<Incoming[]> => respond(db.incoming);
export const getSettings = (): Promise<Settings> => respond(db.settings);
export const getTeam = (): Promise<TeamMember[]> => respond(TEAM);
export const getSalesSeries = (): Promise<SalesSeries> => respond(SALES);
export const getKpiTrends = (): Promise<KpiTrends> => respond(KPI_TRENDS);
export const getRangeSummary = (range: Range): Promise<RangeSummary> => respond(RANGE_SUMMARIES[range]);

// Mutations

export function setOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const order = db.orders.find((o) => o.id === id);
  if (!order) return fail(`Order #${id} not found.`);
  order.status = status;
  return respond(order);
}

export function sendInvoiceReminder(id: string): Promise<Invoice> {
  const invoice = db.invoices.find((i) => i.id === id);
  if (!invoice) return fail(`Invoice ${id} not found.`);
  if (invoice.paid) return fail(`Invoice ${id} is already paid.`);
  invoice.reminded = true;
  return respond(invoice);
}

export function setCustomerTier(id: number, tier: Tier): Promise<Customer> {
  const customer = db.customers.find((c) => c.id === id);
  if (!customer) return fail(`Account ${id} not found.`);
  customer.tier = tier;
  return respond(customer);
}

export function updateProductPrices(input: PriceUpdateInput): Promise<Product> {
  const p = findProduct(input.sku);
  if (!p) return fail(`Product ${input.sku} not found.`);
  if (input.ws <= 0 || input.ws <= input.cost) return fail('Wholesale price must be above cost.');
  if (input.when === 'Immediately') {
    p.priceHistory.push({ date: TODAY_LONG, from: p.ws, to: input.ws, by: CURRENT_USER.name });
    p.cost = input.cost;
    p.ws = input.ws;
    p.msrp = input.msrp;
    p.scheduled = null;
  } else {
    p.scheduled = { when: input.when, cost: input.cost, ws: input.ws, msrp: input.msrp };
  }
  return respond(p);
}

export function createRestock(input: RestockInput): Promise<Incoming> {
  const p = findProduct(input.sku);
  if (!p) return fail(`Product ${input.sku} not found.`);
  if (db.incoming.some((i) => i.sku === p.sku)) return fail(`${p.name} already has an open restock.`);
  if (input.qty <= 0) return fail('Quantity must be above zero.');
  const isPO = input.mode === 'po';
  if (!isPO) {
    if (input.from === input.dest) return fail('Pick two different warehouses.');
    if (input.qty > p.stock[input.from]) return fail(`Only ${p.stock[input.from]} units at ${WAREHOUSES[input.from].code}.`);
    p.stock[input.from] -= input.qty;
  }
  const incoming: Incoming = {
    sku: p.sku,
    type: isPO ? 'PO' : 'Transfer',
    ref: isPO ? `PO-${db.seq.po++}` : `TR-${String(db.seq.transfer++).padStart(TRANSFER_ID_PAD, '0')}`,
    qty: input.qty,
    warehouse: WAREHOUSES[input.dest].code,
    eta: etaLabel(TODAY, restockTransitDays(input.mode, p.supplier.leadDays)),
    source: isPO ? p.supplier.name : `from ${WAREHOUSES[input.from].code}`,
  };
  db.incoming.push(incoming);
  return respond(incoming);
}

export function receiveIncoming(sku: string): Promise<Product> {
  const idx = db.incoming.findIndex((i) => i.sku === sku);
  const p = findProduct(sku);
  if (idx < 0 || !p) return fail(`No inbound stock for ${sku}.`);
  const [inc] = db.incoming.splice(idx, 1);
  p.stock[WAREHOUSES.findIndex((w) => w.code === inc.warehouse)] += inc.qty;
  return respond(p);
}

/** Peeks at the next purchase-order number, so the dialog can label its button. */
export const getNextPoNumber = (): Promise<string> => respond(`PO-${db.seq.po}`);

export function createPromotion(input: PromotionInput): Promise<Promotion> {
  if (!input.name.trim()) return fail('Give the promotion a name.');
  if (!input.skus.length) return fail('Select at least one product.');
  if (input.pct <= 0) return fail('Discount must be above zero.');
  const promo: Promotion = {
    id: `PR-${String(db.seq.promo++).padStart(ID_PAD, '0')}`,
    name: input.name.trim(),
    pct: input.pct,
    skus: input.skus,
    scopeLabel: input.scopeLabel,
    audience: input.audience,
    start: TODAY_SHORT,
    end: input.end === 'No end date' ? null : input.end,
    stack: input.stack,
    active: true,
  };
  db.promotions.unshift(promo);
  return respond(promo);
}

export function setPromotionActive(id: string, active: boolean): Promise<Promotion> {
  const promo = db.promotions.find((p) => p.id === id);
  if (!promo) return fail(`Promotion ${id} not found.`);
  promo.active = active;
  return respond(promo);
}

export function updateSettings(next: Settings): Promise<Settings> {
  if (!next.company.legalName.trim()) return fail('Enter a legal name.');
  if (!EMAIL_PATTERN.test(next.company.billingEmail)) return fail('Enter a valid billing email.');
  if (next.company.defaultCreditLimit < 0) return fail('Credit limit cannot be negative.');
  const discounts = Object.values(next.tierDiscounts);
  if (discounts.some((d) => d < 0 || d > MAX_TIER_DISCOUNT_PCT)) return fail(`Tier discounts must be between 0% and ${MAX_TIER_DISCOUNT_PCT}%.`);
  db.settings = structuredClone(next);
  return respond(db.settings);
}
