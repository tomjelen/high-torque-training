import { Link } from 'react-router-dom'
import Panel from './Panel'
import { SOURCES } from '../data'
import type { AppState } from '../types'

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

export default function IntroPanel({ state, setState }: Props) {
  function onToggle(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, intro: { collapsed } } }))
  }

  return (
    <Panel
      title="Intro — what, why & who"
      teaser="+8.7% VO2max at low cadence — one small trial, but the cleanest test we have"
      collapsed={state.panels.intro.collapsed}
      onToggle={onToggle}
    >
      <p className="text-slate-300 mb-0">
        High-torque training is{' '}
        <strong className="text-slate-100">low cadence at high power</strong>. In an 8-week
        study,<sup className="text-slate-500">1</sup> cyclists doing their high-intensity
        intervals at 50–70 rpm gained{' '}
        <strong className="text-green-400">+8.7% VO2max</strong> and{' '}
        <strong className="text-green-400">+8.1% max aerobic power</strong>, compared with +4.6%
        and +3.0% for the same intervals at freely chosen cadence above 80 rpm. That's a single
        small trial — the cleanest comparison the literature has, but not yet replicated.
      </p>

      <p className="text-slate-300 mt-3 mb-0">
        <strong className="text-slate-100">Why low cadence specifically?</strong> Each pedal
        stroke takes more force, so the same muscles work harder per revolution — pulling in
        higher-threshold motor units that stay quieter at 90 rpm.<sup className="text-slate-500">2</sup>{' '}
        More force per stroke also means more load on knees and tendons, and connective tissue
        adapts slower than your aerobic system.<sup className="text-slate-500">3</sup> Hence the
        adaptation phase below: three weeks at easy power and low cadence before any intensity
        stacks on top.<sup className="text-slate-500">4</sup>
      </p>

      <p className="text-slate-300 mt-3 mb-0">
        <strong className="text-slate-100">Who this is for.</strong> A cyclist doing 10–15
        hours/week of mixed Zwift and outdoor training — fit, consistent, used to structured
        intervals. Likes races on Zwift, but does not have an outdoor race season. Not a
        beginner, but not a full-time athlete either.
      </p>
      <p className="text-slate-300 mt-3 mb-2">
        <strong className="text-slate-100">Who this is not for.</strong>
        <sup className="text-slate-500">5</sup> Skip low-cadence training entirely if any of
        the following applies:
      </p>
      <ul className="text-slate-300 list-disc pl-6 mb-0 space-y-1">
        <li>
          Any history of knee overuse injury, patellar tendinopathy, or patellofemoral pain
          syndrome (PFPS).
        </li>
        <li>You are coming off a rest period or injury.</li>
        <li>
          You already naturally grind at low cadences — the stimulus is reduced and the knee
          stress is higher.
        </li>
      </ul>
      <p className="text-slate-300 mt-3 mb-0">
        Inspired by this {' '}
        <a
          href={SOURCES.roadman.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          Roadman Podcast
        </a>
        .
      </p>

      <div className="border-t border-slate-800 mt-4 pt-3 text-sm text-slate-500">
        <p className="mb-0">
          <strong className="text-slate-300">How this site is structured:</strong> Start with the
          adaptation phase below, then use the collection weekly. 1–2 sessions per week.
        </p>
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none hover:text-slate-300 select-none">
            Caveats and sourcing ▸
          </summary>
          <div className="mt-3 space-y-3 pl-3 border-l border-slate-800">
            <p className="m-0">
              <sup className="text-slate-500 mr-1">1</sup>
              The 8-week study is Hebisz &amp; Hebisz (2024),{' '}
              <a
                href={SOURCES.hebisz2024.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                "Greater improvement in aerobic capacity after a polarized training program
                including cycling interval training at low cadence (50–70 rpm) than freely chosen
                cadence (above 80 rpm),"
              </a>{' '}
              PLOS ONE. n = 24 well-trained junior female cyclists. The directional result is the
              strongest in its body of literature (Hansen &amp; Rønnestad 2017 systematic review
              found no clear benefit for low-cadence training overall) — but it is one trial, and
              has not been replicated.
            </p>
            <p className="m-0">
              <sup className="text-slate-500 mr-1">2</sup>
              Low-cadence HIIT delivers a <em>different</em> stimulus, not necessarily a strictly
              superior one. The same prime movers — quads, glutes, hamstrings — are active at all
              cadences, but at lower cadence each pedal stroke requires more force, which
              preferentially recruits high-threshold (Type II) motor units (Ahlquist 1992; Sarre
              &amp; Lepers 2006). I treat low-cadence HIIT as a high-value complement to standard
              HIIT, not a strict upgrade.
            </p>
            <p className="m-0">
              <sup className="text-slate-500 mr-1">3</sup>
              Joints don't really get "trained" — what adapts is patellar and quadriceps tendon
              stiffness, the muscles around the knee, hip stabilizers, and the neuromuscular
              control of a high-force pedal stroke. All of those adapt slower than VO2max. If you
              have active knee pain or your bike fit isn't dialled, fix that first. The
              adaptation phase won't rescue chronic patellar tendinopathy or a bad fit.
            </p>
            <p className="m-0">
              <sup className="text-slate-500 mr-1">4</sup>
              A note on sourcing: the Hebisz 2024 study itself doesn't include a graduated cadence
              ramp — its participants were monitored junior racers who went straight into 50–60
              rpm intervals after three months of standardized base training. The 3-week
              adaptation phase here follows coaching practice (Wakefield/UAE, Walsh/Roadman,
              Housler/EVOQ), which is universal among coaches who prescribe torque intervals.
            </p>
            <p className="m-0">
              <sup className="text-slate-500 mr-1">5</sup>
              The contraindications follow coach guidance from{' '}
              <a
                href={SOURCES.evoq.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                EVOQ.BIKE
              </a>
              . The knee-history item is the strongest one and is consistent across
              physiotherapy and coaching sources alike.
            </p>
            <p className="m-0 pt-1">
              <Link to="/science" className="text-blue-400 hover:text-blue-300">
                → Read the full rationale and sources on the Science page
              </Link>
            </p>
          </div>
        </details>
      </div>
    </Panel>
  )
}
