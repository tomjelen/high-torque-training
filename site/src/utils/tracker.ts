function msFromIso(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function todayLocalIso(): string {
  const d = new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}

export function calcGap(
  entryIsoDate: string,
  nextIsoDate: string | null,
  todayIsoDate: string,
): number {
  const refMs = nextIsoDate ? msFromIso(nextIsoDate) : msFromIso(todayIsoDate)
  return Math.round((refMs - msFromIso(entryIsoDate)) / (1000 * 60 * 60 * 24))
}

// `isFirst` distinguishes the newest entry (gap measured to today) from older
// entries (gap measured to the next-newer session). A 0-day gap means very
// different things in each case: "today" vs. "same day as the following session".
export function formatGap(days: number, isFirst: boolean): string {
  if (days === 0) return isFirst ? 'today' : '0d'
  return `+${days}d`
}

// Two sessions on the same or consecutive days. "Never on consecutive days"
// rests on CTS (Rutberg, written): beginner and intermediate riders "should
// separate MT workouts by at least a full day". Only meaningful between two
// logged sessions; the newest entry's gap is measured to today instead.
export function isTooClose(days: number): boolean {
  return days <= 1
}

const FULL_DAY_HINT = 'Leave at least a full day between high-torque sessions.'

// With isFirst=false and a 0/1-day gap this is also the visible warning on the
// newer session of a too-close pair (SessionTracker).
export function formatGapTitle(days: number, isFirst: boolean): string {
  if (isFirst && days === 0) return 'Today!'
  if (!isFirst && days === 0) return `Same day. ${FULL_DAY_HINT}`
  if (!isFirst && days === 1) return `Consecutive days. ${FULL_DAY_HINT}`
  const d = `${days} day${days === 1 ? '' : 's'}`
  return isFirst ? `${d} since this session` : `${d} between this and the following session`
}
