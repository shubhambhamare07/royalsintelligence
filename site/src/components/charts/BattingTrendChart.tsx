import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface BattingMatchPoint {
  date: string;
  runs: number;
  balls: number;
  strikeRate: number;
  matchId?: number;
  competition?: string;
  opponent?: string;
  pressureBalls?: number;
  pressureValue?: number;
}

export interface BattingTrendChartProps {
  data: BattingMatchPoint[];
  height?: string | number;
}

export const BattingTrendChart: React.FC<BattingTrendChartProps> = ({
  data,
  height = '280px',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
        No match-level batting history recorded.
      </div>
    );
  }

  // Sort chronological
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const dates = sorted.map((d) => d.date);
  const runs = sorted.map((d) => d.runs);
  const srs = sorted.map((d) => d.strikeRate);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontSize: 12 },
      formatter: (params: any[]) => {
        if (!params || params.length === 0) return '';
        const idx = params[0].dataIndex;
        const pt = sorted[idx];
        return `
          <div class="font-bold text-xs">${pt.date}</div>
          <div class="text-[11px] text-slate-300">Match #${pt.matchId || '—'} &middot; ${pt.competition || 'T20'} ${pt.opponent ? `vs ${pt.opponent}` : ''}</div>
          <div class="mt-1 pt-1 border-t border-slate-700 font-mono text-xs space-y-0.5">
            <div><span class="text-brand-pink font-bold">Runs:</span> ${pt.runs} (${pt.balls}b)</div>
            <div><span class="text-amber-400 font-bold">Strike Rate:</span> ${pt.strikeRate.toFixed(1)}</div>
            ${pt.pressureBalls ? `<div><span class="text-emerald-400 font-bold">Pressure:</span> ${pt.pressureBalls}b (PV: ${pt.pressureValue && pt.pressureValue > 0 ? '+' : ''}${pt.pressureValue?.toFixed(2)})</div>` : ''}
          </div>
        `;
      },
    },
    legend: {
      top: 0,
      right: 10,
      textStyle: { color: '#64748B', fontSize: 11, fontWeight: 600 },
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        formatter: (val: string) => {
          try {
            const d = new Date(val);
            return `${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(-2)}`;
          } catch {
            return val;
          }
        },
      },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Runs Scored',
        nameTextStyle: { color: '#64748B', fontSize: 10 },
        axisLabel: { color: '#64748B', fontSize: 10 },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
      },
      {
        type: 'value',
        name: 'Strike Rate',
        nameTextStyle: { color: '#64748B', fontSize: 10 },
        axisLabel: { color: '#64748B', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Runs',
        type: 'bar',
        data: runs,
        itemStyle: {
          color: '#14213D',
          borderRadius: [4, 4, 0, 0],
        },
        barMaxWidth: 16,
      },
      {
        name: 'Strike Rate',
        type: 'line',
        yAxisIndex: 1,
        data: srs,
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: '#E6007E' },
        lineStyle: { color: '#E6007E', width: 2 },
        smooth: true,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
};

