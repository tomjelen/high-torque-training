import type { ChartBlock, ChartWorkout, Zone } from '../src/components/chart-model'

export const MAX_EFFORT_POWER: number
export function zoneForPower(power: number): Zone
export function blocksFromZwo(
  xml: string,
  filePath: string,
): { title: string; blocks: ChartBlock[] }
export function getChartBlocksMap(): Promise<Record<string, ChartWorkout>>
