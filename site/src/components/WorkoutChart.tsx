// WorkoutChart — renders one workout as a power profile with an amber
// hatched rule marking where a cadence (high-torque) target is prescribed.
// Ported from site-specification/Workout-visualizations/workout-chart.jsx.
// Absence of the amber rule means "nothing prescribed here", NOT "free
// cadence" — see documentation/workout-chart.md for the load-bearing
// requirements behind this and the clustering behaviour below.
import { useId } from 'react'
import {
  ZONE_FILL,
  RAMP_FILL,
  CADENCE_HATCH_LINE,
  CADENCE_HATCH_BG,
  type ChartBlock,
  type ChartWorkout,
} from './chart-model'
import { buildClusters, type LaidOutBlock } from './chart-clustering'

// Vertical scale: power as a fraction of FTP maps to a bar-top y. Clamped at
// POWER_TO_TOP so a maximal sprint (~150% FTP) stays the tallest bar without
// blowing out the scale — the exact ceiling is tuning, not contract.
const FTP_BASELINE_Y = 80
const POWER_TO_TOP = 1.3

// Cadence accent strip geometry (below the FTP baseline).
const ACCENT_Y = 82
// Full mode renders close to its design width so 8px is visible. Minimal mode
// is CSS-scaled down to card size (~250px), making 8px effectively invisible;
// 16px at design width renders to ~6px in the card — clearly legible.
const ACCENT_H_FULL = 8
const ACCENT_H_MINIMAL = 16

// Block separation is a background gap on each block's right edge. Blocks
// narrower than the minimum keep full width (dense sprint sets, which read
// as one unit via the accent strip anyway).
const BLOCK_GAP_PX = 2
const MIN_WIDTH_FOR_GAP_PX = 3

function yForPower(pct: number): number {
  const t = Math.min(pct, POWER_TO_TOP) / POWER_TO_TOP
  return FTP_BASELINE_Y - t * FTP_BASELINE_Y
}

function totalDuration(blocks: ChartBlock[]): number {
  return blocks.reduce((s, b) => s + b.dur, 0)
}

export interface WorkoutChartProps {
  workout: ChartWorkout
  mode?: 'minimal' | 'full'
  width?: number
  axisGutter?: number
  clusterThresholdPx?: number
  showAxisLabels?: boolean
}

