export default function UsageGuidelines() {
  return (
    <details className="border border-slate-800 rounded bg-slate-950 mb-4 group">
      <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none select-none hover:bg-slate-800/30 text-sm">
        <span className="text-slate-300">
          <strong className="text-slate-200">Usage guidelines &amp; tiers</strong>
          {' — '}
          <span className="text-slate-500">1–2 sessions/week, never back-to-back, progress by cadence before volume</span>
        </span>
        <span className="text-slate-500 text-xs flex-shrink-0 group-open:rotate-180 transition-transform inline-block">▾</span>
      </summary>

      <div className="px-4 pb-4 pt-3 border-t border-slate-800 text-sm text-slate-400 space-y-4">
        <p className="m-0">
          The tiers serve two purposes depending on where you are in the program:
        </p>
        <ul className="m-0 pl-4 space-y-1 text-slate-400">
          <li>
            <strong className="text-slate-300">Early on, tiers are a progression ladder.</strong>{' '}
            Start at T1, build into T2, introduce T3 only after several weeks of comfortable T2 work.
            T4 is monthly at most, initially.
          </li>
          <li>
            <strong className="text-slate-300">Once settled, tiers are a hard/easy classifier.</strong>{' '}
            T3–T4 = hard sessions; T1–T2 = easy. Use this when deciding what to pair in a given week.
          </li>
        </ul>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Frequency</h4>
          <ul className="m-0 pl-4 space-y-1">
            <li>1 per week is the standard. 0 is fine occasionally. Never more than 2.</li>
            <li>Never on back-to-back days.</li>
            <li>When doing 2, make one harder and one easier.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Weekly template</h4>
          <p className="m-0">
            Pick one session from a lower tier and one from the same or one higher tier.
            Pair a harder session with an easier one.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">When to progress</h4>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-1 font-semibold pr-3">Stage</th>
                <th className="pb-1 font-semibold pr-3">Typical timing</th>
                <th className="pb-1 font-semibold">What to do</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-800/50">
                <td className="py-1.5 pr-3 align-top">First weeks of ongoing</td>
                <td className="py-1.5 pr-3 align-top text-slate-500">Weeks 4–7 overall</td>
                <td className="py-1.5 align-top">Mix Tier 1 + Tier 2. Try each Tier 2 workout at least once.</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-1.5 pr-3 align-top">Introduce Tier 3</td>
                <td className="py-1.5 pr-3 align-top text-slate-500">After 3–4 weeks of Tier 2 without knee issues, RPE ≤ 7/10</td>
                <td className="py-1.5 align-top">Use Tier 3 as the "hard" session, Tier 1–2 as the "easy" one.</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 align-top">Introduce Tier 4</td>
                <td className="py-1.5 pr-3 align-top text-slate-500">After 8+ weeks of ongoing (~11+ weeks total)</td>
                <td className="py-1.5 align-top">Monthly at most. Always pair with a Tier 1 easy session that week.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Signs you are NOT ready to move up</h4>
          <ul className="m-0 pl-4 space-y-1">
            <li>Knee pain or discomfort during or after sessions</li>
            <li>Can't hold the target cadence (grinding 5+ RPM below)</li>
            <li>RPE consistently above 8/10 on current-tier sessions</li>
            <li>Your normal (non-torque) training is suffering — can't hit numbers, feel flat</li>
          </ul>
          <p className="m-0 mt-2">
            <strong className="text-slate-300">If any of these appear:</strong> Drop back a tier.
            If it's knee-related, take a week off torque work entirely.
          </p>
        </div>
      </div>
    </details>
  )
}
