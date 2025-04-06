/**
 * ロジスティック曲線（シグモイド）を 0～1 の間で
 * 0～1 に写すようにスケーリングしたサンプル関数。
 *
 * p0:   基準値（中心）
 * k:    勾配の鋭さを決定するパラメータ
 */
export const logisticBasedCurve = (p: number, p0 = 0.5, k = 10.0) => {
  // シグモイド関数
  const sigma = (x: number) => 1.0 / (1.0 + Math.exp(-x));

  // 0→1 に正規化するため、[sigma(k*(0 - p0)), sigma(k*(1 - p0))] の範囲でスケーリング
  const numerator = sigma(k * (p - p0)) - sigma(k * (0 - p0));
  const denominator = sigma(k * (1 - p0)) - sigma(k * (0 - p0));
  return numerator / denominator;
};
