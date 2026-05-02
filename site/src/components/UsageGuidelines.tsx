import Cite from './Cite'

export default function UsageGuidelines() {
  return (
    <details className="border border-slate-800 rounded bg-slate-950 mb-4 group">
      <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none select-none hover:bg-slate-800/30 text-sm">
        <span className="text-slate-300">
          <strong className="text-slate-200">How to use this collection</strong>
          {' — '}
          <span className="text-slate-500">1–2 sessions/week, never back-to-back, all seated, 15-min warm-up</span>
        </span>
        <span className="text-slate-500 text-xs flex-shrink-0 group-open:rotate-180 transition-transform inline-block">▾</span>
      </summary>

      <div className="px-4 pb-4 pt-3 border-t border-slate-800 text-sm text-slate-400 space-y-5">
        <p className="m-0">
          The core of the program. Once adaptation is complete, you integrate high-torque sessions into your weekly
          training permanently — there is no end date. The biggest improvements come in the first months (novel
          stimulus), but the sessions continue to provide value indefinitely.
        </p>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-4">Frequency</h4>
          <p className="m-0 mb-2">
            <strong className="text-slate-300">1–2 sessions per week.</strong> One is the norm, two is the ceiling.
          </p>
          <ul className="m-0 pl-4 space-y-1">
            <li>
              <strong className="text-slate-300">1 per week is the standard.</strong>{' '}
              Some weeks you'll fit none — that's okay. This is a long-term practice, not a protocol with a deadline.
            </li>
            <li>
              <strong className="text-slate-300">Maximum: never more than 2 per week.</strong>{' '}
              Every coaching source converges on this ceiling (Henderson, EVOQ, EF Pro Cycling). The joint stress is the
              limiter, not the aerobic demand. When doing 2, make one harder and one easier.
              <Cite sourceKey="henderson" /><Cite sourceKey="evoq" /><Cite sourceKey="ef" />
            </li>
            <li>
              <strong className="text-slate-300">Never on back-to-back days.</strong>{' '}
              At least one normal-cadence day between torque sessions.
            </li>
            <li>
              <strong className="text-slate-300">Race weeks:</strong>{' '}
              If you have a target Zwift race with hard sprints that week, drop to 1 torque session and make it an easier
              one. Don't stack a Tier 4 sprint session and a race in the same week.
            </li>
            <li>
              <strong className="text-slate-300">Race-season maintenance:</strong>{' '}
              1–2 low-cadence sessions per month is sufficient to preserve the adaptation.<Cite sourceKey="evoq" />
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Fitting into ~10 hrs/week</h4>
          <ul className="m-0 pl-4 space-y-1">
            <li>
              Replace 1–2 of your current interval sessions with a torque session from the calendar. Don't add torque
              sessions on top of your existing volume.
            </li>
            <li>Keep your long endurance ride at normal cadence.</li>
            <li>All other sessions (endurance, recovery, non-torque intervals): normal cadence.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">The four tiers</h4>
          <p className="m-0 mb-2">
            All sessions are seated throughout. All require a minimum 15-minute normal-cadence warm-up. The library is
            organised into four tiers by intensity and knee stress.
          </p>
          <ul className="m-0 pl-4 space-y-1">
            <li>
              <strong className="text-slate-300">Tier 1 — Entry.</strong>{' '}
              Henderson's tempo torque work and a short EVOQ staple. First weeks of ongoing training.
            </li>
            <li>
              <strong className="text-slate-300">Tier 2 — Development.</strong>{' '}
              EVOQ's staple format (5×5 and 5×8) and a scaled Hebisz HIIT intro. The bread-and-butter sessions.
            </li>
            <li>
              <strong className="text-slate-300">Tier 3 — Challenging.</strong>{' '}
              Henderson's threshold work, Hebisz HIIT at study intensity, and the Rüegg VO2max workout. Higher knee
              stress.
            </li>
            <li>
              <strong className="text-slate-300">Tier 4 — Advanced.</strong>{' '}
              EVOQ TorqueMax, Hebisz SIT and full HIIT volume. Highest knee stress, monthly at most initially.
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Progression</h4>
          <p className="m-0 mb-2">
            There's no fixed schedule for moving between tiers. Progression is based on how your body responds, not on a
            calendar.
          </p>
          <ul className="m-0 pl-4 space-y-1">
            <li>
              <strong className="text-slate-300">Starting out (first ~4 weeks):</strong>{' '}
              Mix Tier 1 and Tier 2 sessions. Try each Tier 2 workout at least once to find what suits you.
            </li>
            <li>
              <strong className="text-slate-300">Advancing to Tier 3:</strong>{' '}
              After 3–4 weeks of Tier 2 with no knee issues and the sessions feeling manageable (RPE ≤ 7/10). Introduce
              one Tier 3 as your "hard" session; keep a Tier 1 or 2 as the "easy" one. Don't do two Tier 3 sessions in
              the same week initially.
            </li>
            <li>
              <strong className="text-slate-300">Advancing to Tier 4:</strong>{' '}
              After at least 8 weeks of consistent ongoing training (~11 weeks total including adaptation). Start with
              TorqueMax or the 2-set SIT. Monthly at most initially. Tier 4 sessions always count as your "hard" session
              that week — pair with a Tier 1 or easy Tier 2 session. The SIT sessions (30-second all-out sprints at
              50–60 rpm) are the highest knee-load sessions in the library.
            </li>
            <li>
              <strong className="text-slate-300">FTP retesting:</strong>{' '}
              Retest every 6–8 weeks. As FTP increases, all percentage-based workouts automatically scale up.
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Warning signs — when to back off</h4>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-1 font-semibold pr-3">Sign</th>
                <th className="pb-1 font-semibold">What to do</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-800/50">
                <td className="py-1.5 pr-3 align-top">Knee pain during or after a session</td>
                <td className="py-1.5 align-top">
                  Stop torque work for at least a week. Resume with a Tier 1 session. If it recurs, see a physiotherapist.
                </td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-1.5 pr-3 align-top">Can't hold target cadence (grinding 5+ rpm below)</td>
                <td className="py-1.5 align-top">The workout is too hard. Drop intensity or move to a lower tier.</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-1.5 pr-3 align-top">Normal training is suffering (can't hit numbers, feel flat)</td>
                <td className="py-1.5 align-top">You're overdoing torque work. Drop to 1 session/week for 2–3 weeks.</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-1.5 pr-3 align-top">Post-session ache lasting 48+ hours</td>
                <td className="py-1.5 align-top">Too much load. Drop a tier.</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 align-top">Knee feels "tight" or "clicky" without pain</td>
                <td className="py-1.5 align-top">
                  Precautionary: skip the next torque session, monitor. If it persists, get it checked.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-0">Sample weeks</h4>
          <p className="m-0 mb-3 text-slate-500">Illustrative, not prescriptive. Fit the sessions into your existing schedule.</p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="m-0 mb-2">
                <strong className="text-slate-300">Early ongoing</strong>{' '}
                <span className="text-slate-500">(weeks 4–6 overall)</span>
              </p>
              <table className="w-full text-xs border-collapse">
                <tbody className="text-slate-400">
                  <tr className="border-b border-slate-800/50">
                    <td className="py-1 pr-3 align-top text-slate-500 w-16">Tue</td>
                    <td className="py-1 align-top">Entry 4×4 (Tier 1)</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-1 pr-3 align-top text-slate-500">Thu</td>
                    <td className="py-1 align-top">Staple 5×5 (Tier 2)</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 align-top text-slate-500">Other</td>
                    <td className="py-1 align-top">Normal training</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="m-0 mb-2">
                <strong className="text-slate-300">Established</strong>{' '}
                <span className="text-slate-500">(weeks 10+ overall)</span>
              </p>
              <table className="w-full text-xs border-collapse">
                <tbody className="text-slate-400">
                  <tr className="border-b border-slate-800/50">
                    <td className="py-1 pr-3 align-top text-slate-500 w-16">Tue</td>
                    <td className="py-1 align-top">Staple 5×5 (Tier 2)</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-1 pr-3 align-top text-slate-500">Thu</td>
                    <td className="py-1 align-top">HIIT VO2max 4 reps (Tier 3)</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-3 align-top text-slate-500">Other</td>
                    <td className="py-1 align-top">Normal training</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={(e) => {
              const details = e.currentTarget.closest('details')
              if (details) details.open = false
            }}
            className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            Hide ▴
          </button>
        </div>
      </div>
    </details>
  )
}
