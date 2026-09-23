function srgbToLinear(c: number): number {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs: { label: string; fg: string; bg: string; minRequired: number }[] = [
  { label: '#8A8A8A on #0A0A0A (AI Loops Public Text/Metadata)', fg: '#8A8A8A', bg: '#0A0A0A', minRequired: 4.5 },
  { label: '#78716C on #FAFAF9 (Console Muted Text/Labels)', fg: '#78716C', bg: '#FAFAF9', minRequired: 4.5 },
  { label: 'Lead Badge (#44403C on #F5F5F4)', fg: '#44403C', bg: '#F5F5F4', minRequired: 4.5 },
  { label: 'Contacted Badge (#1D4ED8 on #EFF6FF)', fg: '#1D4ED8', bg: '#EFF6FF', minRequired: 4.5 },
  { label: 'Engaged Badge (#7C3AED on #F5F3FF)', fg: '#7C3AED', bg: '#F5F3FF', minRequired: 4.5 },
  { label: 'Partnered Badge (#047857 on #ECFDF5)', fg: '#047857', bg: '#ECFDF5', minRequired: 4.5 },
  { label: 'Champion Badge (#B45309 on #FFFBEB)', fg: '#B45309', bg: '#FFFBEB', minRequired: 4.5 },
  { label: 'Inactive Badge (#BE123C on #FFF1F2)', fg: '#BE123C', bg: '#FFF1F2', minRequired: 4.5 },
];

console.log('=== WCAG Contrast Ratio Analysis ===\n');

for (const pair of pairs) {
  const ratio = getContrastRatio(pair.fg, pair.bg);
  const passesAA = ratio >= pair.minRequired;
  const passesAALarge = ratio >= 3.0;
  console.log(`${pair.label}:`);
  console.log(`  Ratio: ${ratio.toFixed(2)}:1 | Required AA: ${pair.minRequired}:1`);
  console.log(`  Status: ${passesAA ? 'PASS (AA Normal)' : passesAALarge ? 'PASS (AA Large Text Only)' : 'FAIL'}\n`);
}
