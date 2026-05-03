// site/src/lib/useIsomorphicLayoutEffect.ts
//
// useLayoutEffect on the client (synchronous, pre-paint), useEffect on
// the server (no-op). Used to swap from default state to localStorage
// state before the browser paints, eliminating the user-visible flash
// on first hydrate.
//
// See documentation/prerendering.md for why this matters.

import { useEffect, useLayoutEffect } from 'react'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect
