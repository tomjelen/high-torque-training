export default function AboutPage() {
  return (
    <article>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mt-6 mb-1">About</h1>
        <p className="text-slate-400 text-sm m-0">Who built this site, and why.</p>
      </div>

      <div className="rationale-content about-content">
        <p>
          I'm <a href="https://www.linkedin.com/in/tom-jelen/">Tom Jelen</a>, an AI/ML engineer
          based in Barcelona. For most of the last decade I co-founded and built{' '}
          <a href="https://abzu.ai">Abzu</a>, working across the full arc from
          core algorithms to client-facing platforms. Our main product, Feyn / QLattice — an
          interpretable ML framework built on symbolic regression — placed 1st on the synthetic
          and 2nd on the real-world track at <a href="https://cavalab.org/srbench/">SRBench</a>
          {' '}(GECCO 2022; <a href="https://arxiv.org/abs/2104.05417">arXiv:2104.05417</a>). The
          common thread, work and otherwise, is methodical curiosity — I learn a domain by digging
          until I understand it well enough to build something in it.
        </p>

        <p>
          I'm also a cyclist — based in Barcelona, where outdoor riding is year-round, and racing
          A/B category on <a href="https://www.strava.com/athletes/8943272">Zwift</a> through the
          winter indoor season. The outdoor events I sign up for tend to be long and climbing-heavy:
          Mallorca 312, La Purito. I train about 10-15 hours a week, give or take. I'm not a coach, and
          this site doesn't pretend to be coaching. But every workout in the library is one I've
          done myself or am currently doing, and the rationale you read here is the same one
          structuring my own training. The site is, in honest terms, a research notebook that
          happens to be useful as a workout library.
        </p>

        <p>
          I built it because I wanted to learn high-torque training, and a site is how I learn.
          The trigger was a climb in Andorra last summer where some pros passed me grinding at a
          cadence that looked wrong to me. I watched{' '}
          <a href="https://www.youtube.com/watch?v=tcar3G2v73I">a podcast</a> that explained what
          they were doing, read the studies it referenced, then the studies those referenced. I
          wrote up what I found, turned the protocols into Zwift workouts so I could actually do
          them, kept reading, kept refining. At some point it became clear the writeups and
          workouts might be useful to other recreational-competitive riders in the same spot — so
          I polished it into this site. Everything here is traceable to a source; where the
          evidence is weak, the rationale page says so.
        </p>
      </div>
    </article>
  )
}
