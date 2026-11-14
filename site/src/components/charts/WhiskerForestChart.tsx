import React from 'react';
import ReactECharts from 'echarts-for-react';
import { RankedPlayer } from '../../lib/data/types';

export interface WhiskerForestChartProps {
  players: RankedPlayer[];
  height?: string | number;
}

export const WhiskerForestChart: React.FC<WhiskerForestChartProps> = ({
  players,
  height = '340px',
}) => {
  // Take top 10 or provided slice
  const sample = players.slice(0, 10).reverse(); // Reverse for top-down display
  const names = sample.map((p) => `#${p.rank} ${p.player_name}`);

  // Custom render item for error bar whiskers
  const renderItem = (params: any, api: any) => {
    const xValue = api.value(0);
    const highPoint = api.coord([api.value(1), api.value(2)]);
    const lowPoint = api.coord([api.value(0), api.value(2)]);
    const centerPoint = api.coord([xValue, api.value(2)]);

    const halfHeight = 4;

    return {
      type: 'group',
      children: [
        {
          type: 'line',
          transition: ['shape'],
          shape: {
            x1: lowPoint[0],
            y1: lowPoint[1],
            x2: highPoint[0],
            y2: highPoint[1],
          },
          style: api.style({
            stroke: '#E6007E',
            lineWidth: 2,
          }),
        },
        {
          type: 'line',
          shape: {
            x1: lowPoint[0],
            y1: lowPoint[1] - halfHeight,
            x2: lowPoint[0],
            y2: lowPoint[1] + halfHeight,
          },
          style: api.style({ stroke: '#E6007E', lineWidth: 1.5 }),
        },
        {
          type: 'line',
          shape: {
            x1: highPoint[0],
            y1: highPoint[1] - halfHeight,
            x2: highPoint[0],
            y2: highPoint[1] + halfHeight,
          },
          style: api.style({ stroke: '#E6007E', lineWidth: 1.5 }),
        },
      ],
    };
  };

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontSize: 12 },
      formatter: (params: any) => {
        const p = sample[params.dataIndex];
        return `
          <div class="font-bold text-xs">${p.player_name} (Rank #${p.rank})</div>
          <div class="text-[#E6007E] font-mono text-xs font-bold mt-1">Rating: ${p.rating.toFixed(2)}</div>
          <div class="text-slate-300 font-mono text-[11px]">90% CI: [${p.rating_ci90[0].toFixed(2)}, ${p.rating_ci90[1].toFixed(2)}]</div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '6%',
      top: '5%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      min: 60,
      max: 100,
      axisLabel: { color: '#64748B', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        color: '#14213D',
        fontSize: 11,
        fontWeight: 600,
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'scatter',
        data: sample.map((p) => p.rating),
        symbolSize: 8,
        itemStyle: { color: '#14213D' },
        z: 3,
      },
      {
        type: 'custom',
        renderItem: renderItem,
        dimensions: ['low', 'high', 'category'],
        encode: {
          x: [0, 1],
          y: 2,
        },
        data: sample.map((p, idx) => [p.rating_ci90[0], p.rating_ci90[1], idx]),
        z: 2,
      },
    ],
  };

  return (
    <div style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

