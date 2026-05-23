/// <reference types="vite/client" />

declare const __ZWO_WORKOUTS_LAST_UPDATED__: string
declare const __ZWO_WORKOUTS_TSS__: Record<string, number>
declare const __ZWO_WORKOUTS_BLOCKS__: Record<
  string,
  import('./components/chart-model').ChartWorkout
>
