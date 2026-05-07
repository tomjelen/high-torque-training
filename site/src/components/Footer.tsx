const MY_STRAVA_PROFILE = 'https://www.strava.com/athletes/8943272'
const MY_EMAIL = 'high-torque@jelen.dk'

interface FooterProps {
  lastUpdated: string
  lastUpdatedTooltip: string
}

export default function Footer({ lastUpdated, lastUpdatedTooltip }: FooterProps) {
  return (
    <footer className="border-t border-slate-800 mt-10 pt-5 pb-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-[1440px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 text-sm text-slate-400">
        <div>
          <div className="font-semibold text-slate-200 mb-1">Tom Jelen</div>
          <div className="flex justify-between gap-4 sm:justify-start">
            <a
              href={`mailto:${MY_EMAIL}`}
              className="text-slate-400 hover:text-slate-200 no-underline"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                aria-label="Email"
                className="inline-block w-3.5 h-3.5 mr-1 align-text-bottom fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              {MY_EMAIL}
            </a>
            <a
              href={MY_STRAVA_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 no-underline"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                aria-label="Strava"
                className="inline-block w-3.5 h-3.5 mr-1 align-text-bottom fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Strava
            </a>
          </div>
        </div>

        <p className="text-slate-400 text-sm m-0 sm:flex-1 sm:max-w-md">
          Spotted bad info, a study I've missed, or an idea? Email me — I want to know.
          If your input shapes the rationale, I'll credit you there.
        </p>

        <div
          className="text-slate-500 text-xs text-right whitespace-nowrap cursor-help"
          title={lastUpdatedTooltip}
        >
          Last updated<br />
          {lastUpdated}
        </div>
      </div>
    </footer>
  )
}
