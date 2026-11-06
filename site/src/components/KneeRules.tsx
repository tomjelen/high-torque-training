import { Link } from 'react-router-dom'

// The knee protection rules: the research doc's "Knee rules", in its order.
// Shown in the plan you're on, right above this week's card.
export default function KneeRules() {
  return (
    <div
      role="alert"
      className="border border-red-900/60 bg-red-950/30 text-red-200 rounded px-4 py-3 text-sm mb-4"
    >
      <strong className="text-red-100">⚠ Knee protection rules — applies to every session, always.</strong>
      <ol className="mt-2 mb-0 pl-5 space-y-1 list-decimal">
        <li>
          <strong className="text-red-100">All low-cadence intervals are seated.</strong> Standing lets body weight push the pedal down instead of your muscles.
        </li>
        <li>
          <strong className="text-red-100">Warm up at normal cadence</strong> for about 15 minutes first. Every workout includes this warm-up.
        </li>
        <li>
          <strong className="text-red-100">If your knees ache during an interval, stop the interval.</strong> Don't push through.
        </li>
        <li>
          <strong className="text-red-100">Knee pain after a session → repeat last week's session</strong> instead of moving on. If it keeps coming back, stop torque work and see a professional.
        </li>
        <li>
          <strong className="text-red-100">Not below 50 rpm.</strong> No session in the library goes below 50.
        </li>
        <li>
          <strong className="text-red-100">Not on consecutive days.</strong> See "After the build".
        </li>
      </ol>
      <p className="mt-2 mb-0 text-xs text-red-200/80">
        Where these come from: staying seated and stopping when it hurts are coach Neal Henderson's advice. Not
        on consecutive days is based on the coaching company CTS. The rest are my own safety margins. Sources
        and reasons on the <Link to="/rationale" className="underline hover:text-red-100">rationale page</Link>.
      </p>
    </div>
  )
}
