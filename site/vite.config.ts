import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getZwoWorkoutsLastUpdated } from './scripts/extract-workouts-last-updated.mjs'

export default defineConfig(async () => {
  const zwoWorkoutsLastUpdated = await getZwoWorkoutsLastUpdated()
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __ZWO_WORKOUTS_LAST_UPDATED__: JSON.stringify(zwoWorkoutsLastUpdated),
    },
    test: {
      include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    },
  }
})
