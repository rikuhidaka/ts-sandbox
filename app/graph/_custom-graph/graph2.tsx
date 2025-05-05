'use client';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

export const Graph2 = ({
  data,
  range,
}: {
  data: Array<{ date: Date; value: number }>;
  range: readonly [Date, Date];
}) => {
  const width = 640;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  const ref = useRef<HTMLDivElement>(null);

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

    // 折れ線パス生成関数
    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveCardinal.tension(0.8)); // 曲線の形状を指定

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
