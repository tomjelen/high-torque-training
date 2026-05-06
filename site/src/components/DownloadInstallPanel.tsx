import Panel from './Panel'
import type { AppState } from '../types'

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

const ZIP_HREF = '/workouts/high-torque-workouts.zip'

export default function DownloadInstallPanel({ state, setState }: Props) {
  function onToggle(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, download: { collapsed } } }))
  }

  const zipButton = (
    <a
      href={ZIP_HREF}
      download
      className="inline-block bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-mono px-3 py-1.5 rounded no-underline"
    >
      ⤓ .zip
    </a>
  )

  return (
    <Panel
      heading="Install Zwift workouts"
      teaser="Download all workouts (.zip) — install once, then collapse me"
      headerAction={zipButton}
      collapsed={state.panels.download.collapsed}
      onToggle={onToggle}
    >
      <div className="flex items-center justify-between gap-6 border border-slate-800 rounded bg-slate-950 px-5 py-4 mb-4">
        <p className="text-slate-400 text-sm m-0">
          Download all workouts as a zip, drop them into Zwift's workout folder,{' '}
          <strong className="text-slate-300">done once</strong> — then collapse this panel and forget it.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href={ZIP_HREF}
            download
            className="inline-block bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold font-mono px-4 py-2 rounded no-underline"
          >
            ⤓ Download All (.zip)
          </a>
        </div>
      </div>

      <div className="text-sm">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider m-0 mb-3">Zwift install instructions</p>
        <div className="text-slate-400 space-y-2 pl-3 border-l border-slate-800">
          <p className="m-0">The zip contains five folders — copy them directly into your Zwift workout directory:</p>
          <ul className="m-1 pl-4 space-y-1">
            <li><strong className="text-slate-300">Windows:</strong> <code className="text-orange-400 text-xs">%localAppData%\Zwift\Workouts\[your_user_id]\</code></li>
            <li><strong className="text-slate-300">macOS:</strong> <code className="text-orange-400 text-xs">~/Documents/Zwift/Workouts/[your_user_id]/</code></li>
            <li><strong className="text-slate-300">iOS/Android:</strong> not supported for custom workouts — use a PC/Mac</li>
          </ul>
          <p className="m-1">Restart Zwift. The folders appear under <strong className="text-slate-300">Custom Workouts</strong> in the workout selection screen.</p>
          <p className="m-1">
            All power targets are expressed as a fraction of your FTP (e.g.{' '}
            <code className="text-orange-400 text-xs">0.88</code> = 88% FTP). Keep your FTP up to date in Zwift for accurate targets.
          </p>
        </div>
      </div>
    </Panel>
  )
}
