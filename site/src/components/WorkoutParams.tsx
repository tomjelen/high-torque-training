import { Fragment } from 'react'
import type { WorkoutParam } from '../types'

interface Props {
  params: WorkoutParam[]
  tss?: number
}

export default function WorkoutParams({ params, tss }: Props) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs flex-1 mb-3">
      {params.map(({ label, value }) => (
        <Fragment key={label}>
          <dt className="text-slate-500">{label}</dt>
          <dd className="text-slate-300 font-mono text-right m-0">{value}</dd>
        </Fragment>
      ))}
      {tss !== undefined && (
        <>
          <dt className="text-slate-500">Est. TSS</dt>
          <dd className="text-slate-200 font-mono text-right m-0">{tss}</dd>
        </>
      )}
    </dl>
  )
}
