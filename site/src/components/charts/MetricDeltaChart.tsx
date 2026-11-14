import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface DeltaMetric {
  name: string;
  deltaPct: number; // positive favors player 1, negative favors player 2
  val1: string;
  val2: string;
}

export interface MetricDeltaChartProps {
  metrics: DeltaMetric[];
  player1Name: string;
  player2Name: string;
  height?: string | number;
}

export const MetricDeltaChart: React.FC<MetricDeltaChartProps> = ({
  metrics,
  player1Name,
  player2Name,
  height = '280px',
}) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="h-full min-h-[250px] flex items-center justify-center text-xs text-slate-400 font-sans">
        Select players to display relative advantage metrics
      </div>
    );
  }

  const categories = metrics.map((m) => m.name);
  const values = metrics.map((m) => m.deltaPct);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontSize: 12 },
      formatter: (params: any[]) => {
        const idx = params[0].dataIndex;
        const m = metrics[idx];
        return `
          <div class="font-bold text-xs mb-1">${m.name}</div>
          <div class="text-[11px] text-[#14213D] bg-white/90 px-1.5 py-0.5 rounded font-semibold mb-1">
            ${player1Name}: <span class="font-sans tabular-nums">${m.val1}</span>
          </div>
          <div class="text-[11px] text-[#E6007E] bg-white/90 px-1.5 py-0.5 rounded font-semibold">
            ${player2Name}: <span class="font-sans tabular-nums">${m.val2}</span>
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        formatter: (val: number) => `${Math.abs(val)}%`,
      },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
    },
    yAxis: {
      type: 'category',
      data: categories,
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
        name: 'Advantage',
        type: 'bar',
        data: values,
        itemStyle: {
          color: (param: any) => (param.value >= 0 ? '#14213D' : '#E6007E'),
          borderRadius: 4,
        },
        label: {
          show: true,
          position: (param: any) => (param.value >= 0 ? 'right' : 'left'),
          formatter: (param: any) => `${Math.abs(param.value)}%`,
          fontSize: 10,
          fontFamily: 'monospace',
          color: '#64748B',
        },
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

