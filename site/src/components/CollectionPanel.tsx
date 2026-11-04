import Panel from './Panel'
import UsageGuidelines from './UsageGuidelines'
import CollectionCard from './CollectionCard'
import ChartLegend from './ChartLegend'
import { LIBRARY_WORKOUTS } from '../data'
import { todayLocalIso } from '../utils/tracker'
import type { AppState, LogEntry } from '../types'

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

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

  function onToggleUsageGuidelines(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, usageGuidelines: { collapsed } } }))
  }

  return (
    <Panel
      heading="The High Torque Library"
      teaser={`${LIBRARY_WORKOUTS.length} sessions`}
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

      {/* Hints after the build (ours). The second paragraph follows the
          research doc's "Where the evidence ends". */}
      <div className="mb-4 px-1 max-w-3xl text-sm text-slate-400 flex flex-col gap-2">
        <p className="m-0">After the build, choose freely. Mix at-or-below-threshold and above-threshold sessions (our suggestion).</p>
        <p className="m-0">
          Hebisz and de Pablos each tested their own multi-week arrangement. No study has tested this site's
          arrangement. After week 12, no source says what order to ride things in.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
        {LIBRARY_WORKOUTS.map((workout) => (
          <CollectionCard
            key={workout.id}
            workout={workout}
            onDidThis={() => handleDidThis(workout.id)}
          />
        ))}
      </div>
    </Panel>
  )
}
