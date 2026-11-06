import { Link } from 'react-router-dom'

// The knee protection rules: the research doc's "Knee rules", in its order.
// Shown in the plan you're on, right above this week's card, as one calm
// amber line naming the before-ride rules; it opens to the full list and its
// sources. The after-ride rule (knee pain → repeat) is asked in the Done
// dialog every week. The list is in the DOM even when closed (a <details>),
// so the prerendered page and agents still read it.
export default function KneeRules() {
  return (
    <details className="group/knee border-l-4 border-amber-600/70 bg-amber-950/20 rounded-r text-amber-200 text-sm mb-4">
      <summary className="flex items-start justify-between gap-3 px-4 py-2.5 cursor-pointer list-none select-none hover:bg-amber-950/30">
        <span>
          <span aria-hidden="true">⚠ </span>
          <strong className="text-amber-100">Every session:</strong> seated · warm up first · stop if your knees
          ache · not below 50 rpm · not on consecutive days
        </span>
        <span className="flex-shrink-0 text-xs text-amber-300/80 whitespace-nowrap">
          Knee rules <span className="inline-block group-open/knee:rotate-180 transition-transform">▾</span>
        </span>
      </summary>
      <div className="px-4 pb-3 pt-1">
        <ol className="mt-0 mb-0 pl-5 space-y-1 list-decimal">
          <li>
            <strong className="text-amber-100">All low-cadence intervals are seated.</strong> Standing lets body weight push the pedal down instead of your muscles.
          </li>
          <li>
            <strong className="text-amber-100">Warm up at normal cadence</strong> for about 15 minutes first. Every workout includes this warm-up.
          </li>
          <li>
            <strong className="text-amber-100">If your knees ache during an interval, stop the interval.</strong> Don't push through.
          </li>
          <li>
            <strong className="text-amber-100">Knee pain after a session → repeat last week's session</strong> instead of moving on. If it keeps coming back, stop torque work and see a professional.
          </li>
          <li>
            <strong className="text-amber-100">Not below 50 rpm.</strong> No session in the library goes below 50.
          </li>
          <li>
            <strong className="text-amber-100">Not on consecutive days.</strong> See "After the build".
          </li>
        </ol>
        <p className="mt-2 mb-0 text-xs text-amber-200/70">
          Where these come from: staying seated and stopping when it hurts are coach Neal Henderson's advice. Not
          on consecutive days is based on the coaching company CTS. The rest are my own safety margins. Sources
          and reasons on the <Link to="/rationale" className="underline hover:text-amber-100">rationale page</Link>.
        </p>
      </div>
    </details>
  )
}
