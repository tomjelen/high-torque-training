import { Link } from 'react-router-dom'
import { RATIONALE_SECTIONS } from '../data'
import Cite from './Cite'
import SourcesList from './SourcesList'

// The page body mirrors research/high-torque-training-research.md section by
// section. That document is the source of truth: change it first, then this.
export default function RationalePage() {
  // Capped width: long-form reading, so lines stay near 100 characters on wide screens.
  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mt-6 mb-1">The Science and Rationale</h1>
        <p className="text-slate-400 text-sm m-0">
          A 12-week build, then your choice. Why the workouts are built the way they are, where each number comes
          from, and how solid the evidence is.
        </p>
      </div>

      <div className="rationale-content">
        {RATIONALE_SECTIONS.map((s) => (
          <details key={s.id} id={s.id} open className="border-b border-slate-800 mb-1">
            <summary className="group/sec py-3 cursor-pointer list-none select-none">
              <h2 className="text-xl font-bold text-slate-100 m-0 inline group-hover/sec:text-slate-300">{s.heading}</h2>
            </summary>
            <div className="pb-4">
              {renderBody(s.id)}
            </div>
          </details>
        ))}
      </div>

      <SourcesList />
    </article>
  )
}

function renderBody(id: string) {
  switch (id) {
    case 'who':
      return (
        <>
          <p>
            A cyclist doing ~10 hours/week of mixed Zwift and outdoor training: fit, consistent, used to structured
            intervals. Not a beginner, but not a full-time athlete either.
          </p>
          <p>
            This page explains <strong>why</strong> the training works and where each number comes from. The
            workout library says <strong>what</strong> to ride. The program is a 12-week build (4 weeks of
            adaptation, then 8 weeks of build sessions, one torque session a week), after which you choose: maintain,
            keep going, or stop for a while.
          </p>
        </>
      )

    case 'sources':
      return (
        <>
          <p>Every source on this page carries one of four trust categories:</p>
          <div className="table-scroll" role="region" aria-label="How to read the sources" tabIndex={0}>
          <table>
            <thead>
              <tr><th>Category</th><th>What it means</th><th>Sources here</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Research</strong></td>
                <td>Peer-reviewed studies. Where only the abstract was read, I say "abstract only" and claim nothing beyond it.</td>
                <td>Hebisz 2024, de Pablos 2026, Nimmerichter 2012, Kristoffersen 2014, Barranco-Gil 2024, Hansen &amp; Rønnestad 2017, Ahlquist 1992, Bini &amp; Hume 2013, Johnston 2017</td>
              </tr>
              <tr>
                <td><strong>Elite / pro-team coach</strong></td>
                <td>Coaches who work with elite and WorldTour riders.</td>
                <td>Peter Schep (EF Pro Cycling), John Wakefield (Red Bull – BORA – hansgrohe), Neal Henderson</td>
              </tr>
              <tr>
                <td><strong>Coaching business</strong></td>
                <td>Established coaching companies that publish their methods.</td>
                <td>EVOQ.BIKE (Landry Bobo, Brendan Housler), CTS (Jim Rutberg, Adam Pulford)</td>
              </tr>
              <tr>
                <td><strong>Media relay</strong></td>
                <td>
                  Outlets that report on other people's work. I follow them to their own sources and never use them
                  as the basis for a number. A podcast where the coach speaks (Fast Talk with Henderson, That
                  Triathlon Show with Wakefield, the EVOQ podcast) counts as that coach's source, not as media relay.
                </td>
                <td>Roadman Cycling Podcast, Knowledge is Watt</td>
              </tr>
            </tbody>
          </table>
          </div>
          <p>
            Some coach statements exist only as audio. Two labels mark them: <strong>machine transcript</strong> (my
            own Whisper transcription of the audio: Wakefield on That Triathlon Show, Henderson on Fast Talk) and{' '}
            <strong>auto-captions</strong> (YouTube's automatic captions: the CTS/Pulford video, the EVOQ podcast,
            Roadman). Both are weaker than written text, especially for numbers and for who is speaking;
            auto-captions are the weaker of the two.
          </p>
          <p>
            Zwift facts (zones, FTP bias, ERG behaviour) come from Zwift's own support pages. They are product
            documentation, not training advice, so they sit outside the four categories.
          </p>
          <p>
            Anything labelled <strong>mine</strong> (my choice, my estimate, my reading, my arithmetic) is my own
            call, not taken from a study or coach. I'm a cyclist, not a coach (see <Link to="/about">About</Link>):
            these fill gaps where no source gives an answer. They may rest on sourced inputs, but the result is
            mine.
          </p>
        </>
      )

    case 'core':
      return (
        <>
          <p>
            Most cyclists pedal at 80–100 rpm. Dropping to 50–70 rpm at the same power means each pedal stroke has to
            carry more force. That is what "high torque" means. Torque in newton-metres (Nm) is power × 60 ÷ (2π ×
            cadence): 300 W at 60 rpm is about 48 Nm. At the same power, 60 rpm is 1.5 times the force per stroke of
            90 rpm (my arithmetic). The formula is standard physics, also written out by John Wakefield.
            <Cite sourceKey="wakefieldS2S" />
          </p>
          <p>
            Torque figures on this page assume a 250 W FTP and the middle of the cadence range. They scale in
            proportion to your FTP (mine).
          </p>
          <p>
            <strong>Fibre recruitment (indirect evidence).</strong> In eight men riding 30 min at ~85% of aerobic
            capacity, fast-twitch (type II) fibres lost more glycogen at 50 rpm than at 100 rpm (abstract only). That
            suggests lower cadence at the same effort uses more fast-twitch fibres. It is indirect evidence from one
            small study.<Cite sourceKey="ahlquist1992" />
          </p>
          <p>
            <strong>How much force, really?</strong> In 11 cyclists measured from easy riding up to maximal aerobic
            power, at free, 40, 60 and 80 rpm and in all-out resisted sprints, the force per pedal stroke rose with
            intensity and with lower cadence, but stayed below 54% of the rider's maximum "for all conditions, even
            during the so-called 'torque training'" (abstract only).<Cite sourceKey="barrancoGil2024" /> Torque
            intervals put more force on each stroke than normal riding, but they are endurance work, not strength
            training (see "Torque intervals and the gym" below).
          </p>
        </>
      )

    case 'evidence':
      return (
        <>
          <p>The honest summary (my wording on the studies below):</p>
          <ul>
            <li>
              <strong>High intensity at low cadence</strong> has one small positive trial (Hebisz 2024).
            </li>
            <li>
              <strong>Near-maximal force efforts</strong> have one positive trial (de Pablos 2026, HIGH-Load), but the
              difference between its high- and moderate-load groups was not statistically significant.
            </li>
            <li>
              <strong>Moderate, threshold-level torque sessions</strong> have thin and mixed evidence: a small,
              tentative positive result (Nimmerichter 2012), a null result at 40 rpm (Kristoffersen 2014), and de
              Pablos' moderate group, which showed no significant change within the group but did beat the control
              group on one measure.
            </li>
            <li>
              Hebisz and de Pablos each tested their own multi-week arrangement.{' '}
              <strong>No study has tested this site's arrangement</strong> (the order of the build, the two weeks per
              session, what to do after week 12).
            </li>
          </ul>
          <p>
            The moderate sessions in the build (adaptation, Torque Endurance, Threshold) are{' '}
            <strong>coaching practice</strong>: preparation and muscular endurance. The study with the clearest result
            is about the above-threshold sessions.
          </p>
          <p>
            A 2017 systematic review of seven studies found "no strong evidence for a benefit of training at low
            cadences", and tentatively recommended including low-cadence bouts "at moderate to maximal intensity"
            (abstract only). It searched up to April 2016, so it predates Hebisz 2024 and de Pablos 2026.
            <Cite sourceKey="hansen2017" />
          </p>

          <h4>Hebisz &amp; Hebisz 2024: the key study</h4>
          <p>
            <strong>What they did.</strong> 26 well-trained female cyclists aged 17–20 (two dropped out, 12 per
            group) followed the same 8-week polarised program, built from a 4-day cycle repeated back to back: sprint
            intervals (SIT), high-intensity intervals (HIIT), a long easy ride, an active-rest day. One group rode the
            SIT and HIIT at low cadence, the other at free cadence above 80 rpm. Full text read.
            <Cite sourceKey="hebisz2024" />
          </p>
          <p>
            <strong>Who the riders were.</strong> Before day one they had at least 3 years of training, trained at
            least 10 hours a week, raced at least 15 times a year, and had done 3 months of base training that
            included core work, running with jumping exercises and lower-limb strength training. So "no lead-in" was
            true of the low cadence, not of their preparation.
          </p>
          <p>
            <strong>Where they rode.</strong> Outdoors, uphill on 6–9% grades.
          </p>
          <p>
            <strong>Safety valve.</strong> If a rider's morning heart-rate variability (HRV, a readiness measure) was
            low, that day's HIIT was ridden for the same time at the power of the first ventilatory threshold (VT1,
            roughly the top of easy riding) instead. In the recovery cycles the main set was cut by 50%. This is the
            study's own "tired → turn it down".
          </p>
          <p><strong>What they found:</strong></p>
          <div className="table-scroll" role="region" aria-label="What they found" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>Absolute VO2max change (L/min)</th>
                <th>VO2max per kg change (ml/kg/min)</th>
                <th>Max aerobic power (Pmax) change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Low cadence (50–70 rpm)</td>
                <td><strong>+8.7%</strong> (3.09 → 3.36, significant, p &lt; 0.001)</td>
                <td><strong>+8.8%</strong> (54.5 → 59.3, significant, p &lt; 0.001)</td>
                <td><strong>+8.1%</strong> (268.8 → 290.7 W, significant, p = 0.001)</td>
              </tr>
              <tr>
                <td>Free cadence (&gt;80 rpm)</td>
                <td>+4.6% (3.02 → 3.16, significant, p = 0.032)</td>
                <td>+3.7% (54.4 → 56.4, <strong>not</strong> significant, p = 0.108)</td>
                <td>+3.0% (259.8 → 267.5 W, <strong>not</strong> significant, p = 0.423)</td>
              </tr>
            </tbody>
          </table>
          </div>
          <p>
            Values from Hebisz &amp; Hebisz (2024), Table 2. The often-quoted "+8.7% vs +4.6%" is absolute VO2max
            (litres of oxygen per minute), not VO2max per kg of body weight.
          </p>
          <p>
            The difference between the groups was significant for Pmax (η² = 0.18, p = 0.03) and VO2max per kg (η² =
            0.23, p = 0.02); η² of 0.14 or more is usually called a large effect. In the free-cadence group only
            absolute VO2max (litres per minute) rose significantly. Gross efficiency did not change in either group.
            VT2 was only tested within each group.
          </p>
          <p>
            <strong>Limits.</strong> One small study of young women. The paper reports no monitoring of knee pain or
            injuries. And every hard session was at low cadence for 8 weeks, which is not the same as adding one
            torque session a week to normal training.
          </p>

          <p><strong>The study protocol:</strong></p>
          <div className="table-scroll" role="region" aria-label="The study protocol" tabIndex={0}>
          <table>
            <thead>
              <tr><th>Day</th><th>Session</th><th>Weeks 1–4</th><th>Weeks 5–8</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>SIT</td>
                <td>
                  8 × 30 s maximal at <strong>50–60 rpm</strong> (2 sets of 4), 90 s active rest "similar to the power
                  at VT1", 25 min between sets "also at low intensity". ~80 min including warm-up.
                </td>
                <td>12 × 30 s (3 sets of 4), same rests. ~110 min.</td>
              </tr>
              <tr>
                <td>2</td>
                <td>HIIT</td>
                <td>
                  4 × 4 min at 90–100% of Pmax at <strong>60–70 rpm</strong>, 8 min active rest "at an intensity
                  similar to the power achieved at VT1". ~85 min including warm-up.
                </td>
                <td>6 × 4 min, same intensity and cadence. ~110 min.</td>
              </tr>
              <tr><td>3</td><td>Long easy ride</td><td>long, easy</td><td>longer</td></tr>
              <tr><td>4</td><td>Active rest</td><td>60–80 min at 20% less power than VT1</td><td>same</td></tr>
            </tbody>
          </table>
          </div>
          <p>
            SIT is at <strong>50–60 rpm</strong>, HIIT at <strong>60–70 rpm</strong>. They are not interchangeable.
            The paper gives no reason for the 25-minute break between SIT sets.
          </p>

          <p><strong>Translating the study's intensity to %FTP (mine).</strong></p>
          <p>
            The study gives HIIT as 90–100% of Pmax, where Pmax came from a test with 3-minute steps rising by 40 W
            (which gives a lower "max" than a 1-minute ramp test). It gives no FTP. From the study's own baseline
            values (Table 2: low-cadence group Pmax 268.8 W, VT2 197.7 W, VT1 129.0 W; free-cadence group 259.8,
            195.7, 128.4 W), 90–100% of Pmax is 1.19–1.36 × VT2. Taking FTP ≈ VT2 (the second ventilatory threshold,
            close to FTP), that is <strong>~120–136% FTP</strong>. My HIIT files use ~120%, the bottom of that range.
            In my judgement FTP is usually at or a little below VT2, so the estimate errs on the easy side.{' '}
            <strong>This is my estimate and the most uncertain number in the library.</strong>
          </p>
          <p>
            The same arithmetic puts "similar to VT1" at about 65% FTP (VT1/VT2 = 0.65), so the in-session recoveries
            in HIIT and SIT are ~65% FTP (mine). The study's separate active-rest days were lower, at about 52% FTP by
            the same arithmetic.
          </p>

          <h4>de Pablos 2026: the site's use case</h4>
          <p>
            46 well-trained men, 10 weeks (abstract only). A control group (n = 15) kept their usual training. Two
            groups <strong>added</strong> two torque sessions a week to it: the site's use case.
            <Cite sourceKey="dePablos2026" />
          </p>
          <ul>
            <li>
              <strong>HIGH-Load</strong> (n = 16): all-out pedalling against 70% of maximum dynamic force (the most
              force a rider can put into a stroke). Improved within the group (Wingate sprint peak and mean power,
              maximal aerobic power, ventilatory thresholds, thigh-muscle size) and beat control on Wingate power and
              thigh-muscle size.
            </li>
            <li>
              <strong>LOW-Load</strong> (n = 15): 4-minute intervals against 35% of maximum dynamic force. No
              significant change within the group, but <strong>beat control on Wingate mean power</strong> (p =
              0.008).
            </li>
            <li>
              <strong>HIGH vs LOW: not significantly different.</strong> The authors say HIGH-Load's advantage "should
              be confirmed in larger studies".
            </li>
          </ul>
          <p>
            The abstract gives no cadence, %FTP or rep count for either group, so I cannot say which of my sessions
            LOW-Load resembles. No library workout uses the near-maximal HIGH-Load format, so de Pablos is not
            evidence for my SIT sessions.
          </p>

          <h4>Nimmerichter 2012: a close cousin of Threshold 5×5</h4>
          <p>
            18 male cyclists, 4 weeks, twice a week (abstract only): six 5-minute bouts at the power of the
            respiratory compensation point (roughly threshold), one group uphill at 60 rpm, one on the flat at 100
            rpm, plus a control group. Lab tests showed "no significant group effects". In field time trials the
            60-rpm group gained 4.4% uphill and 1.5% on the flat; the 100-rpm group −1.3% uphill and +2.6% on the
            flat; control +4.0% uphill and −3.5% on the flat. Only the 60-rpm group improved on both, but control
            gained almost as much uphill, and on the flat the 100-rpm group gained more. The authors say the higher
            forces "are potentially beneficial". My reading: <strong>a small trial with a tentative positive
            result.</strong>
            <Cite sourceKey="nimmerichter2012" />
          </p>

          <h4>Kristoffersen 2014: a null result at 40 rpm</h4>
          <p>
            22 well-trained veteran cyclists (mean age ~47), 12 weeks (full text read). The low-cadence group added 5 ×
            6 min at 40 rpm at 73–82% of max heart rate twice a week: no significant effect on any measure. The
            comparison group added 90 min a week at free cadence and the same intensity, and improved. 40 rpm is below
            this site's 50-rpm floor, intensity was set by heart rate, and the comparison group did extra training, so
            it is not a clean "moderate intensity doesn't work" result.
            <Cite sourceKey="kristoffersen2014" />
          </p>
        </>
      )

    case 'floor':
      return (
        <>
          <ul>
            <li>
              <strong>EVOQ (Landry Bobo, written):</strong>{' '}
              <em>"If you go below tempo into zone 2, you probably won't be producing enough torque to make a
              meaningful difference."</em>
              <Cite sourceKey="evoq" />
            </li>
            <li>
              <strong>CTS (Adam Pulford, video, auto-captions):</strong> low cadence at lower power "doesn't make you
              stronger"; go harder than zone 2 to see a benefit.<Cite sourceKey="ctsPulford" />
            </li>
            <li>
              <strong>CTS (Jim Rutberg, written):</strong> tempo or sweet-spot power, 76–85% or 88–94% of threshold,
              at about 50–55 rpm.<Cite sourceKey="ctsRutberg" />
            </li>
            <li>
              <strong>Henderson:</strong> riders just starting do tempo at 75–85% of threshold (machine transcript).
              <Cite sourceKey="henderson" />
            </li>
          </ul>
          <p>
            So every session in the build is at 80% FTP or above. An earlier version of this site began with three
            weeks of Zone 2 low-cadence riding and credited it to EVOQ. EVOQ's article contains no adaptation phase and
            says the opposite. Those sessions put less force on the pedals than ordinary riding at FTP and 90 rpm
            (about 23–25 Nm vs 26.5 Nm, my arithmetic). They were removed.
          </p>
        </>
      )

    case 'gym':
      return (
        <>
          <p>
            Torque intervals are not strength training. Even in "torque training", pedal force stays below about 54%
            of the rider's maximum (abstract only, n = 11).<Cite sourceKey="barrancoGil2024" /> Henderson describes
            long big-gear efforts as "truly a muscular endurance type of thing" (machine transcript; speaker inferred
            from context).<Cite sourceKey="henderson" />
          </p>
          <p>The coaches pair torque work with lifting, in different ways:</p>
          <ul>
            <li>
              <strong>EVOQ (written):</strong> the bulk of torque work in base season "when you are also lifting in
              the gym". EVOQ calls lifting in the morning and doing torque intervals later the same day "totally
              theoretical".<Cite sourceKey="evoq" />
            </li>
            <li>
              <strong>CTS (Pulford, video, auto-captions):</strong> heavy lifting in base, then low-cadence torque
              intervals in the build to "transfer" the strength to the bike. A sequence, not both at once.
              <Cite sourceKey="ctsPulford" />
            </li>
            <li>
              <strong>EF (written):</strong> Noemi Rüegg does gym work (squats, box jumps) in winter and torque work on
              the bike in season.<Cite sourceKey="ef" />
            </li>
            <li>
              <strong>Henderson (machine transcript):</strong> "a firm believer in an appropriate strength and
              conditioning program"; "if you haven't done the gym work, well, this might be too much for you".
              <Cite sourceKey="henderson" />
            </li>
          </ul>
          <p>This site doesn't cover gym training and has no gym programme.</p>
        </>
      )

    case 'knee':
      return (
        <>
          <p>This is the main practical concern.</p>
          <ul>
            <li>
              <strong>What the research shows.</strong> At second-threshold power, 90 rpm gave a 29% smaller kneecap
              (patellofemoral) compressive force than 70 rpm in 12 competitive cyclists; the main knee-joint forces
              were "not largely affected" (abstract only).<Cite sourceKey="bini2013" /> They tested 70 vs 90 rpm only;
              applying it to 50–60 rpm is my extrapolation. A review of knee biomechanics in cycling notes that
              "increasing knee flexion angle can increase forces impacting the knee" and that cadence and workload
              affect the loads around the knee (full text; the reviewed studies were small and of low to moderate
              quality).<Cite sourceKey="johnston2017" />
            </li>
            <li>
              <strong>Who should avoid it.</strong> EVOQ: riders with a history of overuse injuries, particularly knee
              pain, should avoid low-cadence training (written).<Cite sourceKey="evoq" /> I read that as including
              patellar tendinopathy and patellofemoral pain (mine; check with a professional).
            </li>
            <li>
              <strong>Henderson (machine transcript):</strong> "And if it hurts, stop doing it." Riders with
              limitations go to a higher cadence ("70 rpm rather than the 50") and stay seated (less joint
              compression).<Cite sourceKey="henderson" />
            </li>
          </ul>

          <h4>Knee rules</h4>
          <ol>
            <li>
              <strong>All low-cadence intervals are seated.</strong> Henderson's reason is less joint compression
              (machine transcript). My added reason: standing lets body weight push the pedal down, which bypasses
              the muscular effort the session is for (mine).
            </li>
            <li>
              <strong>Warm up at normal cadence</strong> for about 15 minutes first (every file does this; mine).
            </li>
            <li>
              <strong>If your knees ache during an interval, stop the interval.</strong> Don't push through
              (Henderson: "if it hurts, stop doing it").
            </li>
            <li>
              <strong>Knee pain after a session → repeat last week's session</strong> instead of moving on. If it
              keeps coming back, stop torque work and see a professional (mine).
            </li>
            <li>
              <strong>Not below 50 rpm.</strong> No session in the library goes below 50 (mine). Henderson suggests
              riders with limitations go nearer 70 rpm.
            </li>
            <li>
              <strong>Not on consecutive days</strong> (mine, anchored on CTS/Rutberg: beginner and intermediate riders separate muscle-tension workouts by at least a full day). See "After the build".
            </li>
          </ol>
        </>
      )

    case 'build':
      return (
        <>
          <p>
            <strong>One torque session a week.</strong> All other rides at normal cadence. Each session is ridden twice
            (two weeks), then you move on if the move-on rule says yes. Progress counts sessions done, not calendar
            weeks. <strong>The 12-week arrangement (two-week steps, one session a week) is mine.</strong> The order
            comes from the coaches (see "Why this order").
          </p>
          <div className="table-scroll" role="region" aria-label="The 12-week build" tabIndex={0}>
          <table>
            <thead>
              <tr><th>Weeks</th><th>Session</th><th>Source</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>1–2</td>
                <td>Adaptation 4 × 4 min @ 80% FTP, 60–65 rpm, 4 min easy spin</td>
                <td>Wakefield (cadence, 4 × 4, rest = rep); 80% my pick inside Henderson's 75–85% and Schep's 80–85%</td>
                <td>Composite, mine. Wakefield: machine transcript. Schep: written. Henderson: machine transcript.</td>
              </tr>
              <tr>
                <td>3–4</td>
                <td>Adaptation 4 × 4 min @ 80% FTP (inside the coaches' 80–85%), 50–60 rpm, 4 min easy spin</td>
                <td>Henderson (cadence, 75–85%); Schep (80–85%, ~15 min of work); Wakefield (4 × 4, rest = rep)</td>
                <td>
                  Composite, mine. Henderson: machine transcript. Schep: written. Wakefield: machine transcript. 16 min
                  of work is a little under Henderson's "20 or so".
                </td>
              </tr>
              <tr>
                <td>5–6</td>
                <td>Torque Endurance 3 × 8 min @ 95% FTP, 60–70 rpm, 8 min easy spin</td>
                <td>EVOQ / Housler (scaled: 3 reps instead of 4); rest = rep is my choice, as Wakefield and CTS (Rutberg) use</td>
                <td>Housler written. Scaling and recovery mine.</td>
              </tr>
              <tr>
                <td>7–8</td>
                <td>Threshold 5 × 5 min @ 95% FTP, 50–60 rpm, 2:30 easy spin</td>
                <td>Henderson (5 × 5 @ 95%, 50–60 rpm); 2:30 is Henderson's half-time rule, applied by me</td>
                <td>Machine transcript. Derivation mine.</td>
              </tr>
              <tr>
                <td>9–10</td>
                <td>TorqueMax 6 × 2.5 min @ 110% FTP, 50–60 rpm, 4 min easy spin</td>
                <td>EVOQ (Bobo): 2–3 min at 105–110%, 50–60 rpm, start with 6 reps</td>
                <td>Written. 2.5 min and 110% are my picks inside the range; the 4-min recovery is mine.</td>
              </tr>
              <tr>
                <td>11–12</td>
                <td>HIIT 4 × 4 min @ ~120% FTP, 60–70 rpm, 8 min at ~65%</td>
                <td>Hebisz 2024 (4 × 4, 60–70 rpm, 8-min active rest at ~VT1)</td>
                <td>Research. ~120% and ~65% are my estimates from the paper.</td>
              </tr>
            </tbody>
          </table>
          </div>
          <p>
            <strong>Recovery power.</strong> In adaptation, Torque Endurance, Threshold and TorqueMax, the recoveries
            are easy spin at 50% FTP. No source gives an easy-recovery %FTP for these sessions; it is mine. HIIT and
            SIT recoveries follow the study (~65% FTP, my estimate of "similar to VT1").
          </p>

          <h4>Adaptation, weeks 1–4</h4>
          <p>
            <strong>Goal:</strong> get the knees, tendons and legs used to low-cadence force at a controlled,
            below-threshold effort before the build sessions.
          </p>
          <ul>
            <li>
              <strong>Weeks 1–2</strong> rest on John Wakefield (That Triathlon Show #465, machine transcript): riders
              new to torque work start at "around 60, 65" rpm, do "four by fours" the first time, rest as long as the
              rep, and stay "below thresholds".<Cite sourceKey="wakefieldTts465" /> Wakefield gives no %FTP. 80% is
              my pick inside Henderson's 75–85% and Schep's 80–85%. Peter Schep's written entry session ("Begin with
              strength training sessions at 60 rpms at 80 to 85% of your FTP for 15 minutes") is almost the same
              session: the strongest single anchor for weeks 1–2.<Cite sourceKey="ef" />
            </li>
            <li>
              <strong>Weeks 3–4</strong> lower the cadence to 50–60 rpm, Henderson's cadence for riders just starting
              (tempo efforts of 3–5 min at 75–85% of threshold, 3–4 min recovery, about 20 min of work).
              <Cite sourceKey="henderson" />
            </li>
            <li>
              <strong>Wakefield's written version differs.</strong> His Science to Sport article (2026) has a 3-week
              Phase 1 at 55–60 rpm, 5 × 4 min or 3 × 10 min, 8 min rest, RPE 7/10, ~90 min with a 30-min warm-up and
              cool-down, on a 6%+ climb. My weeks 1–2 follow his podcast, not the article.
              <Cite sourceKey="wakefieldS2S" />
            </li>
            <li>
              <strong>How it should feel:</strong> controlled, steady, below your threshold. Heavy legs are normal.
              Wakefield rates his written session 7/10, so it isn't meant to feel easy (my wording, based on his inputs).
            </li>
            <li>
              Peak torque: 30.6 Nm in weeks 1–2 (80% at 62.5 rpm), 34.7 Nm in weeks 3–4 (80% at 55 rpm; 40.6 Nm at
              85% and 50 rpm). My arithmetic, at 250 W FTP.
            </li>
          </ul>

          <h4>Build, weeks 5–12</h4>
          <ul>
            <li>
              <strong>Weeks 5–6, Torque Endurance 3 × 8.</strong> Brendan Housler (EVOQ, written): "Start off with 4 x
              8m @ 95% at 60-70rpm. Eventually move to 50-60rpm, and extend out to 3 x 15m. Aim for 90-105% FTP."
              <Cite sourceKey="housler" /> I start with one rep fewer (scaled: 3 reps instead of 4), same intensity.
              Why: 4 × 8 would double the time under load in one step (16 → 32 min) while power rises from 80–85% to
              95%. 3 × 8 = 24 min of work, between CTS's ~20 min (beginner) and ~30 min (intermediate) time at
              intensity, and CTS says to progress "by adding intervals" (Rutberg, written).
              <Cite sourceKey="ctsRutberg" /> Wakefield's long-interval range starts at three reps ("three or five by
              tens", machine transcript). Peak torque stays about the same as week 4 (~35 Nm at 95% and 65 rpm), but
              time under load rises from 16 to 24 min and power from 80–85% to 95%. So this week is harder than weeks
              3–4, not "the same force, longer". The name "Torque Endurance" is the one used on the EVOQ podcast
              (auto-captions); it isn't Bobo's coinage.<Cite sourceKey="evoqPodcast" />
            </li>
            <li>
              <strong>Weeks 7–8, Threshold 5 × 5.</strong> Henderson (machine transcript): "move into threshold, say
              five by five minutes at say 95% of FTP at that same 50 to 60 rpm". That passage gives no recovery. In
              another passage he gives threshold efforts of 3–6 min at 50–60 rpm "with typically about half time
              recovery". Half of 5 min is 2:30: Henderson's half-time rule, applied by me.
              <Cite sourceKey="henderson" /> EVOQ's written progression for its 5 × 5 staple ("increase power up to
              threshold") also supports 95%.<Cite sourceKey="evoq" /> Peak torque ~41 Nm.
            </li>
            <li>
              <strong>Weeks 9–10, TorqueMax.</strong> EVOQ (Bobo, written): "around 2-3 minutes at 105-110% of FTP and
              around 50-60 rpm", "starting with six repetitions and working up to eight". EVOQ warns: "There is an
              increased risk of injury with these intervals", so do the lower-intensity torque intervals first.
              TorqueMax is EVOQ's extension of the Hebisz study to a new format; <strong>no study has tested
              it.</strong> "TorqueMax" is EVOQ's term ("we have dubbed"). My file: 6 × 2.5 min at 110% (the top of
              EVOQ's range), 55 rpm, 4 min recovery (mine). Peak torque ~48 Nm.<Cite sourceKey="evoq" />
            </li>
            <li>
              <strong>Weeks 11–12, HIIT 4 × 4.</strong> The Hebisz HIIT session at its weeks 1–4 volume: 4 × 4 min at
              60–70 rpm, 8 min active rest. At ~120% FTP (my estimate, see above) it is much harder on the lungs.
              Peak torque depends on cadence: ~41–48 Nm at 70–60 rpm (~44 Nm at 65 rpm). Ridden indoors at a %FTP
              target, not outdoors uphill as in the study.<Cite sourceKey="hebisz2024" />
            </li>
          </ul>

          <h4>Why this order</h4>
          <ul>
            <li>
              <strong>Peter Schep (EF, written):</strong> start at 60 rpm and 80–85% FTP; "If those go well, move on to
              threshold sessions and then go above threshold". The clearest written support for moderate → threshold →
              above threshold.<Cite sourceKey="ef" />
            </li>
            <li>
              <strong>EVOQ (Bobo, written):</strong> do the lower-intensity torque intervals before TorqueMax.
              <Cite sourceKey="evoq" /> <strong>EVOQ podcast (auto-captions):</strong> if you're new, start with torque
              endurance, then "sprinkle in" TorqueMax.<Cite sourceKey="evoqPodcast" />
            </li>
            <li>
              <strong>Housler (written):</strong> the Torque Endurance ladder starts at 4 × 8.
              <Cite sourceKey="housler" />
            </li>
            <li>
              <strong>Henderson (machine transcript):</strong> tempo → threshold → VO2max power,{' '}
              <strong>for sustained efforts</strong>. In a full block he puts short seated and standing big-gear starts{' '}
              <strong>first</strong>, so he is not a source for "maximal efforts last".<Cite sourceKey="henderson" />
            </li>
            <li>
              <strong>CTS (Pulford, video, auto-captions):</strong> low-cadence zone 3–4 work first, then high-force
              zone 5–6 work later in the build.<Cite sourceKey="ctsPulford" />
            </li>
            <li>
              <strong>Hebisz 2024:</strong> 4 HIIT reps before 6; 8 sprints before 12.<Cite sourceKey="hebisz2024" />
            </li>
          </ul>
          <p>The two-weeks-per-session arrangement and the week counts are mine.</p>
          <p>
            <strong>How the load steps up</strong> (my arithmetic, 250 W FTP): peak torque per stroke goes 30.6 → 34.7
            → 34.9 → 41.2 → 47.7 → 44.1 Nm (+13%, 0%, +18%, +16%, −8%). Total torque × time goes ≈ 490 → 555 → 838 →
            1,030 → 716 → 705 Nm·min. Weeks 5–6 are the biggest step in total load, which is why Torque Endurance is
            scaled to 3 reps there.
          </p>

          <h4>The move-on rule (mine)</h4>
          <p>After the second session of a step, move to the next step only if all three are true:</p>
          <ol>
            <li>Your knees were fine, during and after.</li>
            <li>You held the cadence.</li>
            <li>You weren't wrecked the next day.</li>
          </ol>
          <p>
            Any "no" → repeat last week's session. The rule is mine. The nearest sources are the Roadman Cycling
            Podcast's "push down towards that 50 rpm if your joints feel good" (media relay, auto-captions; the speaker
            is presumed to be host Anthony Walsh)<Cite sourceKey="roadman" /> and Henderson's "if it hurts, stop doing
            it" (machine transcript).<Cite sourceKey="henderson" />
          </p>

          <h4>After a break</h4>
          <p>
            After illness or travel, the weeks 3–4 session is a good one to come back with. This is a suggestion, not a
            rule (mine). After a long break, restart from adaptation or from week 5, as you see fit (mine).
          </p>
        </>
      )

    case 'after':
      return (
        <>
          <p>After week 12 you choose:</p>
          <ul>
            <li>
              <strong>Maintain:</strong> about one torque session a month. EVOQ (written) gives "1-2x per month
              depending on your training schedule is sufficient" during the race season; I use it as the maintenance
              option (mine).<Cite sourceKey="evoq" />
            </li>
            <li>
              <strong>Keep going:</strong> 1–2 sessions a week, <strong>never on consecutive days</strong> (mine,
              combining these). CTS (Jim Rutberg, written): beginner and intermediate riders "should separate MT
              workouts by at least a full day"; "Experienced and/or advanced riders can often do MuscleTension
              intervals on back-to-back days".<Cite sourceKey="ctsRutberg" /> Henderson (machine transcript):
              "Generally I do about one of these sessions a week at most two", because it is "a bit more stressful
              from a muscular skeletal standpoint"; he has never asked anyone to do two days in a row, though he adds
              "maybe it could work".<Cite sourceKey="henderson" /> EVOQ (written): start with one day a week and work
              up to two.<Cite sourceKey="evoq" />
            </li>
          </ul>
          <p>
            <strong>Free choice from the library.</strong> After week 12 there is no rotation and no "next session".
            Pick from the ten library workouts (TE 3×8, TE 4×8, TE 3×15, Threshold 5×5, TorqueMax, Rüegg, HIIT 4×4,
            HIIT 6×4, SIT 2 sets, SIT 3 sets). A few plain hints (mine): mix moderate sessions (Torque Endurance,
            Threshold) with above-threshold ones (TorqueMax, Rüegg, HIIT, SIT); the smaller and bigger variants are
            useful when you swap one session of another training plan for one of these at a similar load.
          </p>
          <p>
            <strong>Where the evidence ends.</strong> The research backs particular workouts (Hebisz: HIIT and SIT; de
            Pablos: near-maximal efforts), each tested inside its own multi-week program. No study tested this site's
            arrangement. The build order comes from the coaches; the week counts are mine; after week 12 no source
            says what order to ride things in. Each workout keeps its own source label.
          </p>
          <p>
            <strong>Fitting it into ~10 hours/week (mine).</strong> de Pablos' riders added two sessions to their usual
            training. At ~10 hours/week, swapping a torque session for one of your existing interval sessions is
            usually easier than adding one on top. Keep the long endurance ride and all other rides at normal cadence.
            All targets are %FTP, so they scale when your FTP changes.
          </p>

          <h4>The sessions after the build</h4>
          <ul>
            <li>
              <strong>TE 4×8</strong> at 95%, 60–70 rpm, 8 min easy spin: Housler's unscaled start (EVOQ, written).
              <Cite sourceKey="housler" />
            </li>
            <li>
              <strong>TE 3×15</strong> at 90%, 50–60 rpm (file 55), 15 min easy spin: Housler's later step
              ("Eventually move to 50-60rpm, and extend out to 3 x 15m"), at the floor of his 90–105% range (my
              choice). 45 min of work is above CTS's ~40 min for advanced riders, and its 15-min reps are longer than
              CTS's 5–10 min.<Cite sourceKey="housler" /><Cite sourceKey="ctsRutberg" />
            </li>
            <li>
              <strong>Rüegg VO2max + sprint:</strong> Noemi Rüegg's session, published by EF: 3 × 5 min at 50–60 rpm
              at "VO2 max pace" (EF: 106–120% FTP), 10 min easy between, with an optional 1-min max effort in a lighter
              gear at the end of each effort. My file: 110% at 55 rpm (inside EF's range), 3 efforts (EF's text says
              3–5), shorter warm-up and cool-down than EF's 30 min each (scaled for Zwift).<Cite sourceKey="ef" />
            </li>
            <li>
              <strong>HIIT 6×4:</strong> the Hebisz weeks 5–8 volume, same intensity and recoveries as HIIT 4×4.
              <Cite sourceKey="hebisz2024" />
            </li>
            <li>
              <strong>SIT 2 sets / 3 sets:</strong> the Hebisz SIT session at its weeks 1–4 (8 sprints) and weeks 5–8
              (12 sprints) volumes, 50–60 rpm. The sprints are free-ride blocks with no power target; you set the
              force. 90 s at ~65% between sprints; the 25-min break between sets is also at ~65% (mine: the paper says
              only "also at low intensity" and gives no reason for the length). No lead-in session exists in any
              source; the study riders did it from day one, after the preparation described above. The Rüegg sprint is
              in a light gear at free cadence, so it is not a lead-in to SIT.<Cite sourceKey="hebisz2024" />
            </li>
          </ul>

          <h4>Seasons</h4>
          <p>The coach sources run torque work as a block or with a seasonal emphasis:</p>
          <ul>
            <li>
              <strong>CTS (Pulford, video, auto-captions):</strong> "Everything has a season including torque
              training": heavy lifting in base, low-cadence zone 3–4 work for a few weeks in the build, then a block of
              zone 5–6 low-cadence work.<Cite sourceKey="ctsPulford" />
            </li>
            <li>
              <strong>CTS (Rutberg, written):</strong> "a two to three-week block" of these intervals.
              <Cite sourceKey="ctsRutberg" />
            </li>
            <li>
              <strong>Wakefield (written):</strong> a 3-week Phase 1.<Cite sourceKey="wakefieldS2S" />
            </li>
            <li>
              <strong>EVOQ (written):</strong> year-round, with the bulk in base and 1–2 sessions a month in season.
              <Cite sourceKey="evoq" />
            </li>
          </ul>
          <p>
            Taking a break from torque work, and coming back later, fits these sources (my reading). This site
            doesn't say when your season starts. The plan and the tracker work the same whenever you begin.
          </p>
        </>
      )

    case 'zwift':
      return (
        <>
          <p>
            <strong>The %FTP numbers are the sources' own.</strong> They are already prescribed at low cadence, so I
            don't lower them further. (On the EVOQ podcast, auto-captions only, the coaches say low-cadence threshold is
            "most likely going to be lower" than at normal cadence; the source numbers already allow for that.)
            <Cite sourceKey="evoqPodcast" /> HIIT at ~120% is the exception: it is my estimate, so it is the most
            uncertain.
          </p>
          <p>
            <strong>Tired? Turn it down.</strong> With ERG on, Zwift lets you change the workout intensity ("FTP
            bias") by ±25% during a workout, so 75–125% of the file's targets, from the Companion app or in game (Zwift
            support, "Workout Mode for Cycling"). The Hebisz study did the same thing in its own way: on a low HRV
            morning, that day's HIIT was ridden at VT1 power.
          </p>
          <p>
            <strong>ERG at low cadence has a trap.</strong> In ERG the trainer raises the resistance when your cadence
            drops, to hold the target power (Zwift support, "ERG Mode in Workouts"). At low cadence that can spiral:
            cadence sags → resistance climbs → cadence sags more → you stall. Keep the pedals turning steadily through
            the block. Zwift doesn't end the block when you stall, but restarting a heavy gear at low cadence is hard,
            so in practice a stall tends to cost you the rest of that interval (mine). Riders used to hard Zwift
            workouts know this; newcomers should expect it.
          </p>
          <p>
            <strong>If your cadence sags or you stall (my tip, not yet tested in Zwift).</strong> Lower the workout
            intensity, or switch ERG off from the action bar, spin up to a cadence you can hold, then switch ERG back
            on or raise the intensity again. Zwift gives no stall procedure; this is mine, built on Zwift's own
            controls. Adaptation weeks 1–4 (at 80%) are the low-stakes place to learn ERG at low cadence.
          </p>
          <p>
            <strong>Riding by feel is a fine alternative.</strong> CTS (Rutberg, written) prefers "level" or
            "resistance" mode to ERG for these intervals, and says ERG can help beginners focus on cadence.
            <Cite sourceKey="ctsRutberg" /> On the EVOQ podcast (auto-captions only) the advice is to ride by effort or
            a torque number: "ignore the watts a little bit and just make it hard".<Cite sourceKey="evoqPodcast" />
          </p>
        </>
      )

    case 'people':
      return (
        <>
          <p>
            The sessions on this site come from these people; the arrangement, the labelled composites and the Zwift
            files are mine. Roles are as their own
            pages or the cited source state them.
          </p>
          <h4>Research</h4>
          <ul>
            <li>
              <strong>R. Hebisz and P. Hebisz</strong>: authors of the 2024 PLoS ONE study behind the HIIT and SIT
              sessions.<Cite sourceKey="hebisz2024" />
            </li>
            <li>
              <strong>R. de Pablos, P.L. Valenzuela, A. Martínez-Cava, L.B. Alejo, C. Revuelta, I.R.
              Sánchez-Redondo, D. Barranco-Gil and J.G. Pallarés</strong>: authors of the 2026 trial that added torque
              sessions to riders' usual training.<Cite sourceKey="dePablos2026" />
            </li>
          </ul>
          <h4>Elite / pro-team</h4>
          <ul>
            <li>
              <strong>Peter Schep</strong>: EF Pro Cycling Head of Performance (as of EF's article). The progression
              advice (start at 60 rpm and 80–85% FTP, then threshold, then above threshold) is his.
              <Cite sourceKey="ef" />
            </li>
            <li>
              <strong>Noemi Rüegg</strong>: EF Education-Cannondale rider, a Swiss sprinter (a rider, not a coach).
              The 3 × 5 min VO2max torque session is hers; the 106–120% FTP range and the sprint variation are EF's
              article text.<Cite sourceKey="ef" />
            </li>
            <li>
              <strong>John Wakefield</strong>: Science to Sport coach and co-founder; Director of Coaching, Sports
              Science and Technical Development at Red Bull – BORA – hansgrohe; previously 4 years at UAE Team
              Emirates (his own author bio). Source for the weeks 1–2 cadence, the 4 × 4 and rest = rep.
              <Cite sourceKey="wakefieldTts465" />
            </li>
            <li>
              <strong>Neal Henderson</strong>: head of sports science at Wahoo at the time of Fast Talk episode 125
              (August 2020); coaches elite and WorldTour athletes (host intro, machine transcript). Source for the weeks
              3–4 cadence and intensity, Threshold 5×5 and the half-time rule.<Cite sourceKey="henderson" />
            </li>
          </ul>
          <h4>Coaching business</h4>
          <ul>
            <li>
              <strong>Landry Bobo</strong> (EVOQ.BIKE): EVOQ senior leader and coach; races in the elite categories;
              Master's degree in Exercise Science from Appalachian State University. Author of EVOQ's low-cadence blog,
              the source for TorqueMax (EVOQ's term) and the intensity floor.<Cite sourceKey="evoq" />
            </li>
            <li>
              <strong>Brendan Housler</strong> (EVOQ.BIKE): EVOQ president, coach and owner; 13× P/1 State Champion;
              4 Master's National Championships; has coached over 250 cyclists one-to-one. Source for Torque
              Endurance.<Cite sourceKey="housler" />
            </li>
            <li>
              <strong>Jim Rutberg</strong> (CTS): long-time CTS coach and co-author of <em>The Time-Crunched
              Cyclist</em>; wrote the CTS MuscleTension article (rest = rep, time-at-intensity dose, separating
              sessions by a full day, resistance mode vs ERG).<Cite sourceKey="ctsRutberg" />
            </li>
            <li>
              <strong>Adam Pulford</strong> (CTS): the CTS video on torque training (auto-captions): the intensity
              floor, lifting in base, and the seasonal arrangement.<Cite sourceKey="ctsPulford" />
            </li>
          </ul>
          <h4>Media</h4>
          <ul>
            <li>
              <strong>Roadman Cycling Podcast</strong>: the episode that got this site started, and the nearest source
              for the move-on rule only.<Cite sourceKey="roadman" />
            </li>
          </ul>
        </>
      )

    case 'confidence':
      return (
        <>
          <p>How solid each claim is, and what would change it.</p>
          <div className="table-scroll" role="region" aria-label="What I'd update this document for" tabIndex={0}>
          <table>
            <thead>
              <tr><th>Claim</th><th>Confidence</th><th>What would change it</th></tr>
            </thead>
            <tbody>
              {CONFIDENCE_ROWS.map(([claim, confidence, change]) => (
                <tr key={claim}>
                  <td>{claim}</td>
                  <td>{confidence}</td>
                  <td>{change}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )

    default:
      return null
  }
}

// Verbatim from the research doc's confidence table.
const CONFIDENCE_ROWS: [string, string, string][] = [
  [
    'Low cadence beat free cadence for VO2max and Pmax in HIIT and SIT (Hebisz 2024)',
    "Low-medium: one small study of young women; the free-cadence group's VO2max-per-kg and Pmax changes were not significant",
    'Replication in larger, mixed-gender, recreational groups',
  ],
  [
    'The best evidence is for high intensity at low cadence',
    'Medium: Hebisz positive; de Pablos HIGH-Load positive but not significantly better than LOW-Load; Nimmerichter small positive at threshold',
    'A trial comparing moderate and high intensity at low cadence head to head, with cadence and %FTP reported',
  ],
  [
    'Moderate, threshold-level torque sessions help',
    'Low: thin and mixed (Nimmerichter 2012 small positive; Kristoffersen 2014 null at 40 rpm; de Pablos LOW-Load no significant within-group change but beat control on Wingate mean power)',
    'The de Pablos full text (cadence, %FTP); a larger trial of threshold torque intervals',
  ],
  [
    'Adding torque sessions to normal training helps',
    'Low-medium: de Pablos 2026 tested exactly this (2 a week added, abstract only)',
    'The full paper; replication',
  ],
  [
    'Zone 2 low-cadence work is too easy to count',
    'Medium: EVOQ (written), CTS (Pulford, auto-captions), my torque arithmetic; no trial',
    'A study showing Zone 2 low-cadence work improves performance',
  ],
  [
    'Torque intervals are not strength training',
    'Medium: Barranco-Gil 2024 (abstract only, n = 11)',
    'Full text; force data from other groups',
  ],
  [
    'Knee load rises at low cadence',
    'Medium: Bini & Hume 2013 (70 vs 90 rpm, abstract only), Johnston 2017 review of small studies; 50–60 rpm is my extrapolation; Hebisz 2024 did not monitor injuries',
    'Knee-force or injury data at 50–60 rpm',
  ],
  [
    'Seated only',
    'Henderson (machine transcript): seated, for less joint compression; making it a rule for every interval is mine',
    'Evidence that standing low-cadence work is as safe and as useful',
  ],
  [
    'The 4-week adaptation is enough',
    'Low: my arrangement of coach sessions (Wakefield, Henderson, Schep)',
    'Injury data from structured torque programs; a study of gradual vs fast introduction',
  ],
  [
    'The build order (moderate → threshold → above threshold)',
    'Medium: Schep and EVOQ (written), Henderson for sustained efforts (machine transcript), CTS/Pulford (auto-captions)',
    'Coach sources that order it differently, or a study',
  ],
  [
    'Two weeks per step, and the move-on rule',
    'Low: mine',
    'Rider feedback; a coach source that gives step lengths',
  ],
  [
    'HIIT at ~120% FTP',
    "Low: my estimate from the paper's Table 2 (FTP ≈ VT2 assumed)",
    'A study or coach that maps Pmax from a 3-min step test to FTP',
  ],
  [
    '1–2 sessions a week, not on consecutive days',
    'Medium: CTS (Rutberg, written), EVOQ (written), Henderson (machine transcript); no trial',
    'A dose-response study',
  ],
  [
    'About one session a month maintains the gains',
    'Low-medium: EVOQ (written, about the race season); no trial',
    'A detraining or maintenance study',
  ],
  [
    'What to ride after week 12',
    'None: no source says; free choice is mine',
    'A study or coach source on sequencing after a build',
  ],
  [
    'Applies to recreational male riders',
    'Unknown: Hebisz studied young competitive women; de Pablos well-trained men',
    'Studies in non-elite, mixed-gender or masters riders',
  ],
]
