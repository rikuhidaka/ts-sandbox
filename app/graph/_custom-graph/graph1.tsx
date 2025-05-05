'use client';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

export const Graph1 = ({
  data,
  range,
  options: { curve = 'curveMonotoneX' } = {
    curve: 'curveMonotoneX',
  },
}: {
  data: Array<{ date: Date; value: number }>;
  range: readonly [Date, Date];
  options?: {
    /**
     * https://d3js.org/d3-shape/curve#curveCardinalOpen
     */
    curve?: 'curveMonotoneX' | 'curveCardinal.tension(0.8)';
  };
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const curveFactory =
    curve === 'curveMonotoneX' ? d3.curveMonotoneX : d3.curveCardinal.tension(0.8);

  // X軸のスケール設定
  const x = d3
    .scaleUtc()
    .domain(range)
    .range([marginLeft, width - marginRight]);

  // Y軸のスケール設定
  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - marginBottom, marginTop]);

  useEffect(() => {
    if (!ref.current) return;

    // SVG要素の作成
    const svg = d3.create('svg').attr('width', width).attr('height', height);

    // x軸の描画
    svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.utcDay.every(1)) // 1日ごと
          .tickFormat((d) => d3.utcFormat('%-m/%-d')(d as Date)) // ラベルのフォーマット指定
      );

    // y軸の描画
    svg.append('g').attr('transform', `translate(${marginLeft},0)`).call(d3.axisLeft(y));

    // y軸のグリッド線
    svg
      .append('g')
      .attr('class', 'y-grid')
      .selectAll('line')
      .data(y.ticks())
      .join('line')
      .attr('x1', marginLeft)
      .attr('x2', width - marginRight)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#ddd')
      .attr('stroke-dasharray', '6 3'); // 点線にする

    // x軸のグリッド線
    const xTickInterval = d3.utcDay.every(1);
    if (xTickInterval) {
      svg
        .append('g')
        .attr('class', 'x-grid')
        .selectAll('line')
        .data(x.ticks(xTickInterval))
        .join('line')
        .attr('x1', (d) => x(d))
        .attr('x2', (d) => x(d))
        .attr('y1', marginTop)
        .attr('y2', height - marginBottom)
        .attr('stroke', '#eee')
        .attr('stroke-dasharray', '6 3'); // 点線にする
    }

    // グラデーションの定義
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%'); // 縦方向グラデーション

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'steelblue')
      .attr('stop-opacity', 0.4);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'steelblue')
      .attr('stop-opacity', 0); // ← 下に行くほど透明に

    // グラフエリアを塗りつぶす
    const area = d3
      .area<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y0(y(0)) // ← 下限（0をyスケールに通す）
      .y1((d) => y(d.value))
      .curve(curveFactory);

    // グラフエリアの塗りつぶし適用
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'url(#line-gradient)') // ← グラデーションを適用
      .attr('d', area);

    // 折れ線パス生成関数
    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(curveFactory); // 曲線の形状を指定

    // 折れ線描画
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // refに追加してSVGを表示できるようにする
    ref.current.innerHTML = '';
    ref.current.appendChild(svg.node()!);
  }, [ref]);

  return <div ref={ref} />;
};
