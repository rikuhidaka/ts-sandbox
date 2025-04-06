// index.ts
import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import * as fs from 'fs';

/**
 * ロジスティック曲線（シグモイド）を 0～1 の間で
 * 0～1 に写すようにスケーリングしたサンプル関数。
 * 
 * p0:   基準値（中心）
 * k:    勾配の鋭さを決定するパラメータ
 */
function logisticBasedCurve(p: number, p0 = 0.5, k = 10.0): number {
  // シグモイド関数
  const sigma = (x: number) => 1.0 / (1.0 + Math.exp(-x));

  // 0→1 に正規化するため、[sigma(k*(0 - p0)), sigma(k*(1 - p0))] の範囲でスケーリング
  const numerator = sigma(k * (p - p0)) - sigma(k * (0 - p0));
  const denominator = sigma(k * (1 - p0)) - sigma(k * (0 - p0));
  return numerator / denominator;
}

// メイン処理を即時実行関数でまとめる
(async () => {
  // 1) 描画用の ChartJSNodeCanvas インスタンス準備
  const width = 800;    // 画像の幅
  const height = 600;   // 画像の高さ
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  // 2) サンプルデータ生成
  //    0～1 の区間を 101点 (p=0,0.01,0.02,...,1.0)
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    labels.push(p.toFixed(2));
    data.push(logisticBasedCurve(p, 0.5, 10.0));
  }

  // 3) Chart.js の設定を定義
  //    type: 'line' で折れ線グラフにする
  const configuration: ChartConfiguration<'line', number[], string> = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Logistic-Based Curve (p0=0.5, k=10)',
          data,
          // Chart.js オプションいろいろ
          fill: false,          // 塗りつぶしなし
          tension: 0.1,         // 線の滑らかさ
          borderWidth: 2,
        },
      ],
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'p' } },
        y: {
          title: { display: true, text: 'f(p)' },
          min: 0,
          max: 1,
        },
      },
    },
  };

  // 4) グラフを描画し、PNG バイナリを取得
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

  // 5) 出力ファイルに保存
  fs.writeFileSync('output/chart.png', imageBuffer);
  console.log('chart.png を出力しました');
})();
