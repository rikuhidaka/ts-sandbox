/**
 * ０から１の範囲で0.01刻みで、指定された関数を評価した結果を配列として返す関数
 */
export const getSamplePoint = ({
  func,
}: {
  func: (x: number) => number;
}): Array<number> =>
  Array.from({ length: 100 }, (_, i) => i / 100).map((p) => func(p));
