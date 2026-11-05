import type { ReactNode } from 'react'
import Cite from './Cite'

interface Props {
  // The build is finished: this is now the rider's current step.
  active: boolean
  // The session tracker: library sessions log here, always shown.
  trackerSlot?: ReactNode
}

// "After the build", at the top of the library: the two ways to go on, the
// mixing hint, where the evidence ends, and the every-session reminder.
// Wording moved verbatim from the old "How to use" box; it follows the
// research doc's "After the build" and the calendar.
export default function AfterBuildCard({ active, trackerSlot }: Props) {
  return (
    <section
      id="after-build"
      aria-labelledby="after-build-heading"
      className={`scroll-mt-20 rounded border p-4 mb-4 ${
        active ? 'border-orange-700/60 bg-slate-800' : 'border-slate-800 bg-slate-950'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 id="after-build-heading" className="text-sm font-semibold text-slate-100 m-0">
          After the build
        </h3>
        <span className={`text-xs font-mono ${active ? 'text-orange-300' : 'text-slate-500'}`}>
          {active ? 'you are here' : 'after the 8-week build'}
        </span>
      </div>

      <p className="m-0 mb-3 text-sm text-slate-300">Choose one:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm text-slate-400">
        <div className="rounded border border-slate-700 p-3">
          <p className="m-0 mb-1 text-slate-100 font-semibold">Maintain: about one torque session a month</p>
          <p className="m-0">
            EVOQ gives 1–2 a month in season; I use it as the maintenance option.
            <Cite sourceKey="evoq" />
          </p>
        </div>
        <div className="rounded border border-slate-700 p-3">
          <p className="m-0 mb-1 text-slate-100 font-semibold">
            Keep going: 1–2 sessions a week, never on consecutive days
          </p>
          <p className="m-0">
            Combined from three coaches: Jim Rutberg of the coaching company CTS says to separate these workouts
            "by at least a full day"; coach Neal Henderson does "about one of these sessions a week at most two";
            the coaching company EVOQ says to start with one a week and work up to two.
            <Cite sourceKey="ctsRutberg" />
            <Cite sourceKey="henderson" />
            <Cite sourceKey="evoq" />
          </p>
        </div>
      </div>

      <div className="text-sm text-slate-400 space-y-2">
        <p className="m-0">
          <strong className="text-slate-300">Free choice from the library below.</strong> No rotation, no "next
          session". A hint of mine: mix moderate sessions (Torque Endurance, Threshold) with above-threshold
          ones (TorqueMax, Rüegg, HIIT, SIT).
        </p>
        <p className="m-0">
          <strong className="text-slate-300">Where the evidence ends.</strong> The research backs particular
          workouts (Hebisz: HIIT and SIT; de Pablos: near-maximal efforts), each tested inside its own multi-week
          program. No study tested this site's arrangement. After the build no source says what order to ride things
          in. Each workout keeps its own source label.
        </p>
        <p className="m-0 text-red-200">
          <strong className="text-red-100">⚠ Every session:</strong> all low-cadence intervals are seated; warm up
          at normal cadence for about 15 minutes first (every workout includes this warm-up); if your knees ache during an
          interval, stop the interval.
        </p>
      </div>

      {trackerSlot && <div className="mt-4">{trackerSlot}</div>}
    </section>
  )
}
