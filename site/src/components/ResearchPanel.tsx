export default function ResearchPanel() {
  return (
    <details className="research-panel">
      <summary>Why this works — Research &amp; Safety</summary>

      <section>
        <h3>The core idea</h3>
        <p>
          Most cyclists pedal at 80–100 RPM. Dropping to 50–70 RPM at the same power output
          forces each leg muscle contraction to produce much more force per stroke — that&apos;s
          what &quot;high torque&quot; means. The hypothesis is that this extra muscular demand
          triggers adaptations that normal-cadence training doesn&apos;t: higher VO2max and
          increased maximal aerobic power. Research suggests the benefit likely only emerges
          when combining <strong>low cadence with high intensity</strong> — moderate-intensity
          low-cadence work alone has shown no advantage in controlled trials.
        </p>
      </section>

      <section>
        <h3>The key study</h3>
        <p>
          <a
            href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hebisz R &amp; Hebisz P (2024, PLOS One)
          </a>{" "}
          compared two groups of well-trained female cyclists following identical 8-week
          polarized programs (~8 hr/week). The only difference: one group did all high-intensity
          intervals at freely chosen cadence (&gt;80 RPM), the other at low cadence (50–70 RPM).
        </p>
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>VO2max improvement</th>
              <th>Max aerobic power</th>
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
          The low-cadence group also improved their second ventilatory threshold (VT2), which
          the free-cadence group did not.
        </p>
      </section>

      <section>
        <h3>Evidence caveats — be honest</h3>
        <ul>
          <li>
            <strong>Tiny sample:</strong> 12 cyclists per group. The authors themselves state
            findings are &quot;not representative for the general group of training female
            cyclists.&quot;
          </li>
          <li>
            <strong>Female-only, youth cohort:</strong> participants were 17–20 year-old
            competitive female cyclists. Results cannot be assumed to transfer directly to
            older, male, or recreational riders.
          </li>
          <li>
            <strong>No injury monitoring:</strong> joint stress and knee pain were not tracked.
          </li>
          <li>
            <strong>Mixed broader literature:</strong>{" "}
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3907705/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Muñoz et al. (2014)
            </a>{" "}
            found no advantage for moderate-intensity low-cadence work in veteran cyclists.
            Intensity appears to be the key variable.
          </li>
        </ul>
        <p>
          Think of this as a plausible, evidence-backed tool — not a proven magic protocol.
        </p>
      </section>

      <section>
        <h3>Knee safety ⚠️</h3>
        <p>
          Patellofemoral compressive force increases sharply with knee flexion. Low cadence
          maximises force through each stroke. Key rules for every low-cadence session:
        </p>
        <ul>
          <li>Always warm up at normal cadence first (minimum 15 minutes).</li>
          <li>
            <strong>All low-cadence intervals are seated.</strong> Standing removes the
            training stimulus and changes the load pattern.
          </li>
          <li>If your knees ache during a set, stop. End the session if it continues.</li>
          <li>Don&apos;t go below 50 RPM without months of established low-cadence work.</li>
          <li>Never do low-cadence sessions on back-to-back days.</li>
          <li>
            Skip this block entirely if you have a history of PFPS, patellar tendinopathy,
            or any knee overuse injury.{" "}
            <a
              href="https://www.physio-pedia.com/Cyclist%27s_Knee"
              target="_blank"
              rel="noopener noreferrer"
            >
              (Physio-pedia: Cyclist&apos;s Knee)
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h3>Sources</h3>
        <ol>
          <li>
            <a
              href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hebisz R &amp; Hebisz P (2024). Greater improvement in aerobic capacity after a
              polarized training program including cycling interval training at low cadence.
              PLOS One.
            </a>
          </li>
          <li>
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3907705/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Muñoz I et al. (2014). Low cadence interval training at moderate intensity does
              not improve cycling performance in highly trained veteran cyclists. PMC3907705.
            </a>
          </li>
          <li>
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5717478/"
              target="_blank"
              rel="noopener noreferrer"
            >
              The influence of extrinsic factors on knee biomechanics during cycling
              (systematic review). PMC5717478.
            </a>
          </li>
          <li>
            <a
              href="https://www.physio-pedia.com/Cyclist%27s_Knee"
              target="_blank"
              rel="noopener noreferrer"
            >
              Physio-pedia: Cyclist&apos;s Knee — patellofemoral force and cadence.
            </a>
          </li>
          <li>
            <a
              href="https://www.evoq.bike/blog/low-cadence-cycling-how-torque-training-makes-you-faster"
              target="_blank"
              rel="noopener noreferrer"
            >
              EVOQ.BIKE — Low Cadence Cycling: How Torque Training Makes You Faster.
            </a>
          </li>
          <li>
            <a
              href="https://knowledgeiswatt.substack.com/p/58-high-intensity-torque-training"
              target="_blank"
              rel="noopener noreferrer"
            >
              Knowledge is Watt, issue 58 — High Intensity Torque Training Can Increase
              Cycling Performance.
            </a>
          </li>
          <li>
            <a
              href="https://www.wattkg.com/low-cadence-training/"
              target="_blank"
              rel="noopener noreferrer"
            >
              W/KG — Have Low Cadence Training Come Full Circle?
            </a>
          </li>
          <li>
            <a
              href="https://www.fasttalklabs.com/fast-talk/neal-henderson-put-it-in-the-big-gear-we-explore-low-cadence-high-torque-training/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Neal Henderson on Fast Talk Labs — Put It in the Big Gear: Low-Cadence,
              High-Torque Training.
            </a>
          </li>
          <li>
            <a
              href="https://www.efprocycling.com/tips-recipes/noemi-rueegg-torque-workouts/"
              target="_blank"
              rel="noopener noreferrer"
            >
              EF Pro Cycling — Pro Workouts: Torque Efforts with Noemi Rüegg.
            </a>
          </li>
        </ol>
      </section>
    </details>
  );
}
