import React from 'react';
import ReactECharts from 'echarts-for-react';
import { TransferabilityPoint } from '../../lib/data/types';

interface TransferabilityScatterChartProps {
  points: TransferabilityPoint[];
  role: 'batter' | 'bowler';
  selectedPlayerId?: number | string | null;
  onSelectPlayer?: (point: TransferabilityPoint) => void;
  height?: string | number;
}

export const TransferabilityScatterChart: React.FC<TransferabilityScatterChartProps> = ({
  points,
  role,
  selectedPlayerId,
  onSelectPlayer,
  height = '480px',
}) => {
  if (!points || points.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        No qualified dual-competition data available.
      </div>
    );
  }

  // Calculate medians for quadrant lines
  const iplValues = points.map((p) => p.ipl_value).sort((a, b) => a - b);
  const t20iValues = points.map((p) => p.t20i_value).sort((a, b) => a - b);
  const medianIpl = iplValues[Math.floor(iplValues.length / 2)] || 0.5;
  const medianT20i = t20iValues[Math.floor(t20iValues.length / 2)] || 0.5;

  const roleColor = role === 'batter' ? '#E6007E' : '#3B82F6';

  // Format series data: [ipl_val, t20i_val, exposure_sum, player_name, point_object]
  const scatterData = points.map((p) => ({
    name: p.player_name,
    value: [
      p.ipl_value,
      p.t20i_value,
      p.ipl_exposure + p.t20i_exposure,
      p.player_name,
      p,
    ],
    itemStyle: {
      color:
        selectedPlayerId && String(selectedPlayerId) === String(p.player_id)
          ? '#C6A15B'
          : roleColor,
      borderColor: '#FFFFFF',
      borderWidth: 1.5,
      opacity: 0.85,
    },
    symbolSize: Math.max(8, Math.min(22, Math.sqrt(p.ipl_exposure + p.t20i_exposure) * 0.9)),
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params: any) => {
        const raw = params.value;
        const p: TransferabilityPoint = raw[4];
        if (!p) return '';
        return `
          <div style="font-weight: 700; margin-bottom: 4px; font-size: 13px; color: #FFFFFF;">
            ${p.player_name}
          </div>
          <div style="font-family: monospace; font-size: 11px; line-height: 1.6;">
            <div><span style="color: #94A3B8;">IPL Pressure Value:</span> <b>${p.ipl_value.toFixed(4)}</b> <span style="color: #CBD5E1;">[${p.ipl_ci90[0].toFixed(3)}, ${p.ipl_ci90[1].toFixed(3)}]</span> (${p.ipl_exposure} balls)</div>
            <div><span style="color: #94A3B8;">T20I Pressure Value:</span> <b>${p.t20i_value.toFixed(4)}</b> <span style="color: #CBD5E1;">[${p.t20i_ci90[0].toFixed(3)}, ${p.t20i_ci90[1].toFixed(3)}]</span> (${p.t20i_exposure} balls)</div>
            <div style="margin-top: 4px; color: #C6A15B; font-weight: 600;">
              ${
                p.ipl_value >= medianIpl && p.t20i_value >= medianT20i
                  ? 'Quadrant I: Universal Clutch'
                  : p.ipl_value < medianIpl && p.t20i_value >= medianT20i
                  ? 'Quadrant II: International Specialist'
                  : p.ipl_value < medianIpl && p.t20i_value < medianT20i
                  ? 'Quadrant III: Dual Domain Fragile'
                  : 'Quadrant IV: League Specialist'
              }
            </div>
          </div>
        `;
      },
    },
    grid: {
      top: 40,
      right: 40,
      bottom: 60,
      left: 60,
    },
    xAxis: {
      type: 'value',
      name: 'IPL Pressure Value',
      nameLocation: 'middle',
      nameGap: 32,
      nameTextStyle: { color: '#64748B', fontWeight: 600, fontSize: 12 },
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: { color: '#64748B', fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      min: 0.3,
      max: 0.7,
    },
    yAxis: {
      type: 'value',
      name: 'T20I Pressure Value',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: '#64748B', fontWeight: 600, fontSize: 12 },
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: { color: '#64748B', fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      min: 0.3,
      max: 0.72,
    },
    series: [
      {
        type: 'scatter',
        data: scatterData,
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
              xAxis: medianIpl,
              label: {
                formatter: `IPL Median: ${medianIpl.toFixed(3)}`,
                position: 'end',
                color: '#64748B',
                fontSize: 10,
              },
            },
            {
              yAxis: medianT20i,
              label: {
                formatter: `T20I Median: ${medianT20i.toFixed(3)}`,
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
      const point = params.data.value[4] as TransferabilityPoint;
      if (onSelectPlayer) {
        onSelectPlayer(point);
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
      {/* Corner Quadrant Labels Overlay */}
      <div className="absolute top-2 left-16 text-[10px] font-mono font-bold text-slate-400 uppercase pointer-events-none bg-slate-50/80 px-2 py-0.5 rounded border border-slate-200">
        Q2: International Specialist
      </div>
      <div className="absolute top-2 right-12 text-[10px] font-mono font-bold text-emerald-600 uppercase pointer-events-none bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">
        Q1: Universal Clutch Performer
      </div>
      <div className="absolute bottom-16 left-16 text-[10px] font-mono font-bold text-rose-500 uppercase pointer-events-none bg-rose-50/80 px-2 py-0.5 rounded border border-rose-200">
        Q3: Dual Domain Fragile
      </div>
      <div className="absolute bottom-16 right-12 text-[10px] font-mono font-bold text-amber-600 uppercase pointer-events-none bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200">
        Q4: League Specialist
      </div>
    </div>
  );
};

