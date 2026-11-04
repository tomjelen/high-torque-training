import type { SyntheticEvent } from 'react'
import Cite from './Cite'

interface Props {
  collapsed: boolean
  onToggle: (collapsed: boolean) => void
}

export default function UsageGuidelines({ collapsed, onToggle }: Props) {
  function handleToggle(e: SyntheticEvent<HTMLDetailsElement>) {
    onToggle(!e.currentTarget.open)
  }

  // Wording follows the research doc ("The 12-week build", "The move-on
  // rule", "After the build") and the calendar ("Moving on").
  return (
    <details open={!collapsed} onToggle={handleToggle} className="border border-slate-800 rounded bg-slate-950 mb-4 group">
      <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none select-none hover:bg-slate-800/30 text-sm">
        <span className="text-slate-300">
          <strong className="text-slate-200">How to use the plan and the library</strong>
          {' — '}
          <span className="text-slate-500">12-week build, then free choice · never on consecutive days · all seated</span>
        </span>
        <span className="text-slate-500 text-xs flex-shrink-0 group-open:rotate-180 transition-transform inline-block">▾</span>
      </summary>

      <div className="px-4 pb-4 pt-3 border-t border-slate-800 text-sm text-slate-400 space-y-5 [&>div:not(:last-child)]:max-w-3xl">
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">The 12-week build</h4>
          <p className="m-0">
            <strong className="text-slate-300">One torque session a week.</strong> All other rides at normal cadence.
            Each session is ridden in two consecutive weeks: 4 weeks of adaptation, then Torque Endurance 3×8,
            Threshold 5×5, TorqueMax and HIIT 4×4. Progress counts sessions done, not calendar weeks. The
            two-weeks-per-session arrangement is ours; the order comes from the coaches (Schep, EVOQ, Henderson for
            sustained efforts, CTS).
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Moving on (our rule)</h4>
          <p className="m-0 mb-2">After the second session of each step, move to the next step only if:</p>
          <ul className="m-0 pl-4 space-y-1">
            <li>your knees were fine, during and after;</li>
            <li>you held the cadence;</li>
            <li>you weren't wrecked the next day.</li>
          </ul>
          <p className="m-0 mt-2">
            <strong className="text-slate-300">Any "no" → repeat last week's session.</strong> Knee pain → repeat last
            week's session instead of moving on; if it keeps coming back, stop torque work and see a professional.
            The nearest sources are Roadman's "if your joints feel good" (media relay, auto-captions) and Henderson's
            "if it hurts, stop doing it" (machine transcript).
            <Cite sourceKey="roadman" /><Cite sourceKey="henderson" />
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Breaks and restarting</h4>
          <ul className="m-0 pl-4 space-y-1">
            <li>
              After a break (illness, travel), the weeks 3–4 session is a good one to come back with. A suggestion,
              not a rule (ours).
            </li>
            <li>
              After a long break, restart from adaptation or from week 5, as you see fit (ours). The build plan has a
              button for each: <strong className="text-slate-300">Restart adaptation</strong> and{' '}
              <strong className="text-slate-300">Restart build</strong>.
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">After the build</h4>
          <ul className="m-0 pl-4 space-y-1">
            <li>
              <strong className="text-slate-300">Maintain:</strong> about one torque session a month (EVOQ gives 1–2 a
              month in season; we use it as the maintenance option).<Cite sourceKey="evoq" />
            </li>
            <li>
              <strong className="text-slate-300">Keep going:</strong> 1–2 sessions a week,{' '}
              <strong className="text-slate-300">never on consecutive days</strong> (ours, combining these). CTS (Jim
              Rutberg, written): beginner and intermediate riders "should separate MT workouts by at least a full
              day". Henderson (machine transcript): "Generally I do about one of these sessions a week at most two".
              EVOQ (written): start with one day a week and work up to two.
              <Cite sourceKey="ctsRutberg" /><Cite sourceKey="henderson" /><Cite sourceKey="evoq" />
            </li>
            <li>
              <strong className="text-slate-300">Free choice from the library.</strong> No rotation, no "next
              session". A plain hint (ours): mix moderate sessions (Torque Endurance, Threshold) with above-threshold
              ones (TorqueMax, Rüegg, HIIT, SIT).
            </li>
          </ul>
          <p className="m-0 mt-2">
            <strong className="text-slate-300">Where the evidence ends.</strong> The research backs particular
            workouts (Hebisz: HIIT and SIT; de Pablos: near-maximal efforts), each tested inside its own multi-week
            program. No study tested this site's arrangement. After week 12 no source says what order to ride things
            in. Each workout keeps its own source label.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Fitting it into ~10 hours/week (ours)</h4>
          <ul className="m-0 pl-4 space-y-1">
            <li>
              Swapping a torque session for one of your existing interval sessions is usually easier than adding one
              on top.
            </li>
            <li>Keep the long endurance ride and all other rides at normal cadence.</li>
            <li>All targets are %FTP, so they scale when your FTP changes.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Every session</h4>
          <ul className="m-0 pl-4 space-y-1">
            <li>All low-cadence intervals are seated.</li>
            <li>Warm up at normal cadence for about 15 minutes first (every file does this).</li>
            <li>If your knees ache during an interval, stop the interval.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => onToggle(true)}
            className="min-h-11 sm:min-h-0 px-2 -mr-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Hide ▴
          </button>
        </div>
      </div>
    </details>
  )
}
