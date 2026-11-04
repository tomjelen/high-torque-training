// The key for reading the workout charts. One per section.
// showZones=false (default): amber swatch only — for the always-visible strip.
// showZones=true: amber + all zone swatches on one line, pipe-separated —
// for the expanded explainer where there is room for the full key.
import { ZONE_FILL } from './chart-model'
import CadenceHatchSwatch from './CadenceHatchSwatch'

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-sm flex-shrink-0" style={{ background: color }} />
      {label}
    </span>
  )
}

export default function ChartLegend({ showZones = false }: { showZones?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
      {/* Inline (not flex) without zones, so the description wraps as one
          sentence on narrow screens instead of becoming a second column. */}
      <span className={showZones ? 'flex items-center gap-2' : 'block'}>
        <span className={showZones ? 'contents' : 'inline-block align-middle mr-2'}>
          <CadenceHatchSwatch />
        </span>
        <span className="font-semibold text-slate-300">High-torque block</span>
        {!showZones && (
          <span className="text-slate-400"> — where you drop to the low-cadence target</span>
        )}
      </span>
      {showZones && (
        <>
          <span className="text-slate-600 select-none">|</span>
          <Swatch color={ZONE_FILL[1]} label="Recovery" />
          <Swatch color={ZONE_FILL[2]} label="Endurance" />
          <Swatch color={ZONE_FILL[3]} label="Tempo" />
          <Swatch color={ZONE_FILL[4]} label="Threshold" />
          <Swatch color={ZONE_FILL[5]} label="VO2 Max" />
          <Swatch color={ZONE_FILL[6]} label="Anaerobic" />
        </>
      )}
    </div>
  )
}
