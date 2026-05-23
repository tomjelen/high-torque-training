import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getZwoWorkoutsLastUpdated } from './scripts/extract-workouts-last-updated.mjs'
import { getTssMap } from './scripts/compute-tss.mjs'
import { getChartBlocksMap } from './scripts/compute-chart-blocks.mjs'

export default defineConfig(async () => {
  const [zwoWorkoutsLastUpdated, tssMap, chartBlocksMap] = await Promise.all([
    getZwoWorkoutsLastUpdated(),
    getTssMap(),
    getChartBlocksMap(),
  ])
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __ZWO_WORKOUTS_LAST_UPDATED__: JSON.stringify(zwoWorkoutsLastUpdated),
      __ZWO_WORKOUTS_TSS__: JSON.stringify(tssMap),
      __ZWO_WORKOUTS_BLOCKS__: JSON.stringify(chartBlocksMap),
    },
    test: {
      include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    },
  }
})
