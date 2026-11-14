import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface TrajectoryPoint {
  date: string;
  pressure_value: number;
  match_id?: number;
  opponent?: string;
  competition?: string;
}

export interface CareerTrajectoryChartProps {
  data: TrajectoryPoint[];
  height?: string | number;
}

export const CareerTrajectoryChart: React.FC<CareerTrajectoryChartProps> = ({
  data,
  height = '280px',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        No match trajectory history recorded.
      </div>
    );
  }

  // Sort chronological
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const dates = sorted.map((d) => d.date);
  const values = sorted.map((d) => parseFloat((d.pressure_value * 100).toFixed(1)));

  // Calculate 5-match rolling mean
  const rollingMeans: Array<number | null> = [];
  for (let i = 0; i < values.length; i++) {
    if (i < 2) {
      rollingMeans.push(values[i]);
    } else {
      const windowSlice = values.slice(Math.max(0, i - 4), i + 1);
      const avg = windowSlice.reduce((acc, v) => acc + v, 0) / windowSlice.length;
      rollingMeans.push(parseFloat(avg.toFixed(1)));
    }
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontSize: 12 },
      formatter: (params: any[]) => {
        if (!params || params.length === 0) return '';
        const pt = params[0];
        const matchData = sorted[pt.dataIndex];
        return `
          <div class="font-bold text-xs">${pt.axisValue}</div>
          <div class="text-[11px] text-slate-300">Match ID: ${matchData.match_id || '—'} (${matchData.competition || 'T20'})</div>
          <div class="mt-1 pt-1 border-t border-slate-700 font-mono text-xs">
            <span class="text-[#E6007E] font-bold">Match PV:</span> ${matchData.pressure_value > 0 ? '+' : ''}${(matchData.pressure_value * 100).toFixed(1)} /100b
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '12%',
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
    yAxis: {
      type: 'value',
      name: 'PV (runs/100b)',
      nameTextStyle: { color: '#64748B', fontSize: 10 },
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        formatter: '{value}',
      },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
    },
    series: [
      {
        name: 'Match PV',
        type: 'scatter',
        data: values,
        itemStyle: {
          color: (param: any) => (param.value >= 0 ? '#10B981' : '#EF4444'),
        },
        symbolSize: 6,
      },
      {
        name: '5-Match Rolling Trend',
        type: 'line',
        smooth: true,
        data: rollingMeans,
        itemStyle: { color: '#E6007E' },
        lineStyle: { width: 2.5, color: '#E6007E' },
        showSymbol: false,
        markLine: {
          symbol: 'none',
          data: [{ yAxis: 0, lineStyle: { color: '#94A3B8', type: 'dashed' } }],
          label: { show: false },
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

