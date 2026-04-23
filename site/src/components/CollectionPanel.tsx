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
    const now = new Date()
    const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      workoutId,
      timestamp: new Date(ymd).toISOString(),
    }
    setState((prev) => ({ ...prev, log: [...prev.log, entry] }))
  }

  return (
    <Panel
      title="The High Torque Collection"
      teaser={`${SORTED_WORKOUTS.length} sessions · sort: tier → title`}
      collapsed={state.panels.collection.collapsed}
      onToggle={onToggle}
    >
      <UsageGuidelines />

      <p className="text-xs text-slate-500 border border-slate-800 rounded px-3 py-2 mb-4 m-0">
        <strong className="text-slate-400">Seated only.</strong>{' '}
        Stop if anything pulls in a knee — low-cadence work stays knee-risky, not just during adaptation.
      </p>

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
          <SessionTracker state={state} setState={setState} />
        </aside>
      </div>
    </Panel>
  )
}
