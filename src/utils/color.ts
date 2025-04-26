import { TinyColor } from '@ctrl/tinycolor';

export type HsvColor = { h: number; s: number; v: number };

export function hexToHsv(hex: string): HsvColor {
  const tc = new TinyColor(hex);
  const hsv = tc.toHsv();
  return { h: hsv.h, s: hsv.s, v: hsv.v };
}

export function hsvToHex(hsv: HsvColor): string {
  const tc = new TinyColor({ h: hsv.h, s: hsv.s, v: hsv.v });
  return tc.toHexString();
}
