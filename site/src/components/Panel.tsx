import type { ReactNode, SyntheticEvent } from 'react'

interface PanelProps {
  title: ReactNode
  teaser?: ReactNode
  headerAction?: ReactNode
  collapsed: boolean
  onToggle: (collapsed: boolean) => void
  children: ReactNode
}

export default function Panel({ title, teaser, headerAction, collapsed, onToggle, children }: PanelProps) {
  function handleToggle(e: SyntheticEvent<HTMLDetailsElement>) {
    onToggle(!e.currentTarget.open)
  }

  return (
    <details
      open={!collapsed}
      onToggle={handleToggle}
      className="border border-slate-800 rounded bg-slate-900 mb-4 group"
    >
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none hover:bg-slate-800/50">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-semibold text-slate-100">{title}</span>
          {teaser && collapsed && (
            <span className="text-sm text-slate-500 truncate">{teaser}</span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {headerAction && (
            <span onClick={(e) => e.stopPropagation()}>
              {headerAction}
            </span>
          )}
          <span className="text-slate-500 text-sm group-open:rotate-180 transition-transform inline-block">▾</span>
        </div>
      </summary>
      <div className="px-5 pb-5 pt-1 border-t border-slate-800">
        {children}
      </div>
    </details>
  )
}
