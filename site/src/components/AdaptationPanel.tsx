import WorkoutCard from './WorkoutCard'
import { ADAPTATION_WORKOUTS } from '../data'

export default function AdaptationPanel() {
  return (
    <details open>
      <summary>Adaptation Phase — Weeks 1–3</summary>

      <div role="alert">
        <strong>Knee safety — read before starting:</strong> All intervals must be done <strong>seated</strong>.
        Warm up at normal cadence for at least 15 minutes before your first low-cadence interval.
        Stop immediately if you feel knee pain — do not push through. Never do low-cadence sessions on back-to-back days.
        If you have a history of patellofemoral pain or patellar tendinopathy, skip this training entirely.
      </div>

      <div className="adaptation-grid">
        {ADAPTATION_WORKOUTS.map((workout, i) => (
          <WorkoutCard key={workout.id} workout={workout} step={i + 1} />
        ))}
      </div>
    </details>
  )
}
