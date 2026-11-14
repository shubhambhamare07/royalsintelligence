import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { PrivateMatchReplay, TurningPoint } from '../../lib/data/types';

interface WinProbTimelineChartProps {
  replay: PrivateMatchReplay;
  currentDeliveryIndex: number;
  onSelectDeliveryIndex: (index: number) => void;
  homeTeamName?: string;
  awayTeamName?: string;
  height?: string | number;
}

export const WinProbTimelineChart: React.FC<WinProbTimelineChartProps> = ({
  replay,
  currentDeliveryIndex,
  onSelectDeliveryIndex,
  homeTeamName = 'Batting Team',
  awayTeamName = 'Bowling Team',
  height = '300px',
}) => {
  const { innings, over, ball, v_bat, summary } = replay;
  const turningPoints = summary?.top_turning_points || [];

  // Map deliveries to data points
  const chartData = useMemo(() => {
    return v_bat.map((v, i) => {
      const inn = innings[i];
      const ov = over[i];
      const bl = ball[i];
      const ballLabel = `I${inn} ${ov}.${bl}`;
      return {
        label: ballLabel,
        index: i,
        v: parseFloat((v * 100).toFixed(1)),
      };
    });
  }, [innings, over, ball, v_bat]);

  // Find index of turning points in the deliveries array
  const turningPointMarkers = useMemo(() => {
    const markers: any[] = [];
    turningPoints.forEach((tp) => {
      // Find matching index in replay
      const idx = innings.findIndex(
        (innVal, i) =>
          innVal === tp.innings && over[i] === tp.over && ball[i] === tp.ball
      );
      if (idx !== -1) {
        markers.push({
          coord: [idx, parseFloat((v_bat[idx] * 100).toFixed(1))],
          symbol: 'diamond',
          symbolSize: 12,
          itemStyle: {
            color: '#E6007E',
            borderColor: '#FFFFFF',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          tooltip: {
            formatter: `Turning Point (I${tp.innings} ${tp.over}.${tp.ball}): &Delta;V = ${(tp.delta_v * 100).toFixed(1)}%`,
          },
        });
      }
    });
    return markers;
  }, [turningPoints, innings, over, ball, v_bat]);

  const currentLabel =
    chartData[currentDeliveryIndex]?.label || `Ball ${currentDeliveryIndex + 1}`;
  const currentVal = chartData[currentDeliveryIndex]?.v ?? 50;

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#14213D',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      formatter: (params: any) => {
        const item = params[0];
        if (!item) return '';
        const idx = item.dataIndex;
        const inn = innings[idx];
        const ov = over[idx];
        const bl = ball[idx];
        const score = replay.score_before[idx] + replay.team_runs[idx];
        const wkts = replay.wkts_before[idx] + (replay.credited_wicket[idx] ? 1 : 0);
        const pb = replay.pressure_band[idx];
        const li = replay.li[idx];

        return `
          <div style="font-weight: 700; margin-bottom: 4px; font-size: 13px; color: #FFFFFF;">
            Innings ${inn} — Over ${ov}.${bl}
          </div>
          <div style="font-family: monospace; font-size: 11px; line-height: 1.6;">
            <div><span style="color: #94A3B8;">Batting Win Prob:</span> <b style="color: #E6007E;">${item.value}%</b></div>
            <div><span style="color: #94A3B8;">Score:</span> <b>${score}/${wkts}</b></div>
            <div><span style="color: #94A3B8;">Leverage Index:</span> <b>${li.toFixed(2)}x</b></div>
            <div><span style="color: #94A3B8;">Pressure Band:</span> <b>${pb}</b></div>
          </div>
          <div style="margin-top: 4px; font-size: 10px; color: #94A3B8;">Click to scrub here</div>
        `;
      },
    },
    grid: {
      top: 30,
      right: 30,
      bottom: 40,
      left: 50,
    },
    xAxis: {
      type: 'category',
      data: chartData.map((d) => d.label),
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: {
        color: '#64748B',
        fontFamily: 'monospace',
        fontSize: 10,
        interval: Math.floor(chartData.length / 10),
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        color: '#64748B',
        fontFamily: 'monospace',
        formatter: '{value}%',
      },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
    },
    series: [
      {
        name: 'Win Probability',
        type: 'line',
        step: 'middle',
        data: chartData.map((d) => d.v),
        smooth: false,
        lineStyle: {
          color: '#E6007E',
          width: 2.5,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(230, 0, 126, 0.25)' },
              { offset: 1, color: 'rgba(230, 0, 126, 0.01)' },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [
            // 50% baseline
            {
              yAxis: 50,
              lineStyle: { color: '#94A3B8', type: 'dashed', width: 1 },
              label: { show: false },
            },
            // Active Scrubber vertical cursor line
            {
              xAxis: currentLabel,
              lineStyle: { color: '#14213D', width: 2, type: 'solid' },
              label: {
                show: true,
                formatter: `Current: ${currentVal}%`,
                position: 'insideEndTop',
                color: '#14213D',
                fontWeight: 'bold',
                fontFamily: 'monospace',
              },
            },
          ],
        },
        markPoint: {
          data: turningPointMarkers,
        },
      },
    ],
  };

  const onChartClick = (params: any) => {
    if (params.dataIndex !== undefined && params.dataIndex >= 0) {
      onSelectDeliveryIndex(params.dataIndex);
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