export default function WorkoutChart({
  workout,
  mode = 'minimal',
  width = 540,
  axisGutter,
  clusterThresholdPx,
  showAxisLabels = true,
}: WorkoutChartProps) {
  // Per-instance ids for the hatch <pattern> and the <title>. Generated
  // internally (not a prop) so multiple charts on one page can't collide
  // their <defs> and cross-wire each other's cadence fill.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const hatchId = `htq-hatch-${uid}`
  const titleId = `htq-title-${uid}`
  // Narrow-width adjustments (mobile): drop axis labels and bump the
  // clustering threshold so sprint sets still merge at smaller pixel scale.
  const isNarrow = width < 380
  const axisLabels = isNarrow ? false : showAxisLabels
  const gutter = axisGutter ?? (axisLabels ? 36 : 6)
  const threshold = clusterThresholdPx ?? (isNarrow ? 8 : 20)

  const total = totalDuration(workout.blocks)
  const pxPerSec = width / total

  // Layout pass: compute x/w for each block.
  let cursor = 0
  const layout: LaidOutBlock[] = workout.blocks.map((b) => {
    const w = b.dur * pxPerSec
    const g = { x: cursor, w, b }
    cursor += w
    return g
  })

  // Build cadence cluster bars.
  const clusters = buildClusters(workout.blocks, layout, threshold)

  const accentH = mode === 'minimal' ? ACCENT_H_MINIMAL : ACCENT_H_FULL
  const chartGroupH = ACCENT_Y + accentH + 2 // chart area + accent strip + pad
  const phaseLabelH = mode === 'full' ? 18 : 0
  // Minimal mode is meant to be embedded inside a row that already shows the
  // workout title + cadence; the chart suppresses its own header to avoid
  // duplication. Full mode (standalone reference) keeps the header.
  const showHeader = mode === 'full'
  const headerH = showHeader ? 22 : 0
  const svgH = headerH + chartGroupH + phaseLabelH + 6
  const svgW = gutter + width + gutter

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      // Scale to the host container: the viewBox fixes the coordinate system
      // (so clustering and layout are computed at a stable design width — see
      // `width`), while CSS shrinks the drawing to fit a narrower card. Capped
      // at the natural width so it never upscales blurry on a wide container.
      style={{ display: 'block', width: '100%', height: 'auto', maxWidth: svgW }}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        {/* req-3: absence of a cadence prescription carries NO claim — never
            say "free". Omit the cadence clause entirely when none is set. */}
        {workout.cadenceLabel
          ? `${workout.title} power profile, high-torque target ${workout.cadenceLabel}`
          : `${workout.title} power profile`}
      </title>

      <defs>
        <pattern
          id={hatchId}
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke={CADENCE_HATCH_LINE} strokeWidth="2" />
        </pattern>
      </defs>

      {/* Header — only in full mode (minimal mode delegates to the host row) */}
      {showHeader && (
        <g>
          <text
            x="0"
            y="13"
            fontSize="13"
            fontWeight="500"
            fill="var(--color-text-primary)"
          >
            {workout.title}
            {workout.subtitle ? ` — ${workout.subtitle}` : ''}
          </text>
          {workout.cadenceLabel && (
            <text
              x={svgW}
              y="13"
              fontSize="12"
              textAnchor="end"
              fill="var(--color-text-secondary)"
            >
              Target: {workout.cadenceLabel}
            </text>
          )}
        </g>
      )}

      <g transform={`translate(${gutter}, ${headerH})`}>
        {/* FTP baseline */}
        <line
          x1="0"
          y1={FTP_BASELINE_Y}
          x2={width}
          y2={FTP_BASELINE_Y}
          stroke="var(--color-border-tertiary)"
          strokeWidth="0.5"
        />

        {/* Axis labels */}
        {axisLabels && (
          <g>
            <text
              x="-10"
              y="8"
              fontSize="11"
              textAnchor="end"
              fill="var(--color-text-tertiary)"
            >
              100%
            </text>
            <text
              x="-10"
              y={FTP_BASELINE_Y + 4}
              fontSize="11"
              textAnchor="end"
              fill="var(--color-text-tertiary)"
            >
              FTP
            </text>
          </g>
        )}

        {/* Power blocks. Separation between adjacent blocks is a pure-geometry
            gap: each block is drawn ~2px narrower on its right so the card
            background shows through. No stroke — strokes antialias and bleed
            over neighbours at fractional coords. The last block keeps full
            width so the chart still ends exactly at `width`, and the gap is
            skipped for blocks too thin to spare it (dense sprint sets, which
            read as one unit via the accent strip anyway). `layout` is left
            untouched, so clustering and the continuous accent bars are
            unaffected.

            Ramps (warmup / cooldown) are always drawn neutral grey, NOT
            zone-coloured: a ramp sweeps across several power zones, so any
            single zone fill would be arbitrary and would make warmup and
            cooldown look like different things when they are the same kind
            of thing. This is intentional and M2's .zwo parser must keep it:
            do not assign warmup/cooldown a "real" zone for fill purposes. */}
        {layout.map(({ x, w, b }, i) => {
          const isLast = i === layout.length - 1
          const drawW =
            !isLast && w > MIN_WIDTH_FOR_GAP_PX ? w - BLOCK_GAP_PX : w
          if (b.kind === 'ramp') {
            const yFrom = yForPower(b.fromPower)
            const yTo = yForPower(b.toPower)
            return (
              <path
                key={i}
                d={`M ${x} ${FTP_BASELINE_Y} L ${x} ${yFrom} L ${x + drawW} ${yTo} L ${x + drawW} ${FTP_BASELINE_Y} Z`}
                fill={RAMP_FILL}
              />
            )
          }
          const yTop = yForPower(b.power)
          const h = FTP_BASELINE_Y - yTop
          return (
            <rect
              key={i}
              x={x}
              y={yTop}
              width={drawW}
              height={h}
              fill={ZONE_FILL[b.zone]}
            />
          )
        })}

        {/* Cadence accent bars (one rect background + one rect hatch) */}
        {clusters.map((c, i) => (
          <g key={`acc-${i}`}>
            <rect x={c.x} y={ACCENT_Y} width={c.w} height={accentH} fill={CADENCE_HATCH_BG} />
            <rect
              x={c.x}
              y={ACCENT_Y}
              width={c.w}
              height={accentH}
              fill={`url(#${hatchId})`}
            />
          </g>
        ))}

        {/* Phase labels for full mode */}
        {mode === 'full' && workout.phases && (
          <g
            fontSize="10"
            fill="var(--color-text-tertiary)"
            textAnchor="middle"
          >
            {workout.phases.map((p, i) => {
              const cx = p.startSec * pxPerSec + (p.durSec * pxPerSec) / 2
              return (
                <text key={i} x={cx} y={FTP_BASELINE_Y + 22}>
                  {p.label}
                </text>
              )
            })}
          </g>
        )}
      </g>
    </svg>
  )
}
