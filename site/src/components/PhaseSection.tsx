import { Phase } from "../data/workouts";
import WorkoutCard from "./WorkoutCard";

interface Props {
  phase: Phase;
  locked: boolean;
  completed: Record<string, boolean>;
  onToggle: (id: string) => void;
  onForceUnlock: () => void;
}

export default function PhaseSection({ phase, locked, completed, onToggle, onForceUnlock }: Props) {
  const total = phase.workouts.length;
  const done = phase.workouts.filter((w) => completed[w.id]).length;

  return (
    <section className={`phase-section${locked ? " phase-locked" : ""}`}>
      <hgroup>
        <h2>{phase.name}</h2>
        <p>{phase.subtitle}</p>
      </hgroup>

      <p className="phase-description">{phase.description}</p>

      <div className="phase-progress">
        {locked ? (
          <span>🔒 Complete the previous phase to unlock</span>
        ) : (
          <span>
            {done}/{total} completed
          </span>
        )}
      </div>

      <div className={`workout-list${locked ? " workout-list--locked" : ""}`}>
        {phase.workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            completed={!!completed[workout.id]}
            locked={locked}
            onToggle={() => onToggle(workout.id)}
          />
        ))}
      </div>

      {locked && (
        <div className="force-unlock">
          <button
            className="outline secondary"
            onClick={onForceUnlock}
          >
            Unlock anyway →
          </button>
        </div>
      )}
    </section>
  );
}
