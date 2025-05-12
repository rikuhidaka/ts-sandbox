'use client';
import * as d3 from 'd3';
import { utcFormat } from 'd3';
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
  data: Array<{ data: Array<{ date: Date; value: number }>; color: string }>;
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

    const axisColor = '#3A70E2';

    // x軸の描画
    svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.utcDay.every(1)) // 1日ごと
          .tickFormat((d) => d3.utcFormat('%-m/%-d')(d as Date)) // ラベルのフォーマット指定
      )
      .call((g) =>
        g
          .selectAll('path') // 軸線
          .attr('stroke', axisColor)
      )
      .call((g) =>
        g
          .selectAll('line') // 目盛り線
          .attr('stroke', axisColor)
      )
      .call((g) =>
        g
          .selectAll('text') // 目盛りラベル
          .attr('fill', axisColor)
      );

    // y軸の描画
    svg
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call((g) =>
        g
          .selectAll('path') // 軸線
          .attr('stroke', axisColor)
      )
      .call((g) =>
        g
          .selectAll('line') // 目盛り線
          .attr('stroke', axisColor)
      )
      .call((g) =>
        g
          .selectAll('text') // 目盛りラベル
          .attr('fill', axisColor)
      );

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
      .attr('stroke', axisColor)
      .attr('opacity', 0.4) // グリッド線の透明度
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
        .attr('stroke', axisColor)
        .attr('opacity', 0.4) // グリッド線の透明度
        .attr('stroke-dasharray', '6 3'); // 点線にする
    }

    // グラフエリアを塗りつぶす
    const area = d3
      .area<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y0(y(0)) // ← 下限（0をyスケールに通す）
      .y1((d) => y(d.value))
      .curve(curveFactory);

    const lineMap: Record<
      string,
      d3.Selection<SVGPathElement, { date: Date; value: number }[], null, undefined>
    > = {};

    // グラフエリアの塗りつぶし適用
    data.map((d) => {
      svg
        .append('path')
        .datum(d.data)
        .attr('fill', `url(#line-gradient-${d.color})`) // ← グラデーションを適用
        .attr('d', area)
        .style('display', 'none');

      // 折れ線パス生成関数
      const line = d3
        .line<{ date: Date; value: number }>()
        .x((d) => x(d.date))
        .y((d) => y(d.value))
        .curve(curveFactory); // 曲線の形状を指定

      // 折れ線描画
      const lineSvg = svg
        .append('path')
        .datum(d.data)
        .attr('fill', 'none')
        .attr('stroke', d.color)
        .attr('stroke-width', 4)
        .attr('d', line)
        .on('mouseenter', () => {
          d3.select(`[fill="url(#line-gradient-${d.color})"]`).style('display', 'block');
        })
        .on('mouseleave', () => {
          d3.select(`[fill="url(#line-gradient-${d.color})"]`).style('display', 'none');
          pointer.style('display', 'none');
          tooltip.style('display', 'none');
          data.forEach((series) => lineMap[series.color].attr('opacity', 1));
        })
        .on('mousemove', (event) => {
          data.forEach((series) => {
            if (series.color === d.color) {
              lineMap[series.color].attr('opacity', 1);
              lineMap[series.color].raise();
            } else {
              lineMap[series.color].attr('opacity', 0.4);
            }
          });

          const [mx] = d3.pointer(event);

          const closest = d.data.reduce((a, b) =>
            Math.abs(x(b.date) - mx) < Math.abs(x(a.date) - mx) ? b : a
          );
          const cx = x(closest.date);
          const cy = y(closest.value);

          pointer.attr('cx', cx).attr('cy', cy).style('display', 'block').raise();

          const tooltipX =
            cx + 10 + tooltipWidth > width - marginRight
              ? cx - tooltipWidth - 10 // ← 右端なら左に出す
              : cx + 10;

          // ポップアップ表示（位置調整含む）
          tooltip
            .attr('transform', `translate(${tooltipX}, ${cy + 10})`)
            .style('display', 'block')
            .raise();

          tooltipText
            .selectAll('tspan')
            .data([utcFormat('%Y/%m/%d')(closest.date), closest.value])
            .join('tspan')
            .attr('x', 5)
            .attr('dy', (d, i) => (i === 0 ? '0' : '1.8em'))
            .text((d) => d); // ← 表示内容を更新
        });

      const tooltipWidth = 90;
      const tooltipHeight = 48;

      // focusされた際の表示
      const pointer = svg
        .append('circle')
        .attr('r', 8) // 外径
        .attr('stroke', d.color) // ドーナツの色
        .attr('stroke-width', 3)
        .attr('fill', '#fff') // ドーナツの内側の色
        .style('pointer-events', 'none')
        .style('display', 'none');

      // ポップアップ用のグループ（非表示）
      const tooltip = svg.append('g').style('display', 'none').style('pointer-events', 'none');

      tooltip
        .append('rect')
        .attr('fill', '#fff')
        .attr('fill-opacity', 0.8)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('width', tooltipWidth)
        .attr('height', tooltipHeight);

      const tooltipText = tooltip
        .append('text')
        .attr('x', 5)
        .attr('y', 16)
        .attr('font-size', '12px')
        .attr('fill', '#333');

      // グラデーションの定義
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', `line-gradient-${d.color}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%'); // 縦方向グラデーション

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d.color)
        .attr('stop-opacity', 0.4);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.color)
        .attr('stop-opacity', 0); // ← 下に行くほど透明に

      lineMap[d.color] = lineSvg;
    });

    // refに追加してSVGを表示できるようにする
    ref.current.innerHTML = '';
    ref.current.appendChild(svg.node()!);
  }, [ref]);

  return (
    <div>
      <div ref={ref} />
    </div>
  );
};
