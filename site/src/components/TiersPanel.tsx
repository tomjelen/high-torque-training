import WorkoutCard from './WorkoutCard'
import { TIERS } from '../data'

export default function TiersPanel() {
  return (
    <section>
      <h2>The High Torque Collection</h2>
      <p>
        1–2 sessions per week. One is the norm, two is the ceiling. Separated by
        at least one normal-cadence day.
      </p>

      <details>
        <summary>Usage guidelines &amp; progression</summary>

        <h4>Frequency</h4>
        <ul>
          <li>1 per week is the standard. 0 is fine occasionally. Never more than 2.</li>
          <li>Never on back-to-back days.</li>
          <li>When doing 2, make one harder and one easier.</li>
        </ul>

        <h4>Weekly template</h4>
        <p>
          Pick one session from a lower tier and one from the same or one higher
          tier. Pair a harder session with an easier one.
        </p>

        <h4>When to progress</h4>
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Typical timing</th>
              <th>What to do</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>First weeks of ongoing</td>
              <td>Weeks 4–7 overall</td>
              <td>Mix Tier 1 + Tier 2. Try each Tier 2 workout at least once.</td>
            </tr>
            <tr>
              <td>Introduce Tier 3</td>
              <td>After 3–4 weeks of Tier 2 without knee issues, RPE ≤ 7/10</td>
              <td>Use Tier 3 as the "hard" session, Tier 1–2 as the "easy" one.</td>
            </tr>
            <tr>
              <td>Introduce Tier 4</td>
              <td>After 8+ weeks of ongoing (~11+ weeks total)</td>
              <td>Monthly at most. Always pair with a Tier 1 easy session that week.</td>
            </tr>
          </tbody>
        </table>

        <h4>Signs you are NOT ready to move up</h4>
        <ul>
          <li>Knee pain or discomfort during or after sessions</li>
          <li>Can't hold the target cadence (grinding 5+ RPM below)</li>
          <li>RPE consistently above 8/10 on current-tier sessions</li>
          <li>Your normal (non-torque) training is suffering — can't hit numbers, feel flat</li>
        </ul>
        <p>
          <strong>If any of these appear:</strong> Drop back a tier. If it's
          knee-related, take a week off torque work entirely.
        </p>
      </details>

      {TIERS.map((tier) => (
        <section
          key={tier.number}
          className="tier-section"
          style={{ borderLeftColor: tier.color }}
        >
          <h3>
            <span className="tier-badge" style={{ backgroundColor: tier.color }}>
              T{tier.number}
            </span>
            {tier.name}
          </h3>
          <p className="tier-description">{tier.description}</p>
          <div className="tier-grid">
            {tier.workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}
