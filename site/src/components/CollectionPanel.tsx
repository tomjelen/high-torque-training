import Panel from './Panel'
import AfterBuildCard from './AfterBuildCard'
import TrackerSection from './TrackerSection'
import CollectionCard from './CollectionCard'
import ChartLegend from './ChartLegend'
import { LIBRARY_WORKOUTS } from '../data'
import { todayLocalIso } from '../utils/tracker'
import { isBuildDone } from '../utils/build-plan'
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

  return (
    <Panel
      heading="The High Torque Library"
      teaser={`${LIBRARY_WORKOUTS.length} sessions`}
      collapsed={state.panels.collection.collapsed}
      onToggle={onToggle}
    >
      {/* The tracker lives in "After the build": the build itself doesn't log
          (Tom, 2026-11-04). It hides with this panel when collapsed (Tom, ok). */}
      <AfterBuildCard active={isBuildDone(state.buildProgress)}>
        <TrackerSection state={state} setState={setState} />
      </AfterBuildCard>

      <div className="mb-4 px-1">
        <ChartLegend />
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
