// Avoids the SSR warning that useLayoutEffect emits on the server. The
// pre-paint timing of useLayoutEffect is what swaps PRERENDER_STATE for
// loaded state before first paint, eliminating the hydration flash.
// See documentation/prerendering.md.

import { useEffect, useLayoutEffect } from 'react'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect
