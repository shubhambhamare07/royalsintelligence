import React from 'react';
import ReactECharts from 'echarts-for-react';
import { GemPlayer, HiddenGemsThresholds } from '../../lib/data/types';

interface GemsQuadrantChartProps {
  gems: GemPlayer[];
  thresholds: HiddenGemsThresholds;
  role: 'batter' | 'bowler';
  selectedPlayerId?: number | string | null;
  onSelectPlayer?: (player: GemPlayer) => void;
  height?: string | number;
}

export const GemsQuadrantChart: React.FC<GemsQuadrantChartProps> = ({
  gems,
  thresholds,
  role,
  selectedPlayerId,
  onSelectPlayer,
  height = '420px',
}) => {
  const medianBalls =
    role === 'batter' ? thresholds.batter_median_balls : thresholds.bowler_median_balls;
  const medianRate =
    role === 'batter' ? thresholds.batter_median_sr : thresholds.bowler_median_econ;
  const rateLabel = role === 'batter' ? 'Strike Rate' : 'Economy Rate (RPO)';

  const scatterData = gems.map((gem) => ({
    name: gem.player_name,
    value: [
      gem.exposure_balls,
      gem.sr_or_econ,
      gem.rating,
      gem.player_name,
      gem,
    ],
    itemStyle: {
      color:
        selectedPlayerId && String(selectedPlayerId) === String(gem.player_id)
          ? '#C6A15B'
          : '#E6007E',
      borderColor: '#FFFFFF',
      borderWidth: 2,
      shadowBlur: 10,
      shadowColor: 'rgba(230, 0, 126, 0.4)',
    },
    symbolSize: Math.max(14, Math.min(28, (gem.rating / 100) * 24)),
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params: any) => {
        const raw = params.value;
        const gem: GemPlayer = raw[4];
        if (!gem) return '';
        return `
          <div style="font-weight: 700; margin-bottom: 4px; font-size: 13px; color: #FFFFFF;">
            ${gem.player_name}
          </div>
          <div style="font-family: monospace; font-size: 11px; line-height: 1.6;">
            <div><span style="color: #94A3B8;">Clutch Rating:</span> <b style="color: #E6007E;">${gem.rating.toFixed(1)}</b> [${gem.rating_ci90[0].toFixed(1)}, ${gem.rating_ci90[1].toFixed(1)}]</div>
            <div><span style="color: #94A3B8;">P(Outperform):</span> <b style="color: #10B981;">${(gem.p_outperform * 100).toFixed(1)}%</b></div>
            <div><span style="color: #94A3B8;">Pressure Deliveries:</span> <b>${gem.exposure_balls}</b> balls</div>
            <div><span style="color: #94A3B8;">${gem.sr_or_econ_label}:</span> <b>${gem.sr_or_econ.toFixed(1)}</b></div>
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #334155; color: #FCD34D;">
              ${gem.low_exposure_flag ? 'Hidden by low sample exposure volume' : 'Hidden by conventional rate filter'}
            </div>
          </div>
        `;
      },
    },
    grid: {
      top: 40,
      right: 40,
      bottom: 50,
      left: 60,
    },
    xAxis: {
      type: 'value',
      name: 'Pressure Deliveries Faced / Bowled',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: '#64748B', fontWeight: 600, fontSize: 11 },
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: { color: '#64748B', fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
    },
    yAxis: {
      type: 'value',
      name: rateLabel,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: '#64748B', fontWeight: 600, fontSize: 11 },
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: { color: '#64748B', fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
    },
    series: [
      {
        type: 'scatter',
        data: scatterData,
        label: {
          show: true,
          formatter: (params: any) => params.value[3],
          position: 'top',
          color: '#1E293B',
          fontWeight: 600,
          fontSize: 11,
          distance: 6,
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: '#94A3B8',
            type: 'dashed',
            width: 1.5,
          },
          data: [
            {
              xAxis: medianBalls,
              label: {
                formatter: `Median Vol: ${medianBalls} balls`,
                position: 'end',
                color: '#64748B',
                fontSize: 10,
              },
            },
            {
              yAxis: medianRate,
              label: {
                formatter: `Median: ${medianRate.toFixed(1)}`,
                position: 'end',
                color: '#64748B',
                fontSize: 10,
              },
            },
          ],
        },
      },
    ],
  };

  const onChartClick = (params: any) => {
    if (params.data && params.data.value && params.data.value[4]) {
      const gem = params.data.value[4] as GemPlayer;
      if (onSelectPlayer) {
        onSelectPlayer(gem);
      }
    }
  };

  return (
    <div className="w-full relative">
      <ReactECharts
        option={option}
        style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
        onEvents={{ click: onChartClick }}
      />
    </div>
  );
};

