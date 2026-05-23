/// <reference types="vite/client" />

// Build-time `define` globals (see vite.config.ts). Wrapped in `declare
// global` because tsconfig.app.json sets `moduleDetection: "force"`, which
// treats this .d.ts as a module — a bare top-level `declare const` would then
// be module-scoped, not ambient, and `tsc` would not see these globals from
// src/ (it didn't: the `tsc -b` build step silently failed until this block).
import type { ChartWorkout } from './components/chart-model'

export {}

declare global {
  const __ZWO_WORKOUTS_LAST_UPDATED__: string
  const __ZWO_WORKOUTS_TSS__: Record<string, number>
  const __ZWO_WORKOUTS_BLOCKS__: Record<string, ChartWorkout>
}
