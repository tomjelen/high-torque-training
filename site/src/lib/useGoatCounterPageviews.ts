import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    goatcounter?: {
      count?: (vars?: { path?: string; title?: string; referrer?: string; event?: boolean }) => void
    }
  }
}

// count.js auto-counts the initial pageview, so we skip the first effect run and only count subsequent client-side route changes.
export default function useGoatCounterPageviews() {
  const location = useLocation()
  const lastCountedPath = useRef<string | null>(null)

  useEffect(() => {
    const path = location.pathname + location.search + location.hash
    if (lastCountedPath.current === path) return
    if (lastCountedPath.current === null) {
      lastCountedPath.current = path
      return
    }
    lastCountedPath.current = path
    window.goatcounter?.count?.({ path })
  }, [location])
}
