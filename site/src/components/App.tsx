import { phases } from "../data/workouts";
import { useLocalStorage } from "../hooks/useLocalStorage";
import PhaseSection from "./PhaseSection";
import ResearchPanel from "./ResearchPanel";

export default function App() {
  const [completed, setCompleted] = useLocalStorage<Record<string, boolean>>("completed", {});
  const [forcedUnlocked, setForcedUnlocked] = useLocalStorage<Record<string, boolean>>("unlocked", {});

  function toggleWorkout(id: string) {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function forceUnlock(phaseId: string) {
    setForcedUnlocked((prev) => ({ ...prev, [phaseId]: true }));
  }

  // Lock logic: Phase N locked until all workouts in Phase N-1 are done OR force-unlocked
  function isLocked(index: number): boolean {
    if (index === 0) return false; // Phase 1 always unlocked
    if (index === 3) return false; // Library always unlocked

    const prevPhase = phases[index - 1];
    if (forcedUnlocked[phases[index].id]) return false;
    return !prevPhase.workouts.every((w) => completed[w.id]);
  }

  return (
    <>
      <main className="container">
        <header className="site-header">
          <hgroup>
            <h1>High Torque Training</h1>
            <p>Low-cadence training for cyclists — based on Hebisz &amp; Hebisz (2024)</p>
          </hgroup>
          <a
            href="/high-torque-workouts.zip"
            download
            role="button"
            className="download-all"
          >
            ↓ Download All Workouts
          </a>
        </header>

        <ResearchPanel />

        {phases.map((phase, i) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            locked={isLocked(i)}
            completed={completed}
            onToggle={toggleWorkout}
            onForceUnlock={() => forceUnlock(phase.id)}
          />
        ))}

        <footer>
          <small>
            Based on{" "}
            <a
              href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hebisz &amp; Hebisz (2024, PLOS One)
            </a>
            . High Torque Training.
          </small>
        </footer>
      </main>
    </>
  );
}
