import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface DismissalBreakdownChartProps {
  dismissals: Record<string, number>;
  height?: string | number;
}

export const DismissalBreakdownChart: React.FC<DismissalBreakdownChartProps> = ({
  dismissals,
  height = '200px',
}) => {
  const entries = Object.entries(dismissals || {}).filter(([_, count]) => count > 0);

  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
        No dismissals recorded.
      </div>
    );
  }

  // Sort descending by count
  entries.sort((a, b) => a[1] - b[1]); // ascending for horizontal bar chart
  const types = entries.map(([type]) => type);
  const counts = entries.map(([_, count]) => count);

  const option = {
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontSize: 12 },
      formatter: (params: any[]) => {
        if (!params || params.length === 0) return '';
        const pt = params[0];
        return `<div class="font-bold text-xs">${pt.name}: ${pt.value} times</div>`;
      },
    },
    grid: {
      left: '3%',
      right: '6%',
      bottom: '5%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#64748B', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
    },
    yAxis: {
      type: 'category',
      data: types,
      axisLabel: { color: '#14213D', fontSize: 11, fontWeight: 600 },
      axisLine: { lineStyle: { color: '#CBD5E1' } },
    },
    series: [
      {
        name: 'Dismissals',
        type: 'bar',
        data: counts,
        barMaxWidth: 16,
        itemStyle: {
          color: '#E6007E',
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
};

