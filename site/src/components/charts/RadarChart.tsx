import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface RadarAxis {
  name: string;
  max: number;
}

export interface RadarChartProps {
  axes: RadarAxis[];
  values: number[];
  playerName?: string;
  populationMedian?: number[];
  height?: string | number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  axes,
  values,
  playerName = 'Player',
  populationMedian = [50, 50, 50, 50, 50, 50],
  height = '300px',
}) => {
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
      },
      splitLine: {
        lineStyle: {
          color: ['#E2E8F0', '#E2E8F0', '#CBD5E1', '#94A3B8'],
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#FFFFFF', '#F8FAFC', '#F1F5F9', 'rgba(226, 232, 240, 0.3)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: '#CBD5E1',
        },
      },
    },
    series: [
      {
        name: 'Pressure DNA',
        type: 'radar',
        data: [
          {
            value: populationMedian,
            name: 'Cohort Median (50th %ile)',
            symbol: 'none',
            lineStyle: {
              color: '#94A3B8',
              type: 'dashed',
              width: 1.5,
            },
            areaStyle: {
              color: 'transparent',
            },
          },
          {
            value: values,
            name: playerName,
            symbol: 'circle',
            symbolSize: 5,
            itemStyle: {
              color: '#E6007E',
            },
            lineStyle: {
              color: '#E6007E',
              width: 2.5,
            },
            areaStyle: {
              color: 'rgba(230, 0, 126, 0.25)',
            },
          },
        ],
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

