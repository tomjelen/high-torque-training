// The key for reading the workout charts: what the amber high-torque mark
// means. One per section (Collection + Adaptation panels). Zone colours are
// standard Zwift vocabulary and are intentionally not repeated here.
import CadenceHatchSwatch from './CadenceHatchSwatch'

export default function ChartLegend() {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <CadenceHatchSwatch />
      <span>
        <span className="font-semibold text-slate-300">High-torque block</span>
        {' — where you drop to the low-cadence target'}
      </span>
    </div>
  )
}
