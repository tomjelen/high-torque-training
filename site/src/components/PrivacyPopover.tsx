import { useState, useEffect, useRef } from 'react'

export default function PrivacyPopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 sm:w-6 sm:h-6 rounded-full border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-400 flex items-center justify-center cursor-pointer"
        aria-label="Privacy info"
      >
        {/* Drawn, not typed: a text "?" sits off-centre in some browsers'
            fonts (Tom's Firefox). The path is geometrically centred. */}
        <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8.5 8.5a3.5 3.5 0 1 1 4.9 3.2c-.9.4-1.4 1.1-1.4 2v.8" />
          <circle cx="12" cy="18.5" r="0.6" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-11 sm:top-8 w-72 max-w-[calc(100vw-2rem)] bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl z-20 text-sm text-slate-300 space-y-3">
          <p>
            Your session log lives in <strong className="text-slate-100">this browser only</strong>.
            No account, no server — I don't want to run (or pay for) a backend, and nobody should
            need to identify themselves to use this site.
          </p>
          <p className="text-slate-400">
            Practical consequence: log on the device you check the tracker from. If you log on the
            phone after a ride and then open the site on a laptop, the laptop won't see those entries.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-11 sm:min-h-0 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
