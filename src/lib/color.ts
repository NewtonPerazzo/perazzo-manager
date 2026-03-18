function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex: string): string {
  const clean = hex.trim().replace("#", "");
  if (clean.length === 3) {
    return clean
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }
  if (clean.length === 6) {
    return clean;
  }
  return "469536";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => clamp(value, 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixHex(baseHex: string, mixWithHex: string, ratio: number): string {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixWithHex);
  const t = clamp(ratio, 0, 1);

  const r = Math.round(base.r * (1 - t) + mix.r * t);
  const g = Math.round(base.g * (1 - t) + mix.g * t);
  const b = Math.round(base.b * (1 - t) + mix.b * t);

  return rgbToHex(r, g, b);
}

export function buildCatalogTheme(baseColor?: string | null) {
  const primary = baseColor && /^#?[0-9a-fA-F]{3,6}$/.test(baseColor) ? `#${normalizeHex(baseColor)}` : "#469536";

  return {
    primary,
    primarySoft: mixHex(primary, "#ffffff", 0.7),
    primaryDark: mixHex(primary, "#000000", 0.25),
    pageFrom: mixHex(primary, "#000000", 0.92),
    pageTo: mixHex(primary, "#000000", 0.82)
  };
}
