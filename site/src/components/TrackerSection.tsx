import SessionTracker from './SessionTracker'
import type { AppState } from '../types'

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

// Rendered inside "After the build" in the library (see CollectionPanel).
// Library cards add entries to state.log; this is the only place that edits
// or deletes them. The build writes nothing to the log.
export default function TrackerSection({ state, setState }: Props) {
  function handleDeleteEntry(id: string) {
    setState((prev) => ({ ...prev, log: prev.log.filter((e) => e.id !== id) }))
  }

  function handleSetEntryDate(id: string, isoDate: string) {
    setState((prev) => ({
      ...prev,
      log: prev.log.map((e) => (e.id === id ? { ...e, timestamp: isoDate } : e)),
    }))
  }

  return (
    <SessionTracker state={state} onDeleteEntry={handleDeleteEntry} onSetEntryDate={handleSetEntryDate} />
  )
}
