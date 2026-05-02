import Panel from './Panel'
import UsageGuidelines from './UsageGuidelines'
import CollectionCard from './CollectionCard'
import SessionTracker from './SessionTracker'
import { COLLECTION_WORKOUTS } from '../data'
import type { AppState, LogEntry, Workout } from '../types'

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

const SORTED_WORKOUTS: Workout[] = [...COLLECTION_WORKOUTS].sort((a, b) => {
  if (a.tier !== b.tier) return (a.tier ?? 0) - (b.tier ?? 0)
  return a.name.localeCompare(b.name)
})

export default function CollectionPanel({ state, setState }: Props) {
  function onToggle(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, collection: { collapsed } } }))
  }

  function handleDidThis(workoutId: string) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      workoutId,
      timestamp: new Date().toISOString(),
    }
    setState((prev) => ({ ...prev, log: [...prev.log, entry] }))
  }

  function handleDeleteEntry(id: string) {
    setState((prev) => ({ ...prev, log: prev.log.filter((e) => e.id !== id) }))
  }

  return (
    <Panel
      title="The High Torque Collection"
      teaser={`${SORTED_WORKOUTS.length} sessions · sort: tier → title`}
      collapsed={state.panels.collection.collapsed}
      onToggle={onToggle}
    >
      <UsageGuidelines />

      <div className="grid grid-cols-[1fr_300px] gap-4">
        <div className="grid grid-cols-3 gap-3 content-start">
          {SORTED_WORKOUTS.map((workout) => (
            <CollectionCard
              key={workout.id}
              workout={workout}
              onDidThis={() => handleDidThis(workout.id)}
            />
          ))}
        </div>

        <aside>
          <SessionTracker state={state} onDeleteEntry={handleDeleteEntry} />
        </aside>
      </div>
    </Panel>
  )
}
