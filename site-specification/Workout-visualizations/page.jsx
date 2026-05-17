// Integrated high-torque.jelen.dk page mock with WorkoutChart embedded
// in each workout card. All existing card copy is preserved verbatim;
// chart slots in below the metadata.
const { WORKOUTS, WorkoutChart } = window;

const byId = (id) => WORKOUTS.find((w) => w.id === id);

// ── helpers ─────────────────────────────────────────────────────────────
function fmtTime(min) {
  if (min < 60) return `~${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `~${h}h ${m}min` : `~${h}h`;
}

// ── shared bits ─────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  return <span className={`tier tier-${tier}`}>{tier === 'A' ? 'ADAPT' : tier}</span>;
}

function Legend() {
  return (
    <div className="legend" aria-label="Chart key">
      <span className="lbl">Chart key</span>
      <span className="item"><span className="sw" style={{ background: '#1AA5DB' }} />Endurance / warmup</span>
      <span className="item"><span className="sw" style={{ background: '#7A7A7A' }} />Recovery / rest</span>
      <span className="item"><span className="sw" style={{ background: '#F4C430' }} />Threshold</span>
      <span className="item"><span className="sw" style={{ background: '#E68A2E' }} />VO2 / 110%</span>
      <span className="item"><span className="sw" style={{ background: '#DC2626' }} />Sprint / max</span>
      <span className="item">
        <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
          <defs>
            <pattern id="legend-hatch" patternUnits="userSpaceOnUse"
                     width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#BA7517" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="14" height="8" fill="#633806" />
          <rect width="14" height="8" fill="url(#legend-hatch)" />
        </svg>
        Cadence target
      </span>
    </div>
  );
}

// ── A workout card – stats grid + chart, then sources/downloads ─────────
// `stats` is a list of {k, v} preserving exactly the metadata each
// section uses on the live site (adapt phase has different keys than
// collection items).
function WorkoutCard({
  workout, state, stats, source, sourceTitle, zwoHref,
  showMarkComplete, doneToday,
}) {
  const stateCls =
    state === 'ACTIVE' ? 'is-active' :
    state === 'LOCKED' ? 'is-locked' : '';
  return (
    <article className={`card ${stateCls}`}>
      <header className="card-head">
        <TierBadge tier={workout.tier} />
        <h3>{workout.title}</h3>
        {state && (
          <span className={`card-state ${state === 'ACTIVE' ? 'is-active' : ''}`}>
            {state}
          </span>
        )}
      </header>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.k} className="stat">
            <span className="k">{s.k}</span>
            <span className="v">{s.v}</span>
          </div>
        ))}
      </div>

      <div className="chart-wrap">
        <WorkoutChart
          workout={workout}
          mode="minimal"
          width={Math.min(680, 760)}
          hatchId={`hatch-${workout.id}`}
        />
      </div>

      <footer className="card-foot">
        <div className="left">
          <a className="src" href={source} title={sourceTitle}>{`[${sourceTitle.split(' — ')[0]}]`}</a>
        </div>
        <div className="right">
          {showMarkComplete && !doneToday && (
            <button type="button" className="markdone">Mark Complete</button>
          )}
          {doneToday && <span className="done-tag">✓ today</span>}
          <a className="dl" href={zwoHref}>⤓ .zwo</a>
        </div>
      </footer>
    </article>
  );
}

// ── "How to read the chart" annotated example (full-mode chart) ─────────
function HowToRead() {
  const w = byId('t2-staple-5x5');
  return (
    <div className="reader">
      <h3>How to read the chart</h3>
      <p>
        Each chart shows the power profile of a session — bars are how hard,
        x-axis is time. The amber hatched bar below the FTP line marks
        intervals where a cadence target is prescribed. Empty space below
        the line means "no specific cadence" (warmup, cooldown, recoveries).
      </p>
      <WorkoutChart workout={w} mode="full" width={680} hatchId="reader-hatch" />
    </div>
  );
}

// ── Adaptation phase card ───────────────────────────────────────────────
function AdaptCard({ id, state, stats, doneToday }) {
  const w = byId(id);
  return (
    <WorkoutCard
      workout={w}
      state={state}
      stats={stats}
      source="https://www.evoq.bike/blog/low-cadence-cycling-how-torque-training-makes-you-faster"
      sourceTitle="EVOQ.BIKE — Low Cadence Cycling: How Torque Training Makes You Faster"
      zwoHref={`/workouts/High Torque - Adaptation/${id}.zwo`}
      showMarkComplete={state === 'ACTIVE'}
      doneToday={doneToday}
    />
  );
}

// ── Collection (T1–T4) card ─────────────────────────────────────────────
function CollectionCard({ id, intervals, cadence, src }) {
  const w = byId(id);
  return (
    <WorkoutCard
      workout={w}
      stats={[
        { k: 'Intervals', v: intervals },
        { k: 'Cadence', v: cadence },
        { k: 'Total time', v: fmtTime(w.durMin) },
        { k: 'Est. TSS', v: w.tss },
      ]}
      source={src.href}
      sourceTitle={src.title}
      zwoHref={`/workouts/${w.id}.zwo`}
      doneToday={false}
    />
  );
}

// ── The page ────────────────────────────────────────────────────────────
function App() {
  return (
    <div className="page">
      <div className="topbar">
        <span className="brand">High Torque Training</span>
        <nav>
          <a href="#">Rationale</a>
          <a href="#">About</a>
        </nav>
      </div>

      <h1>Free training plan for Zwift</h1>

      {/* Collapsed intro panels — preserved as one-line summaries to keep
          the focus on the workout cards. Real site has these expandable. */}
      <section className="pagesec">
        <h2><span className="ix">##</span> Intro — what, why &amp; who
          <span className="caret">▾</span></h2>
        <p className="sub">+8.7% VO2max at low cadence — one small trial, but the cleanest test we have</p>
      </section>

      <section className="pagesec">
        <h2><span className="ix">##</span> Install Zwift workouts
          <span className="caret">▾</span></h2>
        <p className="sub">Download all workouts (.zip) — install once, then collapse me</p>
      </section>

      {/* Adaptation phase – workouts get visualisations now */}
      <section className="sec-open">
        <h2><span className="ix">##</span> Adaptation Phase <span style={{ color: 'rgba(244,245,247,0.42)', fontWeight: 400 }}>· Weeks 1–3 · 0/3</span></h2>
        <p className="secmeta">0/3 complete</p>

        <div className="knee">
          <strong>⚠ Knee protection rules — applies to every session, always.</strong>
          <ol>
            <li><b>Always warm up at normal cadence first</b> (minimum 15 minutes). Don't start a low-cadence interval cold.</li>
            <li><b>If your knees ache during a set, stop the set.</b> Don't push through. End the session if it continues.</li>
            <li><b>Don't go below 50 rpm</b> unless you have months of established low-cadence work behind you.</li>
            <li><b>Never do low-cadence sessions on back-to-back days.</b> The joint needs recovery time.</li>
            <li><b>All intervals are seated.</b> Standing removes the training stimulus and changes the load pattern.</li>
          </ol>
        </div>

        <Legend />

        <AdaptCard id="adapt-w1" state="ACTIVE"
          stats={[
            { k: 'Sets × duration', v: '2 × 10 min' },
            { k: 'Intensity', v: 'Zone 2 (~65% FTP)' },
            { k: 'Cadence', v: '65–70 rpm' },
            { k: 'Recovery', v: '5 min easy spin' },
          ]} />
        <AdaptCard id="adapt-w2" state="LOCKED"
          stats={[
            { k: 'Sets × duration', v: '2 × 15 min' },
            { k: 'Intensity', v: 'Zone 2 (~65% FTP)' },
            { k: 'Cadence', v: '65 rpm' },
            { k: 'Recovery', v: '5 min easy between' },
          ]} />
        <AdaptCard id="adapt-w3" state="LOCKED"
          stats={[
            { k: 'Sets × duration', v: '3 × 10 min' },
            { k: 'Intensity', v: 'Zone 2 (~65% FTP)' },
            { k: 'Cadence', v: '60–65 rpm' },
            { k: 'Recovery', v: '5 min easy between' },
          ]} />
      </section>

      {/* High Torque Collection */}
      <section className="sec-open">
        <h2><span className="ix">##</span> The High Torque Collection</h2>
        <p className="secmeta">12 sessions · sort: tier → title</p>

        <Legend />
        <HowToRead />

        <div className="tier-sub">
          <h3 style={{ color: 'var(--color-text-primary)' }}>Tier 1 — Entry</h3>
          <span className="desc">Tempo torque & short EVOQ staple · first weeks of ongoing training</span>
        </div>
        <CollectionCard
          id="t1-entry"
          intervals="4×4 min @ 80–85% FTP"
          cadence="50–60 rpm"
          src={{ href: 'https://www.fasttalklabs.com/fast-talk/neal-henderson-put-it-in-the-big-gear-we-explore-low-cadence-high-torque-training/',
                 title: 'Henderson — Put It in the Big Gear' }}
        />
        <CollectionCard
          id="t1-staple-3x5"
          intervals="3×5 min @ ~90% FTP"
          cadence="50–60 rpm"
          src={{ href: 'https://www.evoq.bike/blog/low-cadence-cycling-how-torque-training-makes-you-faster',
                 title: 'EVOQ.BIKE* — scaled (3×5 instead of 5×5)' }}
        />

        <div className="tier-sub">
          <h3 style={{ color: 'var(--color-text-primary)' }}>Tier 2 — Development</h3>
          <span className="desc">EVOQ staple format (5×5, 5×8) + scaled Hebisz HIIT intro · bread &amp; butter</span>
        </div>
        <CollectionCard
          id="t2-hiit-intro"
          intervals="3×3 min @ ~110% FTP"
          cadence="60–70 rpm"
          src={{ href: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833',
                 title: 'Hebisz 2024* — scaled intro' }}
        />
        <CollectionCard
          id="t2-staple-5x5"
          intervals="5×5 min @ ~90% FTP"
          cadence="50–60 rpm"
          src={{ href: 'https://www.evoq.bike/blog/low-cadence-cycling-how-torque-training-makes-you-faster',
                 title: 'EVOQ.BIKE — Low Cadence Cycling' }}
        />
        <CollectionCard
          id="t2-staple-5x8"
          intervals="5×8 min @ ~90% FTP"
          cadence="50–60 rpm"
          src={{ href: 'https://www.evoq.bike/blog/low-cadence-cycling-how-torque-training-makes-you-faster',
                 title: 'EVOQ.BIKE — Low Cadence Cycling' }}
        />

        <div className="tier-sub">
          <h3 style={{ color: 'var(--color-text-primary)' }}>Tier 3 — Challenging</h3>
          <span className="desc">Henderson threshold, Hebisz HIIT, Rüegg VO2max · higher knee stress</span>
        </div>
        <CollectionCard
          id="t3-hiit-4"
          intervals="4×4 min @ ~110% FTP"
          cadence="60–70 rpm"
          src={{ href: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833',
                 title: 'Hebisz 2024 — PLOS ONE' }}
        />
        <CollectionCard
          id="t3-ruegg"
          intervals="3×(5 min @ ~110% FTP + 1 min max sprint)"
          cadence="50–60 rpm (sprint at normal cadence)"
          src={{ href: 'https://www.efprocycling.com/tips-recipes/noemi-rueegg-torque-workouts/',
                 title: 'EF Pro — Torque Efforts with Noemi Rüegg' }}
        />
        <CollectionCard
          id="t3-thresh-5x5"
          intervals="5×5 min @ ~95% FTP"
          cadence="50–60 rpm"
          src={{ href: 'https://www.fasttalklabs.com/fast-talk/neal-henderson-put-it-in-the-big-gear-we-explore-low-cadence-high-torque-training/',
                 title: 'Henderson — Put It in the Big Gear' }}
        />

        <div className="tier-sub">
          <h3 style={{ color: 'var(--color-text-primary)' }}>Tier 4 — Advanced</h3>
          <span className="desc">TorqueMax, SIT, full HIIT volume · highest knee stress, monthly at most initially</span>
        </div>
        <CollectionCard
          id="t4-hiit-6"
          intervals="6×4 min @ ~110% FTP"
          cadence="60–70 rpm"
          src={{ href: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833',
                 title: 'Hebisz 2024 — PLOS ONE' }}
        />
        <CollectionCard
          id="t4-sit-2"
          intervals="2×(4×30 sec max)"
          cadence="50–60 rpm"
          src={{ href: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833',
                 title: 'Hebisz 2024 — PLOS ONE' }}
        />
        <CollectionCard
          id="t4-sit-3"
          intervals="3×(4×30 sec max)"
          cadence="50–60 rpm"
          src={{ href: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833',
                 title: 'Hebisz 2024 — PLOS ONE' }}
        />
        <CollectionCard
          id="t4-torquemax"
          intervals="6×2–3 min @ 105–110% FTP"
          cadence="50–60 rpm"
          src={{ href: 'https://www.evoq.bike/blog/low-cadence-cycling-how-torque-training-makes-you-faster',
                 title: 'EVOQ.BIKE — Low Cadence Cycling' }}
        />
      </section>

      {/* Session tracker — preserved unchanged */}
      <section className="tracker" aria-label="Session tracker">
        <h2>Session Tracker</h2>
        <p className="empty">No hard sessions logged yet</p>
        <div className="strip">
          {Array.from({ length: 30 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="strip-axis">
          <span>Last 30 days</span><span>today →</span>
        </div>
        <div className="strip-legend">
          <span><i style={{ background: '#BA7517' }} />hard (T3–T4)</span>
          <span><i style={{ background: 'rgba(186,117,23,0.45)' }} />easy (T1–T2)</span>
        </div>
        <h4 style={{ margin: '18px 0 4px', fontSize: 12, letterSpacing: '0.04em',
                     textTransform: 'uppercase', color: 'rgba(244,245,247,0.65)' }}>
          Recent entries
        </h4>
        <p className="empty" style={{ marginBottom: 0 }}>No sessions logged yet.</p>
      </section>

      <footer className="foot">
        Tom Jelen &nbsp;·&nbsp; <a href="mailto:high-torque@jelen.dk">high-torque@jelen.dk</a>
        &nbsp;·&nbsp; <a href="https://www.strava.com/athletes/8943272">Strava</a>
        <br />
        Last updated 2026-05-02
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
