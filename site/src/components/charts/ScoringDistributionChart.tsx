import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface ScoringDistributionChartProps {
  dots: number;
  singles: number;
  twos: number;
  threes: number;
  fours: number;
  sixes: number;
  height?: string | number;
}

export const ScoringDistributionChart: React.FC<ScoringDistributionChartProps> = ({
  dots,
  singles,
  twos,
  threes,
  fours,
  sixes,
  height = '240px',
}) => {
  const total = dots + singles + twos + threes + fours + sixes;

  if (total === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
        No delivery scoring distribution data available.
      </div>
    );
  }

  const data = [
    { value: dots, name: 'Dot Balls (0)', itemStyle: { color: '#94A3B8' } },
    { value: singles, name: 'Singles (1)', itemStyle: { color: '#38BDF8' } },
    { value: twos, name: 'Twos (2)', itemStyle: { color: '#818CF8' } },
    { value: threes, name: 'Threes (3)', itemStyle: { color: '#C084FC' } },
    { value: fours, name: 'Fours (4)', itemStyle: { color: '#F59E0B' } },
    { value: sixes, name: 'Sixes (6)', itemStyle: { color: '#E6007E' } },
  ].filter((d) => d.value > 0);

  const option = {
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontSize: 12 },
      formatter: (params: any) => {
        return `
          <div class="font-bold text-xs">${params.name}</div>
          <div class="text-[11px] text-slate-300">${params.value} balls (${params.percent}%)</div>
        `;
      },
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: '#64748B', fontSize: 10, fontWeight: 600 },
      itemWidth: 10,
      itemHeight: 8,
    },
    series: [
      {
        name: 'Scoring Breakdown',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%',
          },
        },
        data,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
};

