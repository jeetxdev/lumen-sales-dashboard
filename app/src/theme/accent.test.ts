import { describe, expect, it } from 'vitest';
import { buildAccentRamp, customAccentCss, hexToOklch, oklchToHex } from './accent';

describe('OKLCH conversion', () => {
  it('round-trips an sRGB colour', () => {
    const [l, c, h] = hexToOklch('#06a8a4');
    expect(oklchToHex(l, c, h)).toBe('#06a8a4');
  });
});

describe('buildAccentRamp', () => {
  it('matches the lightness of Nocturne’s ramp for any picked colour', () => {
    const light = buildAccentRamp('#fff2a8');
    const dark = buildAccentRamp('#101c3c');
    light.steps.forEach((hex, i) => {
      expect(hexToOklch(hex)[0]).toBeCloseTo(hexToOklch(dark.steps[i])[0], 1);
    });
  });

  it('keeps the picked hue', () => {
    const [, , hue] = hexToOklch('#d4577f');
    const [, , rampHue] = hexToOklch(buildAccentRamp('#d4577f').steps[4]);
    expect(Math.abs(rampHue - hue)).toBeLessThan(3);
  });
});

describe('customAccentCss', () => {
  it('writes dark and light rules for the custom accent', () => {
    const css = customAccentCss('#d4577f');
    expect(css).toContain('[data-accent="custom"]{--color-accent:');
    expect(css).toContain('[data-theme="light"][data-accent="custom"]');
  });
});
