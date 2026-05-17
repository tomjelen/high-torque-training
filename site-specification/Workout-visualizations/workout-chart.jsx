// WorkoutChart — High-Torque cadence accent chart.
// Faithful implementation of the handoff spec:
//   • 8px hatched amber rule below FTP baseline marks cadence prescription
//   • Clusters short intra-set rests into a single accent bar (threshold = 12px)
//   • Empty space = no cadence prescribed (no positive signal for "free")
//   • Zone palette hardcoded; amber #633806/#BA7517 hardcoded
//   • Two layout modes: 'minimal' (table rows) and 'full' (annotated)

const ZONE_FILL = {
  1: '#7A7A7A', // recovery / inter-set
  2: '#1AA5DB', // endurance / warmup ramp top
  3: '#3FAE54', // tempo (reserved)
  4: '#F4C430', // threshold
  5: '#E68A2E', // VO2 / sweet-spot (reserved)
  6: '#DC2626', // anaerobic / sprint
};

// Power as fraction of FTP (FTP baseline = 1.0). Used to derive bar height.
// FTP baseline sits at y=80 within the chart group; chart spans y=0..80.
// Anything > 1.0 bar extends above baseline; anything < 1.0 extends from baseline
// up to that fraction (drawn as a positive bar reaching power-level y).
const FTP_BASELINE_Y = 80;
const CHART_TOP_Y = 0;        // bar extends from baseline UP to here at 130% FTP
const POWER_TO_TOP = 1.30;    // map 130% FTP -> chart top

function yForPower(pct) {
  // pct = fraction of FTP (1.0 = FTP). Returns y where the *top* of a power
  // block of that intensity should sit. Clamped to chart top.
  const t = Math.min(pct, POWER_TO_TOP) / POWER_TO_TOP;
  return FTP_BASELINE_Y - t * FTP_BASELINE_Y;
}

// ---------------------------------------------------------------------------
// Block model
//   { kind: 'block'|'ramp', zone, power, dur, cadence?, fromPower?, toPower? }
//   kind 'ramp' uses fromPower→toPower (warmup / cooldown trapezoids).
// dur is in seconds.
// ---------------------------------------------------------------------------

function totalDuration(blocks) {
  return blocks.reduce((s, b) => s + b.dur, 0);
}

// Build cluster ranges from a block list.
// A "set" = a maximal run of work-blocks (power >= 0.85 OR sprint) separated
// by short rests (gray Z1 blocks). We cluster when ALL intra-set rests are
// narrow (< clusterThresholdPx after layout).
function buildClusters(blocks, layout, clusterThresholdPx) {
  // Indexes of blocks that have a cadence target.
  const cadenceIdx = blocks
    .map((b, i) => (b.cadence ? i : -1))
    .filter((i) => i >= 0);

  if (cadenceIdx.length === 0) return [];

  // Group consecutive cadence blocks where intervening blocks (which must all
  // be short Z1 rests OR more cadence work) are narrow.
  const clusters = [];
  let cur = [cadenceIdx[0]];

  for (let k = 1; k < cadenceIdx.length; k++) {
    const prev = cadenceIdx[k - 1];
    const curIdx = cadenceIdx[k];
    // Check the gap between prev and curIdx — every block in between must be
    // narrow (≤ threshold) AND a rest/recovery (zone 1) for them to cluster.
    let allNarrow = true;
    for (let m = prev + 1; m < curIdx; m++) {
      const g = layout[m];
      if (!g) { allNarrow = false; break; }
      if (g.w > clusterThresholdPx) { allNarrow = false; break; }
    }
    if (allNarrow && curIdx - prev <= 8) {
      cur.push(curIdx);
    } else {
      clusters.push(cur);
      cur = [curIdx];
    }
  }
  clusters.push(cur);

  return clusters.map((idxs) => {
    const first = layout[idxs[0]];
    const last = layout[idxs[idxs.length - 1]];
    return { x: first.x, w: last.x + last.w - first.x, blockIdxs: idxs };
  });
}

// ---------------------------------------------------------------------------
// The chart component
// ---------------------------------------------------------------------------

