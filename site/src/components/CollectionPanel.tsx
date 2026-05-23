import Panel from './Panel'
import UsageGuidelines from './UsageGuidelines'
import CollectionCard from './CollectionCard'
import SessionTracker from './SessionTracker'
import ChartLegend from './ChartLegend'
import { COLLECTION_WORKOUTS } from '../data'
import { todayLocalIso } from '../utils/tracker'
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
      timestamp: todayLocalIso(),
    }
    setState((prev) => ({ ...prev, log: [...prev.log, entry] }))
  }

  function handleDeleteEntry(id: string) {
    setState((prev) => ({ ...prev, log: prev.log.filter((e) => e.id !== id) }))
  }

  function handleSetEntryDate(id: string, isoDate: string) {
    setState((prev) => ({
      ...prev,
      log: prev.log.map((e) =>
        e.id === id ? { ...e, timestamp: isoDate } : e,
      ),
    }))
  }

  function onToggleUsageGuidelines(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, usageGuidelines: { collapsed } } }))
  }

  return (
    <Panel
      heading="The High Torque Collection"
      teaser={`${SORTED_WORKOUTS.length} sessions · sort: tier → title`}
      collapsed={state.panels.collection.collapsed}
      onToggle={onToggle}
    >
      <UsageGuidelines
        collapsed={state.panels.usageGuidelines.collapsed}
        onToggle={onToggleUsageGuidelines}
      />

      <div className="mb-4 px-1">
        <ChartLegend />
      </div>

<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 content-start">
          {SORTED_WORKOUTS.map((workout) => (
            <CollectionCard
              key={workout.id}
              workout={workout}
              onDidThis={() => handleDidThis(workout.id)}
            />
          ))}
        </div>

        <aside className="order-1 lg:order-2">
          <SessionTracker
            state={state}
            onDeleteEntry={handleDeleteEntry}
            onSetEntryDate={handleSetEntryDate}
          />
        </aside>
      </div>
    </Panel>
  )
}
