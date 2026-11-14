import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface BowlingDistributionChartProps {
  legalBalls: number;
  dots: number;
  fours: number;
  sixes: number;
  height?: string | number;
}

export const BowlingDistributionChart: React.FC<BowlingDistributionChartProps> = ({
  legalBalls,
  dots,
  fours,
  sixes,
  height = '240px',
}) => {
  const boundaries = fours + sixes;
  const singlesAndOthers = Math.max(0, legalBalls - dots - boundaries);

  if (legalBalls === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
        No delivery concession data available.
      </div>
    );
  }

  const data = [
    { value: dots, name: 'Dot Balls (Runs Saved)', itemStyle: { color: '#10B981' } },
    { value: singlesAndOthers, name: 'Singles / Twos Conceded', itemStyle: { color: '#38BDF8' } },
    { value: fours, name: 'Fours Conceded (4)', itemStyle: { color: '#F59E0B' } },
    { value: sixes, name: 'Sixes Conceded (6)', itemStyle: { color: '#E6007E' } },
  ].filter((d) => d.value > 0);

  const option = {
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
        name: 'Concession Breakdown',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: { show: false },
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

