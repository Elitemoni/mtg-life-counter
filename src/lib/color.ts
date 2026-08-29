function toHex(value: number) {
  return Math.round(value * 255)
    .toString(16)
    .padStart(2, '0');
}

export function hsvToHex(hue: number, saturation: number, value: number) {
  const chroma = value * saturation;
  const hueSection = ((hue % 360) + 360) % 360 / 60;
  const intermediate = chroma * (1 - Math.abs((hueSection % 2) - 1));
  const offset = value - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSection < 1) [red, green, blue] = [chroma, intermediate, 0];
  else if (hueSection < 2) [red, green, blue] = [intermediate, chroma, 0];
  else if (hueSection < 3) [red, green, blue] = [0, chroma, intermediate];
  else if (hueSection < 4) [red, green, blue] = [0, intermediate, chroma];
  else if (hueSection < 5) [red, green, blue] = [intermediate, 0, chroma];
  else [red, green, blue] = [chroma, 0, intermediate];

  return `#${toHex(red + offset)}${toHex(green + offset)}${toHex(blue + offset)}`.toUpperCase();
}

export function isLightColor(color: string) {
  const normalized = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return false;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const perceivedBrightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return perceivedBrightness >= 165;
}

const HUES = Array.from({ length: 12 }, (_, index) => index * 30);
const COLOR_VARIATIONS = [
  { saturation: 0.42, value: 0.66 },
  { saturation: 0.55, value: 0.62 },
  { saturation: 0.68, value: 0.58 },
  { saturation: 0.8, value: 0.54 },
  { saturation: 0.88, value: 0.46 },
];

export const CUSTOM_COLOR_GRID = [
  ...COLOR_VARIATIONS.map(({ saturation, value }) =>
    HUES.map((hue) => hsvToHex(hue, saturation, value)),
  ),
  Array.from({ length: 12 }, (_, index) => {
    const value = 0.62 - index * 0.038;
    return hsvToHex(0, 0, value);
  }),
];
