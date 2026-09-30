import type { Customer } from '../../api/types';
import type { BarTone } from '../../components/charts';
import { creditLevel, type CreditLevel } from '../../domain/finance';
import { clampedPct } from '../../domain/format';

const CREDIT_TONE: Record<CreditLevel, BarTone> = { over: 'a300', near: 'a400', ok: 'a600' };

export function creditView(c: Customer) {
  return {
    barPct: clampedPct(c.balance, c.creditLimit),
    usedLabel: Math.round((c.balance / c.creditLimit) * 100) + '%',
    tone: CREDIT_TONE[creditLevel(c)],
  };
}

export function invoiceStatusLabel(status: string, daysLate: number): string {
  return status === 'Overdue' ? `${daysLate}d overdue` : status;
}
