import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV: { path: string; label: string }[] = [
  { path: '/', label: 'Workouts' },
  { path: '/rationale', label: 'Rationale' },
  { path: '/about', label: 'About' },
]

export default function Header() {
  const { pathname } = useLocation()
  const others = NAV.filter((n) => n.path !== pathname)

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-3 flex items-baseline justify-between gap-3">
        <Link to="/" className="font-bold text-base sm:text-lg text-slate-100 no-underline hover:text-white truncate">
          High Torque Training
        </Link>
        <nav className="flex items-baseline gap-2 sm:gap-3 flex-shrink-0 text-sm">
          {others.map((n, i) => (
            <Fragment key={n.path}>
              {i > 0 && <span className="text-slate-600" aria-hidden="true">·</span>}
              <Link to={n.path} className="text-slate-400 no-underline hover:text-slate-200">
                {n.label}
              </Link>
            </Fragment>
          ))}
        </nav>
      </div>
    </header>
  )
}
