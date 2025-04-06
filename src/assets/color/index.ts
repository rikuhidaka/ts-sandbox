import {
  Lab,
  labToXyz,
  linearRgbToXyz,
  linearToSrgb,
  RGB,
  srgbToLinear,
  xyzToLab,
  xyzToLinearRgb,
} from "./function";

/**
 * sRGB -> Lab
 * @param rgb [R, G, B] in [0,255]
 * @returns [L, a, b]
 */
export const sRGBtoLab = (rgb: RGB): Lab => {
  const [rowR, rowG, rowB] = rgb;
  const R = rowR / 255;
  const G = rowG / 255;
  const B = rowB / 255;

  // 1. sRGB -> リニアRGB
  const rLin = srgbToLinear(R);
  const gLin = srgbToLinear(G);
  const bLin = srgbToLinear(B);

  // 2. リニアRGB -> XYZ
  const [x, y, z] = linearRgbToXyz(rLin, gLin, bLin);

  // 3. XYZ -> Lab
  return xyzToLab(x, y, z);
};

/**
 * Lab -> sRGB(0~1)
 * @param lab [L, a, b]
 * @returns [R, G, B] in [0,1]
 */
export const labToSRGB = (lab: Lab): RGB => {
  const [L, a, b] = lab;

  // 1. Lab -> XYZ
  const [X, Y, Z] = labToXyz(L, a, b);

  // 2. XYZ -> リニアRGB
  let [rLin, gLin, bLin] = xyzToLinearRgb(X, Y, Z);

  // 3. リニアRGB -> sRGB
  let R = linearToSrgb(rLin);
  let G = linearToSrgb(gLin);
  let B = linearToSrgb(bLin);

  // 計算誤差で範囲外に出ることがあるのでクリップ
  R = Math.min(Math.max(R, 0), 1) * 255;
  G = Math.min(Math.max(G, 0), 1) * 255;
  B = Math.min(Math.max(B, 0), 1) * 255;

  return [R, G, B];
};
