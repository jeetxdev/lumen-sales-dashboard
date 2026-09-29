import { useId, useState } from 'react';
import { Check, Eyedropper, Moon, Plus, Sun, UserPlus } from '@phosphor-icons/react';
import { useCustomers, useSettings, useTeam, useUpdateSettings, useWarehouses } from '../api/hooks';
import { COMPANY } from '../api/seed';
import type { PaymentTerms, SettingToggles, Tier } from '../api/types';
import { Seg, SwatchDot, SwitchRow } from '../components/controls';
import { NOT_BUILT } from '../components/tags';
import { money, num } from '../domain/format';
import { PageHeader } from '../layout/PageHeader';
import { accentLabel, PRESET_ACCENTS, type PresetAccent } from '../theme/accent';
import { useTheme } from '../theme/ThemeProvider';

const TERMS: PaymentTerms[] = ['Net 15', 'Net 30', 'Net 45', 'Net 60'];
const MAX_TIER_DISCOUNT = 50;

const CREDIT_TOGGLES: [keyof SettingToggles, string, string][] = [
  ['autohold', 'Auto-hold over limit', 'Hold new orders when balance exceeds credit'],
  ['approve', 'Approve new terms', 'Require finance sign-off on Net 60'],
];

const NOTIFICATION_TOGGLES: [keyof SettingToggles, string, string][] = [
  ['low', 'Low stock alerts', 'When a SKU drops below its reorder point'],
  ['autopo', 'Auto-draft purchase orders', 'Draft a PO at the reorder point for approval'],
  ['overdue', 'Overdue invoices', 'Daily list of accounts past due'],
  ['digest', 'Weekly digest', 'Monday summary to the sales team'],
];

function Appearance() {
  const { theme, setTheme, accent, setAccent, customHex, setCustomHex } = useTheme();
  const note = accent === 'custom' ? `Custom ${customHex.toUpperCase()} · lightness tuned for contrast` : accentLabel(accent);
  return (
    <div className="card elev-sm card--pad card--gap-md">
      <div className="card-title">Appearance</div>
      <div className="field">
        <label>Theme</label>
        <Seg
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'light', label: 'Light', icon: <Sun /> },
            { value: 'dark', label: 'Dark', icon: <Moon /> },
          ]}
        />
      </div>
      <div className="field">
        <label>Accent color</label>
        <div className="swatches">
          {(Object.entries(PRESET_ACCENTS) as [PresetAccent, string][]).map(([key, hex]) => (
            <button key={key} type="button" className="swatch" title={accentLabel(key)} aria-label={accentLabel(key)} aria-pressed={accent === key} onClick={() => setAccent(key)}>
              <SwatchDot hex={hex} selected={accent === key} />
            </button>
          ))}
          <label className="swatch swatch--custom" title="Pick a custom color">
            <SwatchDot hex={customHex} selected={accent === 'custom'} />
            <Eyedropper className="swatch__icon" />
            <input className="swatch__input" type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)} aria-label="Pick a custom color" />
          </label>
        </div>
      </div>
      <div className="preview">
        <button type="button" className="btn btn-primary btn--row">
          Primary
        </button>
        <span className="tag tag-accent">Shipped</span>
        <span className="tag tag-outline">Overdue</span>
        <span className="muted-sm">{note}</span>
      </div>
    </div>
  );
}

