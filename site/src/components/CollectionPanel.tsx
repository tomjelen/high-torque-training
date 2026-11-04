import Panel from './Panel'
import AfterBuildCard from './AfterBuildCard'
import CollectionCard from './CollectionCard'
import ChartLegend from './ChartLegend'
import { LIBRARY_WORKOUTS } from '../data'
import { todayLocalIso } from '../utils/tracker'
import { isBuildDone } from '../utils/build-plan'
import type { ReactNode } from 'react'
import type { AppState, LogEntry } from '../types'

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
  trackerSlot?: ReactNode
}

export default function CollectionPanel({ state, setState, trackerSlot }: Props) {
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
      <AfterBuildCard active={isBuildDone(state.buildProgress)} trackerSlot={trackerSlot} />

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
