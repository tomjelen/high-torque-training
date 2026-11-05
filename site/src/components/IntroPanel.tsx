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
      heading="Intro — what, why & who"
      teaser="A 4-week adaptation, then an 8-week build, one torque session a week, then your choice. Every number traced to a source, or marked as my own call."
      collapsed={state.panels.intro.collapsed}
      onToggle={onToggle}
    >
      {/* Full panel width, like the other panels (a capped column inside a
          full-width panel looked off-centre). */}
      <div>
        <p className="text-slate-300 mb-0">
          High-torque training is{' '}
          <strong className="text-slate-100">low cadence at meaningful power</strong>, seated. In an 8-week
          study,<sup className="text-slate-500">1</sup> cyclists who rode their sprint and high-intensity
          intervals at 50–70 rpm improved absolute VO2max by{' '}
          <strong className="text-green-400">+8.7%</strong>, VO2max per kg by{' '}
          <strong className="text-green-400">+8.8%</strong> and max aerobic power by{' '}
          <strong className="text-green-400">+8.1%</strong>, all significant. The same intervals at free cadence
          above 80 rpm gave +4.6% absolute VO2max (significant), but the +3.7% per kg and +3.0% max aerobic power
          were not significant. That is one small study of young women.
        </p>

        <p className="text-slate-300 mt-3 mb-0">
          <strong className="text-slate-100">Why low cadence?</strong> At the same power, each pedal stroke has to
          carry more force: 60 rpm is 1.5 times the force per stroke of 90 rpm. More force per
          stroke also means more load on the knees,<sup className="text-slate-500">2</sup> hence the four-week
          adaptation below, at a controlled, below-threshold effort, before the harder build sessions.
        </p>

        <p className="text-slate-300 mt-3 mb-0">
          <strong className="text-slate-100">Who this is for.</strong> A cyclist doing ~10 hours/week of mixed
          Zwift and outdoor training: fit, consistent, used to structured intervals. Not a beginner, but not a
          full-time athlete either.
        </p>
        <p className="text-slate-300 mt-3 mb-0">
          <strong className="text-slate-100">Who this is not for.</strong>
          <sup className="text-slate-500">3</sup> Riders with a history of overuse injuries, particularly knee
          pain. I read that as including patellar tendinopathy and patellofemoral pain (check with a
          professional).
        </p>
        <p className="text-slate-300 mt-3 mb-0">
          <strong className="text-slate-100">Who's behind it.</strong> I'm Tom, a cyclist, not a coach. Everything
          here comes from named studies and coaches; where none of them gives an answer, I've made the call myself
          and say so. More on the <Link to="/about" className="text-blue-400 hover:text-blue-300">About</Link> page.
        </p>
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
      </div>

      <div className="border-t border-slate-800 mt-4 pt-3 text-sm text-slate-500">
        <p className="mb-0">
          <strong className="text-slate-300">How this site is structured:</strong> two plans, one torque session a
          week: a 4-week adaptation, then an 8-week build. After that, maintain or keep going with free choice
          from the library.
        </p>
        <details className="mt-1 group">
          <summary className="inline-flex items-center min-h-11 sm:min-h-0 sm:py-2 cursor-pointer list-none hover:text-slate-300 select-none">
            Caveats and sourcing ▸
          </summary>
          <div className="mt-2 space-y-3 pl-3 border-l border-slate-800">
            <p className="m-0">
              <sup className="text-slate-500 mr-1">1</sup>
              Hebisz &amp; Hebisz (2024),{' '}
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
              PLoS ONE (full text read). 24 well-trained female cyclists aged 17–20 finished, 12 per group.
              The often-quoted "+8.7% vs +4.6%" is absolute VO2max (litres per minute), not per kg. The
              difference between the groups was significant for max aerobic power and VO2max per kg. The paper
              reports no monitoring of knee pain or injuries, and every hard session was at low cadence, which is
              not the same as adding one torque session a week. The other studies are thin and mixed; the
              rationale page goes through them.
            </p>
            <p className="m-0">
              <sup className="text-slate-500 mr-1">2</sup>
              At second-threshold power, 90 rpm gave a 29% smaller kneecap compressive force than 70 rpm in 12
              competitive cyclists (Bini &amp; Hume 2013, abstract only); applying it to 50–60 rpm is my
              extrapolation. The adaptation weeks combine three coaches' advice for riders new to torque work
              (Wakefield, Henderson, Schep); the combination and the four-week arrangement are mine.
            </p>
            <p className="m-0">
              <sup className="text-slate-500 mr-1">3</sup>
              <a
                href={SOURCES.evoq.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                EVOQ.BIKE
              </a>{' '}
              (coach Landry Bobo) says riders with a history of overuse injuries, particularly knee pain, should avoid
              low-cadence training. Naming patellar tendinopathy and patellofemoral pain is my reading.
            </p>
            <p className="m-0 pt-1">
              <Link to="/rationale" className="text-blue-400 hover:text-blue-300">
                → Read the full rationale and sources
              </Link>
            </p>
          </div>
        </details>
      </div>
    </Panel>
  )
}
