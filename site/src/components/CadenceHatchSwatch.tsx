// The amber hatched swatch that stands for "cadence target prescribed" in the
// chart legend — the same mark WorkoutChart draws as its accent bar. Extracted
// so the hatch <pattern> isn't redefined per legend. Per-instance pattern id
// (useId) so multiple legends on one page don't collide their <defs>.
import { useId } from 'react'
import { CADENCE_HATCH_LINE, CADENCE_HATCH_BG } from './chart-model'

export default function CadenceHatchSwatch({
  width = 14,
  height = 8,
}: {
  width?: number
  height?: number
}) {
  const id = `cadence-hatch-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke={CADENCE_HATCH_LINE} strokeWidth="2" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={CADENCE_HATCH_BG} />
      <rect width={width} height={height} fill={`url(#${id})`} />
    </svg>
  )
}