function WorkoutChart({
  workout,
  mode = 'minimal',          // 'minimal' | 'full'
  width = 540,               // inner chart width (before left axis)
  axisGutter,                // left gutter for "100%" / "FTP" labels (auto)
  clusterThresholdPx,        // narrower charts cluster more aggressively (auto)
  showAxisLabels = true,     // hidden automatically on very narrow widths
  hatchId,                   // unique id for the hatch pattern in this svg
}) {
  // Narrow-width adjustments (mobile): drop axis labels and bump the
  // clustering threshold so sprint sets still merge at smaller pixel scale.
  const isNarrow = width < 380;
  if (isNarrow) showAxisLabels = false;
  if (axisGutter == null) axisGutter = showAxisLabels ? 36 : 6;
  if (clusterThresholdPx == null) {
    clusterThresholdPx = isNarrow ? 8 : 12;
  }
  const total = totalDuration(workout.blocks);
  const pxPerSec = width / total;

  // Layout pass: compute x/w for each block.
  let cursor = 0;
  const layout = workout.blocks.map((b) => {
    const w = b.dur * pxPerSec;
    const g = { x: cursor, w, b };
    cursor += w;
    return g;
  });

  // Build cadence cluster bars.
  const clusters = buildClusters(workout.blocks, layout, clusterThresholdPx);

  // Chart group geometry. y=0..80 for the chart; accent at y=82..90.
  const chartGroupH = 92; // includes accent strip
  const phaseLabelH = mode === 'full' ? 18 : 0;
  // Minimal mode is meant to be embedded inside a row that already shows the
  // workout title + cadence; the chart suppresses its own header to avoid
  // duplication. Full mode (standalone reference) keeps the header.
  const showHeader = mode === 'full';
  const headerH = showHeader ? 22 : 0;
  const legendH = mode === 'full' ? 26 : 0;
  const svgH = headerH + chartGroupH + phaseLabelH + legendH + 6;
  const svgW = axisGutter + width + 16; // right margin for "Cadence target" header

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
         style={{ display: 'block' }}>
      <defs>
        <pattern id={hatchId} patternUnits="userSpaceOnUse"
                 width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#BA7517" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Header — only in full mode (minimal mode delegates to the host row) */}
      {showHeader && (
        <g>
          <text x="0" y="13" fontSize="13" fontWeight="500"
                fill="var(--color-text-primary)">
            {workout.title}{workout.subtitle ? ` — ${workout.subtitle}` : ''}
          </text>
          {workout.cadenceLabel && (
            <text x={svgW} y="13" fontSize="12" textAnchor="end"
                  fill="var(--color-text-secondary)">
              Cadence target: {workout.cadenceLabel}
            </text>
          )}
        </g>
      )}

      <g transform={`translate(${axisGutter}, ${headerH})`}>
        {/* FTP baseline */}
        <line x1="0" y1={FTP_BASELINE_Y} x2={width} y2={FTP_BASELINE_Y}
              stroke="var(--color-border-tertiary)" strokeWidth="0.5" />

        {/* Axis labels */}
        {showAxisLabels && (
          <g>
            <text x="-10" y="8" fontSize="11" textAnchor="end"
                  fill="var(--color-text-tertiary)">100%</text>
            <text x="-10" y={FTP_BASELINE_Y + 4} fontSize="11" textAnchor="end"
                  fill="var(--color-text-tertiary)">FTP</text>
          </g>
        )}

        {/* Power blocks */}
        {layout.map(({ x, w, b }, i) => {
          if (b.kind === 'ramp') {
            const yFrom = yForPower(b.fromPower);
            const yTo = yForPower(b.toPower);
            return (
              <path key={i}
                    d={`M ${x} ${FTP_BASELINE_Y} L ${x} ${yFrom} L ${x + w} ${yTo} L ${x + w} ${FTP_BASELINE_Y} Z`}
                    fill={ZONE_FILL[b.zone]} />
            );
          }
          const yTop = yForPower(b.power);
          const h = FTP_BASELINE_Y - yTop;
          return (
            <rect key={i} x={x} y={yTop} width={w} height={h}
                  fill={ZONE_FILL[b.zone]} />
          );
        })}

        {/* Cadence accent bars (one rect background + one rect hatch) */}
        {clusters.map((c, i) => (
          <g key={`acc-${i}`}>
            <rect x={c.x} y="82" width={c.w} height="8" fill="#633806" />
            <rect x={c.x} y="82" width={c.w} height="8" fill={`url(#${hatchId})`} />
          </g>
        ))}

        {/* Phase labels for full mode */}
        {mode === 'full' && (
          <g fontSize="10" fill="var(--color-text-tertiary)" textAnchor="middle">
            {workout.phases && workout.phases.map((p, i) => {
              const cx = p.startSec * pxPerSec + (p.durSec * pxPerSec) / 2;
              return <text key={i} x={cx} y={FTP_BASELINE_Y + 22}>{p.label}</text>;
            })}
          </g>
        )}
      </g>

      {/* Legend (full mode only) */}
      {mode === 'full' && (
        <g transform={`translate(${axisGutter}, ${headerH + chartGroupH + phaseLabelH + 4})`}>
          <rect x="0" y="6" width="12" height="12" fill={ZONE_FILL[6]} />
          <text x="18" y="16" fontSize="11" fill="var(--color-text-secondary)">Max effort</text>
          <g transform="translate(96, 0)">
            <rect x="0" y="6" width="12" height="12" fill="#633806" />
            <rect x="0" y="6" width="12" height="12" fill={`url(#${hatchId})`} />
            <text x="18" y="16" fontSize="11" fill="var(--color-text-secondary)">Cadence target</text>
          </g>
        </g>
      )}
    </svg>
  );
}

window.WorkoutChart = WorkoutChart;
window.ZONE_FILL = ZONE_FILL;
