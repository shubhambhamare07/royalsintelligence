import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface PhaseSplitData {
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface BowlingPhaseChartProps {
  phaseSplits?: {
    powerplay?: PhaseSplitData;
    middle?: PhaseSplitData;
    death?: PhaseSplitData;
  };
  height?: string | number;
}

export const BowlingPhaseChart: React.FC<BowlingPhaseChartProps> = ({
  phaseSplits,
  height = '240px',
}) => {
  if (!phaseSplits || (!phaseSplits.powerplay && !phaseSplits.middle && !phaseSplits.death)) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
        No phase split data available.
      </div>
    );
  }

  const phases = ['Powerplay (Overs 1-6)', 'Middle (Overs 7-15)', 'Death (Overs 16-20)'];
  const pp = phaseSplits.powerplay || { overs: 0, wickets: 0, runs: 0, economy: 0 };
  const mid = phaseSplits.middle || { overs: 0, wickets: 0, runs: 0, economy: 0 };
  const dth = phaseSplits.death || { overs: 0, wickets: 0, runs: 0, economy: 0 };

  const overs = [pp.overs, mid.overs, dth.overs];
  const wickets = [pp.wickets, mid.wickets, dth.wickets];
  const economies = [pp.economy, mid.economy, dth.economy];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontSize: 12 },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748B', fontSize: 10, fontWeight: 600 },
      itemWidth: 10,
      itemHeight: 8,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: phases,
      axisLabel: { color: '#14213D', fontSize: 10, fontWeight: 600 },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Wickets',
        nameTextStyle: { color: '#64748B', fontSize: 10 },
        axisLabel: { color: '#64748B', fontSize: 10 },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
      },
      {
        type: 'value',
        name: 'Economy Rate (rpo)',
        nameTextStyle: { color: '#64748B', fontSize: 10 },
        axisLabel: { color: '#64748B', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Wickets',
        type: 'bar',
        data: wickets,
        barMaxWidth: 20,
        itemStyle: {
          color: '#14213D',
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Economy',
        type: 'line',
        yAxisIndex: 1,
        data: economies,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#E6007E' },
        lineStyle: { color: '#E6007E', width: 2 },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
};

