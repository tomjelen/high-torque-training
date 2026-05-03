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
