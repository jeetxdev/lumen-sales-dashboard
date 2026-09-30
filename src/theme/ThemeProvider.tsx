import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { customAccentCss, DEFAULT_ACCENT, DEFAULT_CUSTOM_HEX, DEFAULT_THEME, PRESET_ACCENTS, type Accent, type Theme } from './accent';

const STORAGE_KEY = 'lumen.appearance';
const CUSTOM_STYLE_ID = 'custom-accent';

export interface Appearance {
  theme: Theme;
  accent: Accent;
  customHex: string;
}

interface ThemeContextValue extends Appearance {
  /** The stored appearance. The fields above also include an unsaved preview. */
  saved: Appearance;
  preview: Appearance | null;
  toggleTheme: () => void;
  /** Shows an appearance without storing it. Pass null to return to the saved one. */
  setPreview: (appearance: Appearance | null) => void;
  /** Stores an appearance and ends any preview. */
  commit: (appearance: Appearance) => void;
}

export const sameAppearance = (a: Appearance, b: Appearance) => a.theme === b.theme && a.accent === b.accent && a.customHex === b.customHex;

const DEFAULTS: Appearance = { theme: DEFAULT_THEME, accent: DEFAULT_ACCENT, customHex: DEFAULT_CUSTOM_HEX };

function isAccent(value: unknown): value is Accent {
  return value === 'custom' || (typeof value === 'string' && value in PRESET_ACCENTS);
}

// Storage can be missing or blocked, so every read falls back to the defaults.
function loadAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULTS;
    const rec = parsed as Record<string, unknown>;
    return {
      theme: rec.theme === 'dark' ? 'dark' : 'light',
      accent: isAccent(rec.accent) ? rec.accent : DEFAULTS.accent,
      customHex: typeof rec.customHex === 'string' && /^#[0-9a-f]{6}$/i.test(rec.customHex) ? rec.customHex : DEFAULTS.customHex,
    };
  } catch {
    return DEFAULTS;
  }
}

function saveAppearance(value: Appearance) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Preference only lasts for this visit.
  }
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Appearance>(loadAppearance);
  const [preview, setPreview] = useState<Appearance | null>(null);
  const appearance = preview ?? saved;

  useEffect(() => saveAppearance(saved), [saved]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = appearance.theme;
    root.dataset.accent = appearance.accent;
  }, [appearance.theme, appearance.accent]);

  useEffect(() => {
    let el = document.getElementById(CUSTOM_STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = CUSTOM_STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = customAccentCss(appearance.customHex);
  }, [appearance.customHex]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...appearance,
      saved,
      preview,
      // The header toggle stores its choice at once, and it also updates a running preview so the click is visible.
      toggleTheme: () => {
        const theme: Theme = appearance.theme === 'dark' ? 'light' : 'dark';
        setSaved((a) => ({ ...a, theme }));
        setPreview((p) => (p ? { ...p, theme } : p));
      },
      setPreview,
      commit: (next) => {
        setSaved(next);
        setPreview(null);
      },
    }),
    [appearance, saved, preview],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
