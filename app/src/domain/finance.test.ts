import { describe, expect, it } from 'vitest';
import type { Customer, Invoice } from '../api/types';
import { agingBuckets, creditLevel, customerStatus, invoiceStatus } from './finance';

const invoice = (daysLate: number, paid = false, customerId = 0): Invoice => ({ id: `INV-${daysLate}`, customerId, issued: '', due: '', amount: 100, daysLate, paid, reminded: false });

const customer = (balance: number, creditLimit: number): Customer => ({
  id: 0, name: 'Test', contact: '', city: '', tier: 'Standard', terms: 'Net 30', creditLimit, balance,
  rep: '', ytd: 0, orderCount: 0, since: '', email: '', phone: '', address: '', initials: '',
});

describe('invoiceStatus', () => {
  it('treats paid invoices as Paid even when they were late', () => {
    expect(invoiceStatus(invoice(40, true))).toBe('Paid');
  });

  it('marks late unpaid invoices as Overdue', () => {
    expect(invoiceStatus(invoice(1))).toBe('Overdue');
    expect(invoiceStatus(invoice(0))).toBe('Open');
  });
});

describe('customerStatus', () => {
  it('puts accounts over their limit on hold', () => {
    expect(customerStatus(customer(9200, 8000), [])).toBe('On hold');
  });

  it('flags accounts with an overdue invoice', () => {
    expect(customerStatus(customer(100, 8000), [invoice(5)])).toBe('Overdue');
  });

  it('ignores other accounts’ invoices', () => {
    expect(customerStatus(customer(100, 8000), [invoice(5, false, 3)])).toBe('Good standing');
  });
});

describe('creditLevel', () => {
  it('separates over, near and within limit', () => {
    expect(creditLevel({ balance: 101, creditLimit: 100 })).toBe('over');
    expect(creditLevel({ balance: 90, creditLimit: 100 })).toBe('near');
    expect(creditLevel({ balance: 50, creditLimit: 100 })).toBe('ok');
  });
});

describe('agingBuckets', () => {
  it('sorts unpaid invoices into age buckets and skips paid ones', () => {
    const buckets = agingBuckets([invoice(0), invoice(24), invoice(53), invoice(81), invoice(120), invoice(10, true)]);
    expect(buckets.map((b) => b.count)).toEqual([1, 1, 1, 1, 1]);
  });
});
