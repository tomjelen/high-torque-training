import { Workout } from "../data/workouts";
import WorkoutProfile from "./WorkoutProfile";

interface Props {
  workout: Workout;
  completed: boolean;
  locked: boolean;
  onToggle: () => void;
}

const frequencyLabel: Record<string, string> = {
  weekly: "Weekly staple",
  "every-2-3-weeks": "Every 2–3 weeks",
  monthly: "Monthly",
};

export default function WorkoutCard({ workout, completed, locked, onToggle }: Props) {
  const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
  const downloadUrl = workout.fileName
    ? `/workouts/${encodeURIComponent(workout.folderName)}/${encodeURIComponent(workout.fileName)}`
    : null;

  return (
    <article
      className={`workout-card${completed ? " completed" : ""}${locked ? " locked" : ""}`}
      aria-disabled={locked ? "true" : undefined}
    >
      <div className="workout-card-header">
        <label className="workout-check">
          <input
            type="checkbox"
            checked={completed}
            onChange={onToggle}
            disabled={locked}
            aria-label={`Mark "${workout.name}" as complete`}
          />
          <span className="workout-name">{workout.name}</span>
        </label>

        <div className="workout-meta">
          {workout.frequencyGuide && (
            <kbd className="frequency-badge">{frequencyLabel[workout.frequencyGuide]}</kbd>
          )}
          <small>{workout.durationMinutes} min</small>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={workout.fileName}
              className="download-link"
              aria-disabled={locked ? "true" : undefined}
              tabIndex={locked ? -1 : undefined}
            >
              ↓ .zwo
            </a>
          )}
        </div>
      </div>

      <p className="workout-description">{workout.description}</p>

      {workout.segments.length > 0 && (
        <div className="workout-profile">
          <WorkoutProfile segments={workout.segments} totalDuration={totalDuration} />
        </div>
      )}
    </article>
  );
}
