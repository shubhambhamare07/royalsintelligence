import React from 'react';

interface PressureStripProps {
  pressureBands: string[];
  innings: number[];
  over: number[];
  ball: number[];
  currentDeliveryIndex: number;
  onSelectDeliveryIndex: (index: number) => void;
  className?: string;
}

export const PressureStrip: React.FC<PressureStripProps> = ({
  pressureBands,
  innings,
  over,
  ball,
  currentDeliveryIndex,
  onSelectDeliveryIndex,
  className = '',
}) => {
  const getBandColor = (band: string) => {
    switch (band) {
      case 'Extreme':
        return '#EF4444'; // Red
      case 'High':
        return '#F59E0B'; // Amber
      case 'Elevated':
        return '#3B82F6'; // Blue
      case 'Normal':
      default:
        return '#CBD5E1'; // Light Slate
    }
  };

  const totalDeliveries = pressureBands.length;

  return (
    <div className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 ${className}`}>
      {/* Header & Legend */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-mono font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Pressure Timeline Strip
        </span>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#CBD5E1]" /> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" /> Elevated
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> Extreme
          </span>
        </div>
      </div>

      {/* Interactive Delivery Strip */}
      <div
        className="w-full h-8 bg-slate-200 rounded overflow-hidden flex relative cursor-pointer select-none"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          const targetIndex = Math.floor(ratio * totalDeliveries);
          onSelectDeliveryIndex(Math.min(targetIndex, totalDeliveries - 1));
        }}
      >
        {pressureBands.map((band, idx) => {
          const inn = innings[idx];
          const ov = over[idx];
          const bl = ball[idx];
          const isCurrent = idx === currentDeliveryIndex;
          const isOverStart = bl === 1;

          return (
            <div
              key={idx}
              className="h-full flex-1 transition-opacity relative group"
              style={{
                backgroundColor: getBandColor(band),
                borderRight: isOverStart ? '1px solid rgba(0,0,0,0.2)' : 'none',
              }}
              title={`I${inn} ${ov}.${bl} — ${band}`}
            />
          );
        })}

        {/* Active Delivery Marker Pin */}
        {totalDeliveries > 0 && (
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-[#14213D] shadow-md border-x border-white pointer-events-none transform -translate-x-1/2 transition-all duration-75"
            style={{
              left: `${((currentDeliveryIndex + 0.5) / totalDeliveries) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Innings / Over indicators underneath */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
        <span>Innings 1 Start</span>
        <span>Middle Overs</span>
        <span>Death Overs</span>
        <span>Innings 2 Finish</span>
      </div>
    </div>
  );
};

