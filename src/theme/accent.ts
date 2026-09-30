export type Theme = 'light' | 'dark';
/** What the user picked. 'system' follows the device's light or dark setting. */
export type ThemePreference = Theme | 'system';
export type PresetAccent = 'teal' | 'azure' | 'emerald' | 'amber' | 'coral' | 'blurple';
export type Accent = PresetAccent | 'custom';

export const PRESET_ACCENTS: Record<PresetAccent, string> = {
  teal: '#06a8a4',
  azure: '#4799d9',
  emerald: '#48a870',
  amber: '#c2832e',
  coral: '#d37364',
  blurple: '#9184d9',
};

export const DEFAULT_THEME: ThemePreference = 'light';
export const DEFAULT_ACCENT: Accent = 'teal';
export const DEFAULT_CUSTOM_HEX = '#d4577f';

// Nocturne's original blurple ramp (100 → 900). Custom ramps borrow its lightness per step.
const REFERENCE_RAMP = ['#f5f4ff', '#e7e5fe', '#d2cefd', '#b5abfc', '#968ae0', '#796cbf', '#5d5294', '#423a6a', '#2b2741'];
const REFERENCE_CHROMA = 0.125;
const ACCENT_LIGHTNESS = 0.645;
const MIN_CHROMA_SCALE = 0.15;
const MAX_CHROMA_SCALE = 1.6;
const GAMUT_STEP = 0.002;
const GAMUT_EPSILON = 0.0005;
const FALLBACK_HEX = '#808080';
// In light mode the ramp flips, and the accent takes step 600 so text on a light ground stays readable.
const LIGHT_ACCENT_STEP_INDEX = 5;

export type Oklch = [l: number, c: number, h: number];

export function hexToOklch(hex: string): Oklch {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(A, B), (Math.atan2(B, A) * 180) / Math.PI];
}

// Reduces chroma until the colour fits in sRGB, so a hue never shifts.
export function oklchToHex(L: number, C: number, H: number): string {
  const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  for (let c = C; c >= 0; c -= GAMUT_STEP) {
    const a = c * Math.cos((H * Math.PI) / 180);
    const b = c * Math.sin((H * Math.PI) / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    if (rgb.every((v) => v >= -GAMUT_EPSILON && v <= 1 + GAMUT_EPSILON)) {
      return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, gamma(v))) * 255).toString(16).padStart(2, '0')).join('');
    }
  }
  return FALLBACK_HEX;
}

export interface AccentRamp {
  accent: string;
  steps: string[];
}

// Keeps the picked hue and relative intensity, but uses Nocturne's lightness per step so contrast holds.
export function buildAccentRamp(hex: string): AccentRamp {
  const [, pickedChroma, hue] = hexToOklch(hex);
  const scale = Math.max(MIN_CHROMA_SCALE, Math.min(MAX_CHROMA_SCALE, pickedChroma / REFERENCE_CHROMA));
  const steps = REFERENCE_RAMP.map((ref) => {
    const [l, c] = hexToOklch(ref);
    return oklchToHex(l, c * scale, hue);
  });
  return { accent: oklchToHex(ACCENT_LIGHTNESS, REFERENCE_CHROMA * scale, hue), steps };
}

function rampDeclarations(accent: string, steps: string[]): string {
  return [`--color-accent:${accent}`, ...steps.map((hex, i) => `--color-accent-${(i + 1) * 100}:${hex}`)].join(';');
}

export function customAccentCss(hex: string): string {
  const { accent, steps } = buildAccentRamp(hex);
  const light = [...steps].reverse();
  return (
    `[data-accent="custom"]{${rampDeclarations(accent, steps)}}` +
    `[data-theme="light"][data-accent="custom"]{${rampDeclarations(steps[LIGHT_ACCENT_STEP_INDEX], light)}}`
  );
}

export function accentLabel(accent: Accent): string {
  return accent[0].toUpperCase() + accent.slice(1);
}