function TierInput({ tier, value, onCommit }: { tier: Tier; value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const fixed = tier === 'Standard';
  return (
    <div className="affix affix--tier">
      <input
        className="input input--post"
        type="number"
        min="0"
        max={MAX_TIER_DISCOUNT}
        value={fixed ? '0' : draft}
        disabled={fixed}
        aria-label={`${tier} discount percent`}
        onChange={(e) => {
          setDraft(e.target.value);
          onCommit(Math.max(0, Math.min(MAX_TIER_DISCOUNT, parseFloat(e.target.value) || 0)));
        }}
      />
      <span className="affix__post">%</span>
    </div>
  );
}

function TextField({ label, defaultValue }: { label: string; defaultValue: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" defaultValue={defaultValue} />
    </div>
  );
}

export function Settings() {
  const settings = useSettings();
  const customers = useCustomers();
  const warehouses = useWarehouses();
  const team = useTeam();
  const update = useUpdateSettings();

  const flip = (key: keyof SettingToggles) => update.mutate({ toggles: { ...settings.toggles, [key]: !settings.toggles[key] } });
  const toggleRows = (rows: [keyof SettingToggles, string, string][]) => rows.map(([key, label, sub]) => <SwitchRow key={key} label={label} sub={sub} on={settings.toggles[key]} onToggle={() => flip(key)} />);

  const tiers: [Tier, string][] = [
    ['Standard', 'tag-neutral'],
    ['Silver', 'tag-neutral'],
    ['Gold', 'tag-accent'],
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle="Lumen Goods Wholesale" action={{ label: 'Save', icon: <Check />, onClick: NOT_BUILT }} />
      <section className="grid-settings">
        <Appearance />

        <div className="card elev-sm card--pad card--gap-md">
          <div className="card-title">Company</div>
          <TextField label="Legal name" defaultValue={COMPANY.legalName} />
          <div className="grid-2">
            <TextField label="Tax ID" defaultValue={COMPANY.taxId} />
            <TextField label="Currency" defaultValue={COMPANY.currency} />
          </div>
          <TextField label="Billing email" defaultValue={COMPANY.billingEmail} />
        </div>

        <div className="card elev-sm card--pad card--gap-md">
          <div className="card-title">Credit &amp; terms</div>
          <div className="field">
            <label>Default payment terms</label>
            <Seg label="Default payment terms" value={settings.defaultTerms} onChange={(defaultTerms) => update.mutate({ defaultTerms })} options={TERMS.map((t) => ({ value: t, label: t }))} />
          </div>
          <TextField label="Default credit limit, new accounts" defaultValue={money(COMPANY.defaultCreditLimit)} />
          {toggleRows(CREDIT_TOGGLES)}
        </div>

        <div className="card elev-sm card--pad card--gap-sm">
          <div className="card-title">Price tiers</div>
          <div className="muted-sm">Discount off each product's wholesale list price, applied by account tier at checkout. Set list prices on each product page.</div>
          {tiers.map(([tier, tag]) => {
            const count = customers.filter((c) => c.tier === tier).length;
            return (
              <div key={tier} className="row-center gap-md">
                <span className={`tag ${tag} tier-tag`}>{tier}</span>
                <span className="grow muted-xs-12">
                  {count} accounts{tier === 'Standard' ? ' · list price' : ''}
                </span>
                <TierInput tier={tier} value={tier === 'Standard' ? 0 : settings.tierDiscounts[tier]} onCommit={(v) => tier !== 'Standard' && update.mutate({ tierDiscounts: { ...settings.tierDiscounts, [tier]: v } })} />
              </div>
            );
          })}
        </div>

        <div className="card elev-sm card--pad card--gap-sm">
          <div className="card-head">
            <div className="card-title card-head__title">Warehouses</div>
            <button type="button" className="btn btn-secondary btn--row" onClick={NOT_BUILT}>
              <Plus />
              Add
            </button>
          </div>
          {warehouses.map((w) => (
            <div key={w.code} className="row-center gap-md pad-y-6">
              <span className="tag tag-neutral">{w.code}</span>
              <div className="cell-stack grow">
                <span className="text-14">{w.name}</span>
                <span className="muted-xs-12">{w.city}</span>
              </div>
              <span className="muted-sm">{num(w.capacity)} units cap.</span>
            </div>
          ))}
        </div>

        <div className="card elev-sm card--pad card--gap-sm">
          <div className="card-title">Notifications</div>
          {toggleRows(NOTIFICATION_TOGGLES)}
        </div>

        <div className="card elev-sm card--pad card--gap-sm">
          <div className="card-head">
            <div className="card-title card-head__title">Team</div>
            <button type="button" className="btn btn-secondary btn--row" onClick={NOT_BUILT}>
              <UserPlus />
              Invite
            </button>
          </div>
          {team.map((m) => (
            <div key={m.email} className="row-center gap-md pad-y-4">
              <div className="avatar">{m.name.split(' ').map((w) => w[0]).join('')}</div>
              <div className="cell-stack grow">
                <span className="text-14">{m.name}</span>
                <span className="muted-xs-12">{m.email}</span>
              </div>
              <span className={`tag ${m.role === 'Admin' ? 'tag-accent' : 'tag-neutral'}`}>{m.role}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
