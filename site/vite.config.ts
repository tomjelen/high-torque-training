import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getZwoWorkoutsLastUpdated } from './scripts/extract-workouts-last-updated.mjs'
import { getTssMap } from './scripts/compute-tss.mjs'

export default defineConfig(async () => {
  const [zwoWorkoutsLastUpdated, tssMap] = await Promise.all([
    getZwoWorkoutsLastUpdated(),
    getTssMap(),
  ])
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __ZWO_WORKOUTS_LAST_UPDATED__: JSON.stringify(zwoWorkoutsLastUpdated),
      __ZWO_WORKOUTS_TSS__: JSON.stringify(tssMap),
    },
    test: {
      include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    },
  }
})
