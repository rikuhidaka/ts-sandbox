/**
 * sRGB(0.0~1.0) <-> Lab 変換用 関数群
 *
 * 1) sRGB -> Lab:
 *    - ガンマ補正を除去しリニアRGBへ
 *    - リニアRGBからXYZへ
 *    - XYZからLabへ
 *
 * 2) Lab -> sRGB:
 *    - LabからXYZへ
 *    - XYZからリニアRGBへ
 *    - リニアRGBへガンマ補正をかけ、sRGBへ
 *
 * 参照白色: D65 (Xn=0.95047, Yn=1.00000, Zn=1.08883)
 * 数値はCIEやsRGB規格の定義に基づく。
 */

export type RGB = [number, number, number]; // 0~1.0の範囲
export type Lab = [number, number, number]; // L, a, b

// --------------------------------
// 定数
// --------------------------------
const EPSILON = 216 / 24389; // (6/29)^3 ~= 0.008856
const KAPPA = 24389 / 27; // 903.3...
const Xn = 0.95047;
const Yn = 1.0;
const Zn = 1.08883;

// sRGB -> リニアRGB のガンマ補正の閾値
const SRGB_THRESHOLD = 0.04045;

// --------------------------------
// 1. sRGB -> Lab
// --------------------------------

/**
 * sRGB(0~1) -> リニアRGB(0~1)
 * ガンマ補正を取り除く
 */
export const srgbToLinear = (v: number): number => {
  return v <= SRGB_THRESHOLD ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

/**
 * リニアRGB -> XYZ
 * sRGB規格(D65)前提の変換行列
 */
export const linearRgbToXyz = (
  rLin: number,
  gLin: number,
  bLin: number
): [number, number, number] => {
  // 参考行列 (https://en.wikipedia.org/wiki/SRGB)
  const x = rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805;
  const y = rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722;
  const z = rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505;
  return [x, y, z];
};

/**
 * XYZ -> Lab
 * CIE 1976 (L*a*b*) の公式
 */
export const xyzToLab = (x: number, y: number, z: number): Lab => {
  // 白色点で正規化
  let xr = x / Xn;
  let yr = y / Yn;
  let zr = z / Zn;

  // f(t) の計算
  const fx = fLab(xr);
  const fy = fLab(yr);
  const fz = fLab(zr);

  // L, a, b の最終計算
  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
};

/**
 * Lab変換用の補助関数 f(t)
 * t > 0
 */
export const fLab = (t: number): number => {
  return t > EPSILON
    ? Math.cbrt(t) // t^(1/3)
    : (t * KAPPA + 16) / 116;
};

// --------------------------------
// 2. Lab -> sRGB
// --------------------------------

/**
 * Lab -> XYZ
 */
export const labToXyz = (
  L: number,
  a: number,
  b: number
): [number, number, number] => {
  // 逆変換のため、まず fy, fx, fz を求める
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;

  // それぞれを inv_fLab
  const xr = invFLab(fx);
  const yr = invFLab(fy);
  const zr = invFLab(fz);

  // 白色点を掛けてXYZ空間へ
  const X = xr * Xn;
  const Y = yr * Yn;
  const Z = zr * Zn;

  return [X, Y, Z];
};

/**
 * fLabの逆関数
 */
const invFLab = (f: number): number => {
  const f3 = f * f * f;
  return f3 > EPSILON ? f3 : (116 * f - 16) / KAPPA;
};

/**
 * XYZ -> リニアRGB
 */
export const xyzToLinearRgb = (
  x: number,
  y: number,
  z: number
): [number, number, number] => {
  // sRGB規格(D65)での逆行列
  const rLin = 3.2406 * x - 1.5372 * y - 0.4986 * z;
  const gLin = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  const bLin = 0.0557 * x - 0.204 * y + 1.057 * z;
  return [rLin, gLin, bLin];
};

/**
 * リニアRGB -> sRGB (ガンマ補正)
 */
export const linearToSrgb = (v: number): number => {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055;
};
