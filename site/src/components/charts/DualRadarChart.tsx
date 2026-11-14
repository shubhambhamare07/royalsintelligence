import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface DualRadarChartProps {
  axes: Array<{ name: string; max: number }>;
  player1Name: string;
  player1Values: number[];
  player2Name: string;
  player2Values: number[];
  player3Name?: string;
  player3Values?: number[];
  height?: string | number;
}

export const DualRadarChart: React.FC<DualRadarChartProps> = ({
  axes,
  player1Name,
  player1Values,
  player2Name,
  player2Values,
  player3Name,
  player3Values,
  height = '340px',
}) => {
  if (!axes || axes.length === 0) {
    return (
      <div className="h-full min-h-[250px] flex items-center justify-center text-xs text-slate-400 font-sans">
        Select players with verified metrics to display radar comparison
      </div>
    );
  }

  const sanitize = (vals?: number[]) =>
    (vals || []).map((v) => (typeof v === 'number' && !isNaN(v) ? Math.min(100, Math.max(0, v)) : 50));

  const seriesData: any[] = [
    {
      value: sanitize(player1Values),
      name: player1Name,
      symbol: 'circle',
      symbolSize: 5,
      itemStyle: { color: '#14213D' },
      lineStyle: { color: '#14213D', width: 2.5 },
      areaStyle: { color: 'rgba(20, 33, 61, 0.20)' },
    },
    {
      value: sanitize(player2Values),
      name: player2Name,
      symbol: 'circle',
      symbolSize: 5,
      itemStyle: { color: '#E6007E' },
      lineStyle: { color: '#E6007E', width: 2.5 },
      areaStyle: { color: 'rgba(230, 0, 126, 0.25)' },
    },
  ];

  if (player3Name && player3Values) {
    seriesData.push({
      value: sanitize(player3Values),
      name: player3Name,
      symbol: 'circle',
      symbolSize: 5,
      itemStyle: { color: '#C6A15B' },
      lineStyle: { color: '#C6A15B', width: 2.5 },
      areaStyle: { color: 'rgba(198, 161, 91, 0.25)' },
    });
  }

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontSize: 12 },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748B', fontSize: 11, fontWeight: 600 },
      itemWidth: 12,
      itemHeight: 8,
    },
    radar: {
      indicator: axes.map((a) => ({ name: a.name, max: a.max || 100 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#14213D',
        fontSize: 11,
        fontWeight: 700,
      },
      splitLine: {
        lineStyle: { color: ['#E2E8F0', '#E2E8F0', '#CBD5E1', '#94A3B8'] },
      },
      splitArea: {
        show: true,
        areaStyle: { color: ['#FFFFFF', '#F8FAFC', '#F1F5F9', 'rgba(226, 232, 240, 0.3)'] },
      },
      axisLine: {
        lineStyle: { color: '#CBD5E1' },
      },
    },
    series: [
      {
        type: 'radar',
        data: seriesData,
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

