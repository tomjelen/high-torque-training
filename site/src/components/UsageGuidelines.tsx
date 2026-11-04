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

  // The build's rules in full, with their sources. Wording follows the
  // research doc ("The move-on rule") and the calendar ("Moving on"). The
  // 12-week order is shown by the progression chart, "After the build" lives
  // in AfterBuildCard, and the every-session rules in the knee box.
  return (
    <details open={!collapsed} onToggle={handleToggle} className="border border-slate-800 rounded bg-slate-950 mb-4 group">
      <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none select-none hover:bg-slate-800/30 text-sm">
        <span className="text-slate-300">
          <strong className="text-slate-200">Rules for the build</strong>
          {' — '}
          <span className="text-slate-500">moving on, breaks, fitting it into ~10 hours a week</span>
        </span>
        <span className="text-slate-500 text-xs flex-shrink-0 group-open:rotate-180 transition-transform inline-block">▾</span>
      </summary>

      <div className="px-4 pb-4 pt-3 border-t border-slate-800 text-sm text-slate-400 space-y-5">
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
