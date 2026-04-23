import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const { pathname } = useLocation()
  const onScience = pathname === '/science'

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="mx-auto max-w-[1440px] px-8 py-3 flex items-baseline justify-between">
        <Link to="/" className="font-bold text-lg text-slate-100 no-underline hover:text-white">
          High Torque Training
        </Link>
        <Link
          to={onScience ? '/' : '/science'}
          className="text-sm text-slate-400 no-underline hover:text-slate-200"
        >
          {onScience ? 'Workouts →' : 'Science & Rationale →'}
        </Link>
      </div>
    </header>
  )
}
