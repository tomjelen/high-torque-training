import { SCIENCE_SECTIONS } from '../data'
import Cite from './Cite'
import SourcesList from './SourcesList'

export default function SciencePage() {
  return (
    <article>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mt-6 mb-1">Science &amp; Rationale</h1>
        <p className="text-slate-400 text-sm m-0">Why these workouts work, what the evidence actually says, and where to push back.</p>
      </div>

      <div className="science-content">
        {SCIENCE_SECTIONS.map((s) => (
          <details key={s.id} id={s.id} open className="border-b border-slate-800 mb-1">
            <summary className="text-xl font-bold text-slate-100 py-3 cursor-pointer list-none select-none hover:text-slate-300">
              {s.heading}
            </summary>
            <div className="pb-4">
              {renderBody(s.id)}
            </div>
          </details>
        ))}
      </div>

      <SourcesList />
    </article>
  )
}

function renderBody(id: string) {
  switch (id) {
    case 'what':
      return (
        <>
          <p>
            Most cyclists pedal at 80–100 RPM. Dropping to 50–70 RPM at the same power output forces each leg muscle
            contraction to produce much more force per stroke — that's what "high torque" means. The hypothesis is that
            this extra muscular demand triggers adaptations that normal cadence training doesn't, particularly increased
            VO2max and maximal aerobic power.
          </p>
        </>
      )

    case 'why':
      return (
        <>
          <h4>The key study (Hebisz &amp; Hebisz, 2024)</h4>
          <p>
            Two groups of well-trained female cyclists followed an identical 8-week polarized training program
            (~8 hours/week, 4-day microcycles). The only difference: one group did all high-intensity intervals at{' '}
            <strong>freely chosen cadence (&gt;80 RPM)</strong>, the other at <strong>low cadence (50–70 RPM)</strong>.
            <Cite sourceKey="hebisz2024" />
          </p>
          <p>Both programs included:</p>
          <ul>
            <li>Sprint Interval Training (SIT): 8–12 × 30-second all-out efforts</li>
            <li>High-Intensity Interval Training (HIIT): 4–6 × 4-minute efforts at 90–100% of max aerobic power</li>
            <li>Low-Intensity Endurance (LIT): long Zone 2 rides</li>
            <li>Active Recovery day</li>
          </ul>
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>VO2max improvement</th>
                <th>Max aerobic power improvement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Low cadence (50–70 RPM)</td>
                <td><strong>+8.7%</strong></td>
                <td><strong>+8.1%</strong></td>
              </tr>
              <tr>
                <td>Freely chosen cadence (&gt;80 RPM)</td>
                <td>+4.6%</td>
                <td>+3.0%</td>
              </tr>
            </tbody>
          </table>
          <p>
            The low-cadence group also improved their second ventilatory threshold (VT2), which the free-cadence group
            did not.
          </p>
          <p>
            <strong>Why it might work:</strong> At any given power output, pedaling slower means each pedal stroke
            requires more force. Research has shown that moving from the first threshold (VT1) up to VO2max effort
            nearly <strong>doubles the percentage of maximum dynamic force</strong> expressed on the pedals. Combining
            high force <em>and</em> high intensity likely drives greater muscle fiber recruitment — both slow-twitch
            fibers (already active) and additional fast-twitch fibers — leading to stronger aerobic adaptations.
            <Cite sourceKey="hebisz2024" />
          </p>
          <p>
            <strong>Important caveat:</strong> The study tested a program where <strong>all</strong> high-intensity work
            was done at low cadence for 8 weeks. It did not test the use case of adding 1–2 low-cadence sessions to an
            otherwise normal-cadence training week. The ongoing training approach in this document is based on coaching
            practice, not on this study directly.
          </p>

          <h4>Coaching consensus on long-term integration</h4>
          <p>
            The study shows the mechanism works. The coaching sources below show how practitioners integrate it into
            ongoing training. This combination — study mechanism + coaching practice — is the basis for this document.
          </p>
          <p>
            <strong>Neal Henderson</strong> (Apex Coaching, coached Rohan Dennis, Taylor Phinney):{' '}
            <em>"Generally I do about one of these sessions a week, at most two."</em> He has never programmed
            back-to-back big gear sessions and stresses the musculoskeletal load as the main limiter. Henderson's
            progression for new athletes: start with tempo (3–5 min at 75–85% FTP, 50–60 RPM), then threshold
            (5×5 min at ~95% FTP, 50–60 RPM), then VO2max (30–90s at ~5-min power).
            <Cite sourceKey="henderson" />
          </p>
          <p>
            <strong>EVOQ.BIKE:</strong> Start with 1 session per week, work up to 2 per week during base season. During
            race season: 1–2× per month for maintenance. They position low-cadence work as an ongoing training tool, not
            a block to complete.<Cite sourceKey="evoq" />
          </p>
          <p>
            <strong>Peter Schep / EF Pro Cycling:</strong> Progressive approach — start at 60 RPM, 80–85% FTP for
            15 minutes, then advance to threshold efforts, and only then to VO2max torque work (e.g. 3×5 min at
            106–120% FTP, 50–60 RPM — the Noemi Rüegg workout). Recreational riders should proceed cautiously. The
            VO2max torque workout is a post-adaptation session, not a starting point.<Cite sourceKey="ef" />
          </p>
          <p>
            <strong>Honest statement:</strong> No controlled trial has tested 1–2 low-cadence sessions per week mixed
            with normal-cadence training against a control group. The ongoing training recommendations in this document
            are coaching consensus, not experimentally validated. We are using the study to understand <em>why</em>{' '}
            low-cadence training may work, and coaching practice to guide <em>how</em> to integrate it.
          </p>

          <h4>Intensity floor: Zone 2 torque work is not effective</h4>
          <p>
            Both the research and coaching sources converge on this: low-cadence work must be at <strong>tempo
            intensity or above</strong> to be effective as a torque training stimulus.
          </p>
          <ul>
            <li>
              <strong>EVOQ.BIKE</strong> explicitly states: <em>"If you go below tempo into zone 2, you probably won't
              be producing enough torque to make a meaningful difference."</em> They recommend tempo or threshold power
              as the minimum.<Cite sourceKey="evoq" />
            </li>
            <li>
              The null-result study (Muñoz et al., 2014) used moderate-intensity low-cadence work and found no benefit
              over freely chosen cadence. The positive results in Hebisz came specifically from combining low cadence
              with <strong>high</strong> intensity (90–100% Pmax for HIIT, maximal for SIT).
              <Cite sourceKey="munoz2014" />
            </li>
            <li>
              <strong>Henderson:</strong> His entry-level torque work starts at 75–85% FTP (low tempo to sweet spot),
              not Zone 2.<Cite sourceKey="henderson" />
            </li>
          </ul>
        </>
      )

    case 'knee':
      return (
        <>
          <p>
            This is the main practical concern. Low cadence cycling significantly increases patellofemoral (kneecap)
            joint load.
          </p>
          <p>
            Biomechanical research shows that patellofemoral compressive force increases with knee flexion angle: at
            15° flexion it is approximately 1× bodyweight, at 45° it rises to 3× bodyweight, and at 75° it reaches
            6× bodyweight. Cycling seats you in a position of sustained knee flexion, and grinding at low cadence
            maximises force through each cycle.<Cite sourceKey="dye" />
          </p>
          <p>
            Clinically: <em>"Pushing hard gears at low revolutions puts a high load through the patella, whereas lower
            gears at high cadence (85–90 RPM) will put less load through the patellofemoral joint with each stroke."</em>
            <Cite sourceKey="physiopedia" />
          </p>
          <p>
            <strong>All low-cadence interval work must be done seated.</strong> Standing eliminates the training
            stimulus — you can use body weight to press the pedal down, bypassing the forced muscular contraction that
            makes this training work.
          </p>

          <h4>Who should avoid low-cadence training entirely</h4>
          <ul>
            <li>
              Any history of knee overuse injury, patellar tendinopathy, or patellofemoral pain syndrome (PFPS)
              <Cite sourceKey="evoq" />
            </li>
            <li>Coming off a rest period or injury</li>
            <li>Cyclists who already naturally grind at low cadences (the stimulus is reduced and the knee stress is higher)</li>
          </ul>

          <h4>Knee protection rules</h4>
          <p>These apply to every low-cadence session, always:</p>
          <ol>
            <li>
              <strong>Always warm up at normal cadence first</strong> (minimum 15 minutes). Don't start a low-cadence
              interval cold.
            </li>
            <li>
              <strong>If your knees ache during a set, stop the set.</strong> Don't push through. End the session if it
              continues.
            </li>
            <li>
              <strong>Don't go below 50 RPM</strong> unless you have months of established low-cadence work behind you.
            </li>
            <li>
              <strong>Never do low-cadence sessions on back-to-back days.</strong> The joint needs recovery time.
            </li>
            <li>
              <strong>All intervals are seated.</strong> Standing removes the training stimulus and changes the load
              pattern.
            </li>
            <li>
              If you have had patellofemoral pain, patellar tendinopathy, or any knee overuse injury: skip low-cadence
              training entirely.<Cite sourceKey="evoq" /><Cite sourceKey="physiopedia" />
            </li>
          </ol>
        </>
      )

    case 'adaptation':
      return (
        <>
          <p>
            <strong>Goal:</strong> Introduce the mechanical stimulus before adding intensity. Tendons and connective
            tissue adapt more slowly than muscles; this phase is non-negotiable.
          </p>
          <p>
            The cadence, session structure, and progressive volume here is adapted from standard coach guidance on
            torque training progressions, not from the study (the study did not include an adaptation phase —
            participants were already highly trained).<Cite sourceKey="evoq" />
          </p>
          <p>
            <strong>Why Zone 2 here, despite the intensity floor?</strong> The adaptation phase is the only exception to
            the "tempo or above" rule. It uses Zone 2 power intentionally, to introduce the mechanical stress to joints
            and tendons before adding intensity. It is not meant to drive performance gains.
          </p>
          <p><strong>Frequency:</strong> 1 low-cadence session per week. All other sessions: normal cadence.</p>
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Session</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>1× low-cadence endurance</td>
                <td>Warm up 15 min normal cadence. Then 2× 10 min Zone 2 (~65% FTP) at <strong>65–70 RPM</strong>, 5 min easy spin between. Cool down 10 min.</td>
              </tr>
              <tr>
                <td>2</td>
                <td>1× low-cadence endurance</td>
                <td>2× 15 min Zone 2 at <strong>65 RPM</strong>, 5 min easy between.</td>
              </tr>
              <tr>
                <td>3</td>
                <td>1× low-cadence endurance</td>
                <td>3× 10 min Zone 2 at <strong>60–65 RPM</strong>, 5 min easy between.</td>
              </tr>
            </tbody>
          </table>

          <h4>Ready to move on?</h4>
          <p>All of these must be true before starting ongoing training:</p>
          <ul>
            <li>All 3 adaptation sessions completed</li>
            <li>No knee pain during or after any session</li>
            <li>No lingering knee discomfort 24+ hours after any session</li>
            <li>Cadence targets felt achievable (not struggling to stay above target)</li>
            <li>RPE for the intervals was no higher than ~6/10 (it's Zone 2 power — the effort should come from the legs, not the lungs)</li>
          </ul>

          <h4>When to stop or go back</h4>
          <ul>
            <li>
              <strong>Any knee pain during or after a session:</strong> Stop low-cadence work for at least a week. When
              you restart, go back to Week 1. If it recurs, see a physiotherapist before continuing.
            </li>
            <li>
              <strong>Can't maintain target cadence</strong> (grinding 5+ RPM below target): The gear is too hard.
              Reduce power target, not cadence.
            </li>
            <li>
              <strong>Any sharp pain anywhere:</strong> Stop immediately. This is not normal muscular discomfort.
            </li>
            <li>
              <strong>Feeling overly fatigued from the sessions:</strong> This is Zone 2 power — it should not be
              draining. If it is, your overall training load may be too high. Reduce other sessions that week.
            </li>
          </ul>
        </>
      )

    case 'ongoing':
      return (
        <>
          <h4>How it works</h4>
          <p>
            You are not following a periodized block. You are adding a permanent training tool to your weekly routine.
            The biggest improvements will come in the first months (novel stimulus), but the sessions continue to
            provide value indefinitely — the same way that any structured interval work does.
          </p>

          <h4>Frequency</h4>
          <p><strong>1–2 sessions per week.</strong> One is the norm, two is the ceiling.</p>
          <ul>
            <li>
              <strong>1 per week is the standard.</strong> Some weeks you'll fit none. That's okay — this is a
              long-term practice, not a protocol with a deadline.
            </li>
            <li>
              <strong>Maximum: never more than 2 per week.</strong> Every coaching source converges on this ceiling
              (Henderson, EVOQ, EF Pro Cycling). The joint stress is the limiter, not the aerobic demand. When doing 2,
              make one harder and one easier.<Cite sourceKey="henderson" /><Cite sourceKey="evoq" /><Cite sourceKey="ef" />
            </li>
            <li><strong>Never on back-to-back days.</strong> At least one normal-cadence day between torque sessions.</li>
            <li>
              <strong>Race weeks:</strong> If you have a target Zwift race with hard sprints that week, consider
              dropping to 1 torque session and make it an easier one. Don't stack a Tier 4 sprint session and a race in
              the same week.
            </li>
            <li>
              <strong>Race season maintenance:</strong> 1–2 low-cadence sessions per month is sufficient to preserve
              the adaptation.<Cite sourceKey="evoq" />
            </li>
          </ul>

          <h4>How to fit this into your existing ~10 hrs/week</h4>
          <ul>
            <li>
              Replace 1–2 of your current interval sessions with a torque session from the calendar. Do not add torque
              sessions on top of your existing volume.
            </li>
            <li>Keep your long endurance ride at normal cadence.</li>
            <li>All other sessions (endurance, recovery, non-torque intervals): normal cadence.</li>
          </ul>

          <h4>The workout library</h4>
          <p>
            All sessions are seated throughout. All require a minimum 15-minute normal-cadence warm-up. The library is
            organized into four tiers by intensity and knee stress:
          </p>
          <ul>
            <li>
              <strong>Tier 1 — Entry:</strong> Henderson's tempo torque work and a short EVOQ staple. First weeks of
              ongoing training.
            </li>
            <li>
              <strong>Tier 2 — Development:</strong> EVOQ's staple format (5×5 and 5×8) and a scaled Hebisz HIIT intro.
              The bread-and-butter sessions.
            </li>
            <li>
              <strong>Tier 3 — Challenging:</strong> Henderson's threshold work, Hebisz HIIT at study intensity, and the
              Rüegg VO2max workout. Higher knee stress.
            </li>
            <li>
              <strong>Tier 4 — Advanced:</strong> EVOQ TorqueMax, Hebisz SIT and full HIIT volume. Highest knee stress,
              monthly at most initially.
            </li>
          </ul>

          <h4>Progression guidelines</h4>
          <p>
            There is no fixed schedule for moving between tiers. Progression is based on how your body responds, not on
            a calendar.
          </p>
          <ul>
            <li>
              <strong>Starting out (first ~4 weeks):</strong> Mix Tier 1 and Tier 2 sessions. Try each Tier 2 workout
              at least once to find what suits you.
            </li>
            <li>
              <strong>Advancing to Tier 3:</strong> After 3–4 weeks of Tier 2 with no knee issues and the sessions
              feeling manageable (RPE ≤ 7/10). Introduce one Tier 3 as your "hard" session; keep a Tier 1 or 2 as the
              "easy" one. Don't do two Tier 3 sessions in the same week initially.
            </li>
            <li>
              <strong>Advancing to Tier 4:</strong> After at least 8 weeks of consistent ongoing training (~11 weeks
              total including adaptation). Start with TorqueMax or the 2-set SIT. Monthly at most initially.
            </li>
            <li>
              <strong>FTP retesting:</strong> Retest every 6–8 weeks. As FTP increases, all percentage-based workouts
              automatically scale up in absolute power, maintaining the training stimulus.
            </li>
          </ul>

          <h4>Warning signs — when to back off</h4>
          <table>
            <thead>
              <tr><th>Sign</th><th>What to do</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Knee pain during or after a session</td>
                <td>Stop torque work for at least a week. Resume with a Tier 1 session. If it recurs, see a physiotherapist.</td>
              </tr>
              <tr>
                <td>Can't hold target cadence (grinding 5+ RPM below)</td>
                <td>The workout is too hard. Drop intensity or move to a lower tier.</td>
              </tr>
              <tr>
                <td>Normal training is suffering (can't hit numbers, feel flat)</td>
                <td>You are overdoing torque work. Drop to 1 session/week for 2–3 weeks.</td>
              </tr>
              <tr>
                <td>Post-session ache lasting 48+ hours</td>
                <td>Too much load. Drop a tier.</td>
              </tr>
              <tr>
                <td>Knee feels "tight" or "clicky" without pain</td>
                <td>Precautionary: skip the next torque session, monitor. If it persists, get it checked.</td>
              </tr>
            </tbody>
          </table>
        </>
      )

    case 'evidence':
      return (
        <>
          <p><strong>Honest answer: interesting, but not conclusive.</strong> Here's why:</p>

          <h4>Strengths</h4>
          <ul>
            <li>Published in a peer-reviewed journal (PLOS One)</li>
            <li>Controlled design: same hours, same structure, same effort levels, only cadence differed</li>
            <li>Effect size is large and practically meaningful (+8.7% vs +4.6% VO2max)</li>
          </ul>

          <h4>Weaknesses</h4>
          <ol>
            <li>
              <strong>Tiny sample.</strong> 12 cyclists per group. The authors themselves state the findings are
              "not representative for the general group of training female cyclists."<Cite sourceKey="hebisz2024" />
            </li>
            <li>
              <strong>Female-only, youth cohort.</strong> Participants were 17–20 year old competitive female cyclists.
              Results cannot be assumed to transfer directly to older, male, or recreational cyclists.
            </li>
            <li>
              <strong>No injury monitoring.</strong> The study tracked performance but not joint stress, knee pain, or
              any injury risk markers. Low cadence is mechanically harder on the knees, and this was not studied.
            </li>
            <li>
              <strong>Mixed literature overall.</strong> The authors acknowledge that "to date, there is no data
              reporting a clear and unequivocal benefit of torque (low cadence) training." Earlier studies using
              moderate-intensity low-cadence work with amateur middle-aged cyclists showed no advantage over freely
              chosen cadence — suggesting that <strong>intensity matters</strong>: the benefit may only emerge when
              combining low cadence with high intensity.
              <Cite sourceKey="hebisz2024" /><Cite sourceKey="munoz2014" />
            </li>
            <li>
              <strong>Comparison to male cohorts.</strong> The same polarized model applied to well-trained men in
              previous research produced ~14% VO2max improvements overall — larger than either group here. Gender and
              training history appear to significantly affect the magnitude of response.
              <Cite sourceKey="hebisz2024" />
            </li>
          </ol>

          <h4>Confidence table</h4>
          <p>How solid each claim is and what would change it:</p>
          <table>
            <thead>
              <tr><th>Claim</th><th>Current confidence</th><th>What would change it</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>+8.7% vs +4.6% VO2max finding</td>
                <td>Low-medium — one small study</td>
                <td>Replication in larger, mixed-gender, recreational cyclist cohorts</td>
              </tr>
              <tr>
                <td>Benefit requires <em>high</em> intensity at low cadence</td>
                <td>Medium-high — biomechanical theory + null results at moderate intensity (Muñoz 2014) + EVOQ explicitly states Zone 2 is ineffective</td>
                <td>A well-controlled study showing moderate-intensity low-cadence also works</td>
              </tr>
              <tr>
                <td>1–2 sessions/week mixed into normal training is effective</td>
                <td>Medium — coaching consensus (Henderson, EVOQ, EF Pro), no controlled trial</td>
                <td>A study directly testing mixed integration vs. control</td>
              </tr>
              <tr>
                <td>Knee injury risk at low cadence</td>
                <td>High — well-established biomechanics</td>
                <td>Would need evidence of a safe low-cadence technique that reduces patellofemoral load</td>
              </tr>
              <tr>
                <td>Seated requirement</td>
                <td>High — biomechanically obvious</td>
                <td>No plausible mechanism to change this</td>
              </tr>
              <tr>
                <td>3-week adaptation is sufficient</td>
                <td>Low — coach-derived, no controlled trial</td>
                <td>A study comparing fast vs. gradual introduction</td>
              </tr>
              <tr>
                <td>Applicability to recreational male cyclists</td>
                <td>Unknown — the study used young competitive women</td>
                <td>Studies on non-elite, mixed-gender, or masters populations</td>
              </tr>
              <tr>
                <td>2/week ongoing frequency ceiling</td>
                <td>Medium — coach consensus (Henderson, EVOQ, EF), no controlled trial</td>
                <td>A dose-response study comparing 1, 2, and 3 sessions/week</td>
              </tr>
              <tr>
                <td>Tier-based progression is safe</td>
                <td>Medium — standard progressive overload principle + coach guidance</td>
                <td>Injury data from structured torque training programs</td>
              </tr>
              <tr>
                <td>SIT sessions improve Zwift race sprints</td>
                <td>Low-medium — study used SIT but did not isolate sprint performance; biomechanically plausible</td>
                <td>A study testing low-cadence sprint training and race outcomes</td>
              </tr>
            </tbody>
          </table>
        </>
      )

    default:
      return null
  }
}
