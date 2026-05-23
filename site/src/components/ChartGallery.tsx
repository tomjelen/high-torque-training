// Dev-only gallery for tuning WorkoutChart in the real Vite + Tailwind
// context. Reachable at /dev/charts (not linked in nav, not prerendered).
// As of M2 this renders the REAL .zwo prescriptions parsed at build time
// (__ZWO_WORKOUTS_BLOCKS__ — see scripts/compute-chart-blocks.mjs), not
// placeholder data. Removed/promoted to the real cards at M3.
import WorkoutChart from './WorkoutChart'
import { ZONE_FILL, type ChartWorkout } from './chart-model'

const DESKTOP_W = 680
const NARROW_W = 340 // < 380 → axis labels drop, tighter clustering

const TSS = __ZWO_WORKOUTS_TSS__
const BLOCKS = __ZWO_WORKOUTS_BLOCKS__

type Tier = 'A' | 'T1' | 'T2' | 'T3' | 'T4'

const TIER_BY_DIR: Array<[string, Tier]> = [
  ['High Torque - Adaptation/', 'A'],
  ['High Torque - Tier 1 Entry/', 'T1'],
  ['High Torque - Tier 2 Development/', 'T2'],
  ['High Torque - Tier 3 Challenging/', 'T3'],
  ['High Torque - Tier 4 Advanced/', 'T4'],
]
const TIER_ORDER: Record<Tier, number> = { A: 0, T1: 1, T2: 2, T3: 3, T4: 4 }

// req-4 sanity expectations, keyed by .zwo path. Dev annotation only — the
// authoritative regression test is workout-chart-clustering.test.ts.
const EXPECTED_CLUSTERS: Record<string, number> = {
  'High Torque - Tier 1 Entry/Entry_4x4_80pct.zwo': 4,
  'High Torque - Tier 1 Entry/Staple_3x5_90pct.zwo': 3,
  'High Torque - Tier 2 Development/HIIT_Intro_110pct.zwo': 3,
  'High Torque - Tier 2 Development/Staple_5x5_90pct.zwo': 5,
  'High Torque - Tier 2 Development/Staple_5x8_90pct.zwo': 5,
  'High Torque - Tier 3 Challenging/HIIT_VO2max_4rep.zwo': 4,
  'High Torque - Tier 3 Challenging/Ruegg_VO2max_Sprint.zwo': 3,
  'High Torque - Tier 3 Challenging/Threshold_5x5_95pct.zwo': 5,
  'High Torque - Tier 4 Advanced/HIIT_VO2max_6rep.zwo': 6,
  'High Torque - Tier 4 Advanced/SIT_2sets.zwo': 2,
  'High Torque - Tier 4 Advanced/SIT_3sets.zwo': 3,
  'High Torque - Tier 4 Advanced/TorqueMax_110pct.zwo': 6,
}

interface GalleryRow {
  workout: ChartWorkout
  tier: Tier
  durMin: number
  tss: number | null
  expectedClusters?: number
}

function tierFor(path: string): Tier {
  const hit = TIER_BY_DIR.find(([dir]) => path.startsWith(dir))
  return hit ? hit[1] : 'T4'
}

const ROWS: GalleryRow[] = Object.entries(BLOCKS)
  .map(([path, workout]) => ({
    workout,
    tier: tierFor(path),
    durMin: Math.round(workout.blocks.reduce((s, b) => s + b.dur, 0) / 60),
    tss: TSS[path] ?? null,
    expectedClusters: EXPECTED_CLUSTERS[path],
  }))
  .sort(
    (a, b) =>
      TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
      a.workout.id.localeCompare(b.workout.id),
  )

function LegendStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
      <span className="font-semibold text-slate-300">Chart key</span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ background: ZONE_FILL[2] }} />
        Endurance / warmup
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ background: ZONE_FILL[1] }} />
        Recovery / rest
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ background: ZONE_FILL[4] }} />
        Threshold
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ background: ZONE_FILL[5] }} />
        VO2 / 110%
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm" style={{ background: ZONE_FILL[6] }} />
        Sprint / max
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
          <defs>
            <pattern
              id="legend-strip-hatch"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#BA7517" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="14" height="8" fill="#633806" />
          <rect width="14" height="8" fill="url(#legend-strip-hatch)" />
        </svg>
        Cadence target
      </span>
    </div>
  )
}

function ExampleRow({ row }: { row: GalleryRow }) {
  const { workout, tier, durMin, tss, expectedClusters } = row
  return (
    <div className="rounded border border-slate-700 bg-slate-800 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="m-0 text-sm font-semibold text-slate-100">
          <span className="mr-2 font-mono text-xs text-slate-500">{tier}</span>
          {workout.title}
        </h3>
        <span className="text-xs text-slate-500">
          {durMin} min{tss != null ? ` · ${tss} TSS` : ''}
          {expectedClusters != null && (
            <>
              {' · '}
              <span className="text-amber-500">
                expect {expectedClusters} cadence bar
                {expectedClusters === 1 ? '' : 's'}
              </span>
            </>
          )}
        </span>
      </div>

      <div className="space-y-3">
        <div className="overflow-hidden">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
            Desktop · {DESKTOP_W}px
          </p>
          <WorkoutChart workout={workout} mode="minimal" width={DESKTOP_W} />
        </div>
        <div className="overflow-hidden">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
            Narrow · {NARROW_W}px (labels drop, tighter clustering)
          </p>
          <WorkoutChart workout={workout} mode="minimal" width={NARROW_W} />
        </div>
      </div>
    </div>
  )
}

export default function ChartGallery() {
  const staple5x5 = ROWS.find(
    (r) => r.workout.id === 'High Torque - Tier 2 Development/Staple_5x5_90pct.zwo',
  )?.workout

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-100">
        WorkoutChart gallery
      </h1>

      <div className="mb-6 rounded border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-300">
        <strong>REAL DATA</strong> — blocks parsed at build time from the
        actual
        <code className="mx-1 rounded bg-slate-900/60 px-1">.zwo</code> files
        (<code className="rounded bg-slate-900/60 px-1">__ZWO_WORKOUTS_BLOCKS__</code>).
        Dev-only page; not linked in nav, not in production. Removed or
        promoted to the real cards at M3.
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Section legend (M3 prototype)
        </h2>
        <div className="rounded border border-slate-700 bg-slate-800 p-3">
          <LegendStrip />
        </div>
      </section>

      {staple5x5 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Full mode — “How to read the chart” (M3 prototype)
          </h2>
          <div className="rounded border border-slate-700 bg-slate-800 p-4">
            <p className="mb-3 text-sm text-slate-300">
              Each chart shows the power profile of a session — bars are how
              hard, x-axis is time. The amber hatched bar below the FTP line
              marks intervals where a cadence target is prescribed. Empty space
              below the line means “no specific cadence” (warmup, cooldown,
              recoveries).
            </p>
            <WorkoutChart workout={staple5x5} mode="full" width={DESKTOP_W} />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Minimal mode — all workouts (desktop + narrow)
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {ROWS.map((row) => (
            <ExampleRow key={row.workout.id} row={row} />
          ))}
        </div>
      </section>
    </div>
  )
}
