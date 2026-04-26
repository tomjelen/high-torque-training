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
        className="w-5 h-5 rounded-full border border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-400 text-xs font-mono leading-none flex items-center justify-center cursor-pointer"
        aria-label="Privacy info"
      >
        ?
      </button>
      {open && (
        <div className="absolute right-0 top-7 w-72 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl z-20 text-sm text-slate-300 space-y-3">
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
            className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
