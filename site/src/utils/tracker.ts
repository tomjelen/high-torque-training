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

export function formatGapTitle(days: number, isFirst: boolean): string {
  if (isFirst && days === 0) return 'Today!'
  if (!isFirst && days === 0) return 'Same day. Don\'t do HT sessions back-to-back!'
  const d = `${days} day${days === 1 ? '' : 's'}`
  return isFirst ? `${d} since this session` : `${d} between this and the following session`
}
