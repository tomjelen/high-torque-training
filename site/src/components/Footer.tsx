// Strava profile URL — update when profile is made public
const STRAVA_URL = 'https://www.strava.com/athletes/'

interface FooterProps {
  lastUpdated: string
}

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t border-slate-800 mt-10 pt-5 pb-8 px-8 mx-auto max-w-[1440px]">
      <div className="flex items-start justify-between gap-6 text-sm text-slate-400">
        <div>
          <div className="font-semibold text-slate-200 mb-1">Tom Jelen</div>
          <div className="flex gap-4">
            <a
              href="mailto:high-torque@jelen.dk"
              className="text-slate-400 hover:text-slate-200 no-underline"
            >
              ✉ high-torque@jelen.dk
            </a>
            <a
              href={STRAVA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 no-underline"
            >
              ◎ Strava
            </a>
          </div>
        </div>

        <p className="text-slate-400 text-sm m-0 flex-1 max-w-md">
          <em>Spotted bad info, a study I've missed, or have an idea for the site?</em>{' '}
          Email me — I want to know.
        </p>

        <div className="text-slate-500 text-xs text-right whitespace-nowrap">
          Last updated<br />
          {lastUpdated}
        </div>
      </div>
    </footer>
  )
}
