import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface BowlingConcessionData {
  player_id?: number;
  bowler_name?: string;
  total_balls?: number;
  dots?: number;
  ones?: number;
  twos?: number;
  threes?: number;
  fours?: number;
  fives?: number;
  sixes?: number;
  wides?: number;
  no_balls?: number;
  wickets?: number;
}

export interface BowlingDistributionChartProps {
  concessions?: BowlingConcessionData | null;
  legalBalls?: number;
  dots?: number;
  fours?: number;
  sixes?: number;
  wickets?: number;
  height?: string | number;
}

export const BowlingDistributionChart: React.FC<BowlingDistributionChartProps> = ({
  concessions,
  legalBalls = 0,
  dots: fallbackDots = 0,
  fours: fallbackFours = 0,
  sixes: fallbackSixes = 0,
  wickets: fallbackWickets = 0,
  height = '270px',
}) => {
  // Use authoritative concessions data if available
  const hasDetailedConcessions = Boolean(
    concessions &&
    ((concessions.dots ?? 0) > 0 ||
      (concessions.ones ?? 0) > 0 ||
      (concessions.fours ?? 0) > 0 ||
      (concessions.total_balls ?? 0) > 0)
  );

  const dots = hasDetailedConcessions ? (concessions!.dots ?? 0) : fallbackDots;
  const ones = hasDetailedConcessions ? (concessions!.ones ?? 0) : 0;
  const twos = hasDetailedConcessions ? (concessions!.twos ?? 0) : 0;
  const threes = hasDetailedConcessions ? (concessions!.threes ?? 0) : 0;
  const fours = hasDetailedConcessions ? (concessions!.fours ?? 0) : fallbackFours;
  const fives = hasDetailedConcessions ? (concessions!.fives ?? 0) : 0;
  const sixes = hasDetailedConcessions ? (concessions!.sixes ?? 0) : fallbackSixes;
  const wides = hasDetailedConcessions ? (concessions!.wides ?? 0) : 0;
  const noBalls = hasDetailedConcessions ? (concessions!.no_balls ?? 0) : 0;
  const wickets = hasDetailedConcessions ? (concessions!.wickets ?? fallbackWickets) : fallbackWickets;

  // Fallback singles if no detailed breakdown available
  const boundaries = fours + sixes;
  const singlesAndOthers = hasDetailedConcessions
    ? 0
    : Math.max(0, legalBalls - dots - boundaries);

  const totalCalculatedBalls = hasDetailedConcessions
    ? dots + ones + twos + threes + fours + fives + sixes + wides + noBalls
    : legalBalls;

  if (totalCalculatedBalls === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
        No delivery concession data available.
      </div>
    );
  }

  // Construct data series
  const data = hasDetailedConcessions
    ? [
        { value: dots, name: 'Dot Balls (0s)', itemStyle: { color: '#10B981' } },
        { value: ones, name: '1s Conceded', itemStyle: { color: '#0EA5E9' } },
        { value: twos, name: '2s Conceded', itemStyle: { color: '#6366F1' } },
        { value: threes, name: '3s Conceded', itemStyle: { color: '#8B5CF6' } },
        { value: fours, name: '4s Conceded (Boundaries)', itemStyle: { color: '#F59E0B' } },
        { value: fives, name: '5s Conceded', itemStyle: { color: '#F97316' } },
        { value: sixes, name: '6s Conceded (Maximums)', itemStyle: { color: '#E6007E' } },
        { value: wides, name: 'Wide Balls', itemStyle: { color: '#64748B' } },
        { value: noBalls, name: 'No Balls', itemStyle: { color: '#EF4444' } },
      ].filter((d) => d.value > 0)
    : [
        { value: dots, name: 'Dot Balls (0s)', itemStyle: { color: '#10B981' } },
        { value: singlesAndOthers, name: 'Singles / Twos Conceded', itemStyle: { color: '#38BDF8' } },
        { value: fours, name: 'Fours Conceded (4)', itemStyle: { color: '#F59E0B' } },
        { value: sixes, name: 'Sixes Conceded (6)', itemStyle: { color: '#E6007E' } },
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
          <div style="font-weight: 700; font-size: 12px; margin-bottom: 2px;">${params.name}</div>
          <div style="font-size: 11px; color: #E2E8F0;">
            <strong>${params.value}</strong> deliveries (${params.percent}%)
          </div>
        `;
      },
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: '#64748B', fontSize: 10, fontWeight: 600 },
      itemWidth: 10,
      itemHeight: 8,
      pageIconColor: '#E6007E',
      pageTextStyle: { color: '#64748B' },
    },
    series: [
      {
        name: 'Delivery Concession Breakdown',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          scale: true,
          scaleSize: 6,
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

  return (
    <div className="space-y-2">
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
      {/* Informative Stats Summary Bar below chart */}
      <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-slate-100 text-center font-sans">
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg py-1 px-1.5">
          <div className="text-[9px] font-semibold text-emerald-700 uppercase">Dot Balls</div>
          <div className="text-xs font-black text-emerald-900 tabular-nums">
            {dots} <span className="text-[9px] font-medium text-emerald-600">({((dots / totalCalculatedBalls) * 100).toFixed(1)}%)</span>
          </div>
        </div>
        <div className="bg-amber-50/70 border border-amber-100 rounded-lg py-1 px-1.5">
          <div className="text-[9px] font-semibold text-amber-700 uppercase">Boundaries</div>
          <div className="text-xs font-black text-amber-900 tabular-nums">
            {fours + sixes} <span className="text-[9px] font-medium text-amber-600">({(((fours + sixes) / totalCalculatedBalls) * 100).toFixed(1)}%)</span>
          </div>
        </div>
        <div className="bg-purple-50/70 border border-purple-100 rounded-lg py-1 px-1.5">
          <div className="text-[9px] font-semibold text-purple-700 uppercase">Wickets</div>
          <div className="text-xs font-black text-purple-900 tabular-nums">
            {wickets > 0 ? wickets : fallbackWickets}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5">
          <div className="text-[9px] font-semibold text-slate-600 uppercase">Total Balls</div>
          <div className="text-xs font-black text-slate-800 tabular-nums">
            {totalCalculatedBalls}
          </div>
        </div>
      </div>
    </div>
  );
};
