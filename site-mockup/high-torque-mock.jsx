import { useState, useEffect } from "react";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const SOURCES = {
  hebisz: {
    short: "Hebisz & Hebisz (2024)",
    full: "Hebisz R & Hebisz P. Greater improvement in aerobic capacity after a polarized training program including cycling interval training at low cadence (50–70 RPM) than freely chosen cadence (above 80 RPM). PLoS ONE, 2024; 19(11):e0311833.",
  },
  wakefield: {
    short: "Wakefield / Rouleur",
    full: "John Wakefield (Performance Coach, UAE Team Emirates). Interview: 'May the Torque Be With You'. Rouleur Performance, 2022.",
  },
  henderson: {
    short: "Henderson / Fast Talk Labs",
    full: "Neal Henderson (Head Coach, Apex Coaching). 'Put It in the Big Gear — Low-Cadence, High-Torque Training'. Fast Talk Labs Podcast.",
  },
  schep: {
    short: "Schep / EF Pro Cycling",
    full: "Peter Schep (Head of Performance, EF Pro Cycling). 'Pro Workouts: Torque Efforts with Noemi Rueegg'. EF Pro Cycling, 2023.",
  },
  bora: {
    short: "Wakefield / Bora-Hansgrohe",
    full: "Bora-Hansgrohe coach interview. 'Torque Training for Cyclists'. Ambishious.co.nz, 2024.",
  },
  evoq: {
    short: "EVOQ.BIKE",
    full: "Matt Rowe (EVOQ.BIKE). 'Low Cadence Cycling: How Torque Training Makes You Faster'. EVOQ.BIKE Blog, 2024.",
  },
  cts: {
    short: "CTS / Carmichael",
    full: "Chris Carmichael Training Systems. 'To Climb Faster, Start With This Low-Cadence High-Torque Cycling Workout'. trainright.com.",
  },
  mot: {
    short: "Masters of Tri",
    full: "Masters of Tri. 'Big Gear Work – Low Cadence / High Torque'. mastersoftri.com, 2021.",
  },
  wkg: {
    short: "W/KG (Wattkoden)",
    full: "W/KG (Wattkoden AS). 'Have Low Cadence Training Come Full Circle?'. wattkg.com, November 2024.",
  },
};

const OVERVIEW_SECTIONS = [
  {
    heading: "What is torque training?",
    body: [
      {
        text: "Cycling power is the product of torque and cadence (Power = Torque × Cadence). Most cyclists chase power by increasing cadence — spinning 90+ RPM at moderate resistance. Torque training flips this: you push a much bigger gear at 50–60 RPM, forcing the muscles to generate substantially more force per pedal stroke at the same or lower power output.",
      },
      {
        text: "The term used in Norwegian pro cycling tradition is styrketråkk — literally 'strength pedaling'. It has been a quiet staple of World Tour training for decades, prescribed by coaches at Ineos, UAE Team Emirates, Bora-Hansgrohe, and EF Pro Cycling among others, despite the formal science lagging significantly behind practice.",
        cite: "wkg",
      },
    ],
  },
  {
    heading: "Why does it work? The physiology",
    body: [
      {
        text: "The primary mechanism is muscle fibre recruitment. At low cadence and high torque, your legs cannot get away with using only slow-twitch (Type I) fibres — they are forced to recruit fast-twitch Type 2A and 2B fibres as well. With repeated aerobic torque training, these fast-twitch fibres develop greater oxidative (aerobic) capacity. Effectively, you are training fibres that were previously only useful for short bursts to contribute meaningfully to sustained aerobic power.",
        cite: "mot",
      },
      {
        text: "A second well-documented benefit is VLamax reduction. VLamax (maximal lactate production rate) is a measure of glycolytic power — how quickly your muscles produce lactate under high load. A lower VLamax means less lactate accumulation at a given intensity, which raises your effective threshold. Low cadence / high torque training is considered one of the most potent on-bike interventions for achieving this.",
        cite: "mot",
      },
      {
        text: "There is also a biomechanical argument: below 60 RPM, the hip musculature (glutes, hip extensors) takes on significantly more of the load than at higher cadences, where forces concentrate through the knee. This redistribution is both the source of the training stimulus and the reason why knee injury risk rises if progression is too aggressive.",
        cite: "mot",
      },
    ],
  },
  {
    heading: "The study behind this plan",
    body: [
      {
        text: "The 2024 Hebisz & Hebisz paper (PLoS ONE) is the most directly relevant published evidence. 24 well-trained female cyclists (17–20 years old, 10+ hrs/week, 15+ races/year) followed an identical 8-week polarized training programme. The only difference: one group performed sprint and high-intensity intervals at 50–70 RPM; the other at freely chosen cadence above 80 RPM. Results: VO₂max +8.7% vs +4.6%, VT1 power +21.8% vs +7.9%, VT2 power +17.5% vs +3.7%, maximal aerobic power +8.1% vs +3.0%.",
        cite: "hebisz",
      },
      {
        text: "The effect size is large — but interpret carefully. The experiment followed a period of exclusively low-intensity training, meaning any added intensity would produce gains; the gap between groups may be smaller in athletes already doing regular high-intensity work. Sample size was modest (24 riders, all female, all young). And the cadences used (50–70 RPM) are actually higher than what World Tour coaches prescribe in practice — anecdotal protocols target 40–60 RPM, with torque (Nm) as the monitored output rather than power or heart rate.",
        cite: "wkg",
      },
      {
        text: "The broader literature is mixed. Multiple studies found no significant advantage of low-cadence training over other modalities, and evidence overall remains conflicting. The honest position: directionally convincing, not yet definitive. Many coaches argue the right protocols simply have not been formally studied yet, and the science is lagging behind real-world practice by at least a decade.",
        cite: "wkg",
      },
    ],
  },
  {
    heading: "What to realistically expect",
    body: [
      {
        text: "Most coaches who prescribe this consistently report power gains across multiple durations, particularly in sustained climbing (3–20 min efforts) and from-slow-speed accelerations. The largest returns tend to appear at threshold and just above — exactly where Zwift A/B racing is decided.",
        cite: "bora",
      },
      {
        text: "Gains take 4–6 weeks to appear. Do not expect to feel stronger in week 2. The structural adaptations — fibre oxidative capacity, connective tissue tolerance — build slowly and invisibly. What may appear sooner is that low-cadence efforts (steep climbs, slow surges) simply feel less violent, as your legs develop fluency at lower RPM.",
      },
      {
        text: "This is an addition to your training, not a replacement. It does not substitute for gym-based strength work, and should not crowd out Z2 volume or threshold sessions. It replaces one or two sweetspot/threshold intervals per week.",
        cite: "cts",
      },
    ],
  },
  {
    heading: "Who should NOT do this",
    body: [
      {
        text: "Anyone with a history of knee overuse injuries should avoid or be very conservative. Anyone whose bike fit is not properly dialed — particularly saddle height (too low concentrates knee shear force dramatically). Cyclists who already naturally grind at low cadence do not need torque training; they need high-cadence aerobic development instead.",
        cite: "evoq",
      },
      {
        text: "Athletes from strength sports backgrounds (former team sports, powerlifting, heavy gym work) often already have high torque production and would benefit more from aerobic engine development than further force training.",
        cite: "evoq",
      },
    ],
  },
];

const PHASE_NOTES = [
  {
    phase: "Phase 1 — Introduction",
    color: "#4ade80",
    rationale: "The opening phase is deliberately conservative. The primary risk with torque training is connective tissue load — tendons, ligaments, and cartilage around the knee adapt more slowly than muscle, and this is the most common site of overuse injury with this type of training. The goal of weeks 1–3 is to accumulate torque stimulus while staying well within tissue tolerance.",
    bullets: [
      {
        text: "Cadence set at 55 RPM, not lower. UAE Team Emirates coach John Wakefield is explicit on this: going below 50 RPM before connective tissue is adapted is the main cause of knee soreness and injury. 50–55 RPM is the safe entry point for most trained athletes.",
        cite: "wakefield",
      },
      {
        text: "Intensity set at 85–87% FTP (sweetspot/tempo). This is the floor for meaningful torque stimulus. Below Z3/tempo, the load per pedal stroke is simply too light to force significant fibre recruitment changes.",
        cite: "evoq",
      },
      {
        text: "EF Pro Cycling's Head of Performance Peter Schep explicitly recommends starting at 80–85% FTP at 60 RPM before progressing. This plan opens slightly below 60 RPM but matches the power prescription closely.",
        cite: "schep",
      },
      {
        text: "Two sessions per week is the standard World Tour loading pattern for dedicated torque blocks. More than this does not appear to add benefit and meaningfully increases injury risk.",
        cite: "bora",
      },
    ],
    caveats: "If either session in Week 1 produces any knee discomfort — even mild — do not advance to Week 2. Stay at Week 1 parameters until it fully resolves. Ascending cadence while maintaining the same power is the correct response to knee discomfort.",
  },
  {
    phase: "Phase 2 — Building",
    color: "#fb923c",
    rationale: "With the connective tissue base from Phase 1 established, Phase 2 steps up both the cadence reduction (to 50 RPM) and intensity (to threshold and just above). This is the core of the programme — the stimulus that produced the large VO₂max and threshold gains in the Hebisz study was in this intensity and cadence range. The hip musculature now contributes significantly, which is both the point and the risk.",
    bullets: [
      {
        text: "Cadence drops to 50 RPM. At this cadence the hip musculature (glutes, hip extensors) begins dominating the power stroke significantly more than at 55 RPM. This changes the muscular recruitment pattern in a way that delivers the core torque adaptation.",
        cite: "mot",
      },
      {
        text: "Week 6 adds a 30-second sprint at normal cadence immediately after each 10-minute torque interval. This 'transfer' sprint is a standard World Tour add-on: it forces the neuromuscular system to immediately express the torque-trained strength at race cadence, building the bridge between low-RPM strength and high-RPM power.",
        cite: "bora",
      },
      {
        text: "Intensity targets 90–95% FTP across this phase. This mirrors the Hebisz study protocol (90–100% of maximal aerobic power) and sits at the zone where torque training most clearly outperforms free-cadence training in the published evidence.",
        cite: "hebisz",
      },
      {
        text: "Week 5 reaches 5×10 minutes — the highest volume of the entire block. Recovery demand is substantially higher than an equivalent-power free-cadence session at the same wattage. Do not schedule these within 24 hours of a hard race or a dedicated threshold session.",
      },
    ],
    caveats: "Neal Henderson (coach to World Champions including multiple Grand Tour contenders) is unambiguous: any knee pain during big-gear work means stopping the session immediately and returning to normal cadence. Not 'pushing through'. If pain recurs across sessions, return to Phase 1 cadence.",
  },
  {
    phase: "Phase 3 — TorqueMax",
    color: "#f87171",
    rationale: "This phase is optional and carries meaningful injury risk. TorqueMax intervals — above-threshold, low-cadence efforts — are a relatively new prescription in the public coaching literature, emerging partly from the Hebisz findings and partly from coaches observing that standard tempo/threshold torque work eventually plateaus. The combined stress of above-threshold power and low cadence is very high on both the cardiovascular system and the musculoskeletal structures around the knee.",
    bullets: [
      {
        text: "Intervals are 3 minutes at 105% FTP — above threshold, which changes the recovery demand substantially. Volume is kept low (6–8 reps) because this is near-maximal muscular effort at a mechanically stressful cadence. Intensity and cadence together produce a stimulus unlike anything in standard interval training.",
        cite: "evoq",
      },
      {
        text: "EVOQ.BIKE, who named and popularised TorqueMax intervals, are explicit: these should only follow a completed lower-intensity torque block, exactly as Phases 1 and 2 provide. Attempting TorqueMax without this foundation is how acute knee injuries happen.",
        cite: "evoq",
      },
      {
        text: "Treat these like hard VO₂max sessions: 48–72 hours of genuine recovery either side. No stacking with race days, long endurance sessions, or consecutive hard workouts.",
      },
    ],
    caveats: "Skip this phase entirely if: (a) you experienced any knee discomfort in Phases 1–2, (b) you are entering a race block, (c) you have not been doing any gym work. Come back to it in the next base or early-build period.",
  },
];

const PLAN = [
  {
    phase: "Phase 1 — Introduction", phaseColor: "#4ade80",
    weeks: [
      { week: 1, file: "torque_week1.zwo", sessions: [{ id: "w1s1", label: "Session 1" }, { id: "w1s2", label: "Session 2" }], intervals: "3", dur: "8 min", power: "85%", cadence: "55 rpm", recovery: "5 min", total: "54 min", note: "First exposure. Focus on form, stay seated. It should feel manageable.", warning: null },
      { week: 2, file: "torque_week2.zwo", sessions: [{ id: "w2s1", label: "Session 1" }, { id: "w2s2", label: "Session 2" }], intervals: "4", dur: "8 min", power: "85%", cadence: "55 rpm", recovery: "5 min", total: "67 min", note: "One more interval than last week. Cadence discipline is the whole point.", warning: null },
      { week: 3, file: "torque_week3.zwo", sessions: [{ id: "w3s1", label: "Session 1" }, { id: "w3s2", label: "Session 2" }], intervals: "4", dur: "10 min", power: "87%", cadence: "50–55 rpm", recovery: "5 min", total: "75 min", note: "Longer intervals, slight intensity bump. Hips should start taking more load.", warning: null },
    ]
  },
  {
    phase: "Phase 2 — Building", phaseColor: "#fb923c",
    weeks: [
      { week: 4, file: "torque_week4.zwo", sessions: [{ id: "w4s1", label: "Session 1" }, { id: "w4s2", label: "Session 2" }], intervals: "5", dur: "8 min", power: "90%", cadence: "50 rpm", recovery: "5 min", total: "80 min", note: "Cadence drops to 50. Hip musculature takes more load.", warning: null },
      { week: 5, file: "torque_week5.zwo", sessions: [{ id: "w5s1", label: "Session 1" }, { id: "w5s2", label: "Session 2" }], intervals: "5", dur: "10 min", power: "90%", cadence: "50 rpm", recovery: "5 min", total: "90 min", note: "Longest sessions of the block. Plan recovery carefully.", warning: null },
      { week: 6, file: "torque_week6.zwo", sessions: [{ id: "w6s1", label: "Session 1" }, { id: "w6s2", label: "Session 2" }], intervals: "4", dur: "10 min + 30s sprint", power: "95% → 120%", cadence: "50 → 90 rpm", recovery: "5 min", total: "77 min", note: "Sprint at end of each interval transfers torque into race-speed power.", warning: null },
    ]
  },
  {
    phase: "Phase 3 — TorqueMax", phaseColor: "#f87171",
    weeks: [
      { week: 7, file: "torque_week7.zwo", sessions: [{ id: "w7s1", label: "Session 1" }, { id: "w7s2", label: "Session 2" }], intervals: "6", dur: "3 min", power: "105%", cadence: "55 rpm", recovery: "5 min", total: "63 min", note: "Above threshold. Short and brutal.", warning: "Only attempt if weeks 1–6 were completely pain-free." },
      { week: 8, file: "torque_week8.zwo", sessions: [{ id: "w8s1", label: "Session 1" }, { id: "w8s2", label: "Session 2" }], intervals: "8", dur: "3 min", power: "105%", cadence: "50–55 rpm", recovery: "5 min", total: "79 min", note: "Peak volume. Torque base complete after this.", warning: "Only attempt if weeks 1–6 were completely pain-free." },
    ]
  },
];

const ALL_SESSION_IDS = PLAN.flatMap(p => p.weeks).flatMap(w => w.sessions).map(s => s.id);
const TOTAL = ALL_SESSION_IDS.length;

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function Cite({ id }) {
  return (
    <span
      title={SOURCES[id].full}
      style={{
        display: "inline-block",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.52rem",
        background: "#0f1a2e",
        border: "1px solid #1a2a4a",
        color: "#4a8fd4",
        borderRadius: 4,
        padding: "1px 6px",
        marginLeft: 5,
        cursor: "help",
        verticalAlign: "middle",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {SOURCES[id].short}
    </span>
  );
}

function SourcesBox() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: "2.5rem" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "1px solid #1a1a2e", borderRadius: 6,
          color: "#4a8fd4", fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.6rem", letterSpacing: "0.15em", padding: "0.5rem 1rem",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
        }}
      >
        <span>{open ? "▾" : "▸"}</span> FULL SOURCE LIST ({Object.keys(SOURCES).length} references)
      </button>
      {open && (
        <div style={{ marginTop: "0.75rem", border: "1px solid #1a1a2e", borderRadius: 8, overflow: "hidden" }}>
          {Object.entries(SOURCES).map(([key, src], i) => (
            <div key={key} style={{
              padding: "0.7rem 1rem",
              background: i % 2 === 0 ? "#0a0a14" : "#0c0c18",
              borderBottom: i < Object.keys(SOURCES).length - 1 ? "1px solid #111120" : "none",
              display: "flex", gap: "1rem", alignItems: "flex-start",
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#4a8fd4", letterSpacing: "0.08em", whiteSpace: "nowrap", paddingTop: "1px", minWidth: 130 }}>
                {src.short}
              </div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "#555", lineHeight: 1.5 }}>
                {src.full}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewPanel() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 2rem 2rem" }}>
      <div style={{ border: "1px solid #111124", borderRadius: 12, overflow: "hidden", background: "#0b0b16" }}>
        <div style={{ padding: "1.4rem 1.8rem", borderBottom: "1px solid #111124", background: "#0d0d1a" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#FF6B00", marginBottom: "0.35rem" }}>
            SCIENCE & RATIONALE
          </div>
          <h2 style={{ fontFamily: "'Barlow', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#ddd", letterSpacing: "-0.02em" }}>
            Why torque training — and does it actually work?
          </h2>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.75rem", color: "#3a3a5a", marginTop: "0.4rem", fontStyle: "italic" }}>
            Hover over citation tags for the full reference. Full source list at bottom of page.
          </p>
        </div>

        <div style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {OVERVIEW_SECTIONS.map((sec) => (
            <div key={sec.heading}>
              <h3 style={{
                fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", fontWeight: 700,
                letterSpacing: "0.12em", color: "#FF6B00", textTransform: "uppercase", marginBottom: "0.75rem",
              }}>
                {sec.heading}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {sec.body.map((b, i) => (
                  <p key={i} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "#666", lineHeight: 1.75 }}>
                    {b.text}
                    {b.cite && <Cite id={b.cite} />}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "0 1.8rem 1.8rem" }}>
          <SourcesBox />
        </div>
      </div>
    </div>
  );
}

function PhaseNotesPanel({ note, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: "1rem" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none",
          border: `1px solid ${open ? color + "55" : "#1a1a2e"}`,
          borderRadius: 6, color: open ? color : "#444",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.6rem", letterSpacing: "0.12em", padding: "0.5rem 1rem",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
          transition: "all 0.2s",
        }}
      >
        <span>{open ? "▾" : "▸"}</span> PHASE RATIONALE & SOURCES
      </button>
      {open && (
        <div style={{
          marginTop: "0.75rem", background: "#0a0a14",
          border: `1px solid ${color}22`, borderRadius: 8, padding: "1.4rem 1.6rem",
        }}>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "#555", lineHeight: 1.75, marginBottom: "1.2rem", fontStyle: "italic" }}>
            {note.rationale}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.2rem" }}>
            {note.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, marginTop: "0.5rem", flexShrink: 0 }} />
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "#666", lineHeight: 1.7 }}>
                  {b.text}
                  {b.cite && <Cite id={b.cite} />}
                </p>
              </div>
            ))}
          </div>
          {note.caveats && (
            <div style={{
              background: "#0f0f1a", border: `1px solid ${color}33`,
              borderRadius: 6, padding: "0.75rem 1rem",
              fontFamily: "'Barlow', sans-serif", fontSize: "0.75rem",
              color: color + "bb", lineHeight: 1.6,
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em", marginRight: 8 }}>⚠ NOTE</span>
              {note.caveats}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

export default function TorqueTracker() {
  const [completed, setCompleted] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState("tracker");

  useEffect(() => {
    async function load() {
      try {
        const r = await window.storage.get("torque-8wk-v1");
        if (r?.value) setCompleted(JSON.parse(r.value));
      } catch (_) {}
      setLoaded(true);
    }
    load();
  }, []);

  async function save(next) {
    setCompleted(next);
    try { await window.storage.set("torque-8wk-v1", JSON.stringify(next)); } catch (_) {}
  }

  async function toggle(id) {
    const next = { ...completed };
    if (next[id]) delete next[id];
    else next[id] = Date.now();
    await save(next);
  }

  async function handleReset() {
    if (!resetting) { setResetting(true); return; }
    await save({});
    setResetting(false);
  }

  const doneCount = Object.keys(completed).length;
  const pct = Math.round((doneCount / TOTAL) * 100);

  if (!loaded) return (
    <div style={{ background: "#080810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#333", fontFamily: "monospace", letterSpacing: "0.2em", fontSize: "0.8rem" }}>LOADING...</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }
        .session-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .session-btn { transition: all 0.15s ease; }
        .week-card { transition: border-color 0.3s ease; }
        .week-card:hover { border-color: #1e1e3a !important; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.8; }
      `}</style>

      <div style={{ background: "#080810", minHeight: "100vh", color: "#e0e0f0", fontFamily: "'Barlow', sans-serif" }}>

        {/* HEADER */}
        <header style={{
          background: "linear-gradient(180deg, #0c0c18 0%, #080810 100%)",
          borderBottom: "1px solid #111124",
          padding: "1.5rem 2rem",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.25em", color: "#444", marginBottom: "0.3rem" }}>
                ZWIFT / LOW CADENCE / 8 WEEKS
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
                Torque Protocol
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2rem", fontWeight: 700, lineHeight: 1, color: doneCount === TOTAL ? "#4ade80" : "#FF6B00" }}>
                  {doneCount}<span style={{ fontSize: "1rem", color: "#2a2a3e", fontWeight: 400 }}>/{TOTAL}</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#444", marginTop: "0.2rem" }}>SESSIONS DONE</div>
                <div style={{ marginTop: "0.5rem", width: 150, height: 3, background: "#111124", borderRadius: 2, overflow: "hidden", marginLeft: "auto" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: doneCount === TOTAL ? "#4ade80" : "linear-gradient(90deg, #FF6B00, #ffaa00)", borderRadius: 2, transition: "width 0.4s ease" }} />
                </div>
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: "none", border: `1px solid ${resetting ? "#ef4444" : "#1e1e2e"}`,
                  borderRadius: 6, color: resetting ? "#ef4444" : "#333",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem",
                  letterSpacing: "0.15em", padding: "0.4rem 0.7rem",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {resetting ? "CONFIRM RESET" : "RESET"}
              </button>
            </div>
          </div>

          {/* TABS */}
          <div style={{ maxWidth: 960, margin: "1rem auto 0", display: "flex", gap: "0.25rem" }}>
            {[["tracker", "Training Tracker"], ["science", "Science & Rationale"]].map(([id, label]) => (
              <button
                key={id}
                className="tab-btn"
                onClick={() => setActiveTab(id)}
                style={{
                  background: activeTab === id ? "#FF6B00" : "none",
                  border: `1px solid ${activeTab === id ? "#FF6B00" : "#1a1a2e"}`,
                  borderRadius: 6, color: activeTab === id ? "#000" : "#555",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem",
                  fontWeight: activeTab === id ? 700 : 400,
                  letterSpacing: "0.12em", padding: "0.45rem 0.9rem", cursor: "pointer",
                }}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* INSTALL BANNER */}
        {activeTab === "tracker" && (
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
            <div style={{
              background: "#0c0c1a", border: "1px solid #1a1a2e", borderRadius: 8,
              padding: "0.85rem 1.2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap",
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#FF6B00", letterSpacing: "0.15em", alignSelf: "center", flexShrink: 0 }}>
                ZWIFT INSTALL
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "#555", lineHeight: 1.7 }}>
                <span style={{ color: "#888" }}>macOS:</span> ~/Documents/Zwift/Workouts/&lt;user_id&gt;/ &nbsp;|&nbsp;
                <span style={{ color: "#888" }}>Windows:</span> Documents\Zwift\Workouts\&lt;user_id&gt;\ &nbsp;|&nbsp;
                Drop .zwo files from the zip, restart Zwift → Custom Workouts
              </div>
            </div>
          </div>
        )}

        {/* SCIENCE TAB */}
        {activeTab === "science" && (
          <div style={{ paddingTop: "2rem" }}>
            <OverviewPanel />
          </div>
        )}

        {/* TRACKER TAB */}
        {activeTab === "tracker" && (
          <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>
            {PLAN.map((phase, pi) => {
              const phaseNote = PHASE_NOTES[pi];
              const phaseDone = phase.weeks.flatMap(w => w.sessions).filter(s => completed[s.id]).length;
              const phaseTotal = phase.weeks.flatMap(w => w.sessions).length;
              return (
                <section key={phase.phase} style={{ marginBottom: "2.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
                    <div style={{ width: 3, height: 28, background: phase.phaseColor, borderRadius: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", color: phase.phaseColor, fontFamily: "'JetBrains Mono', monospace" }}>
                        {phase.phase.toUpperCase()}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "#333", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>
                        {phaseDone}/{phaseTotal} sessions
                      </div>
                    </div>
                  </div>

                  <PhaseNotesPanel note={phaseNote} color={phase.phaseColor} />

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                    {phase.weeks.map((week) => {
                      const weekDone = week.sessions.every(s => completed[s.id]);
                      return (
                        <div
                          key={week.week}
                          className="week-card"
                          style={{
                            background: "#0b0b16",
                            border: `1px solid ${weekDone ? phase.phaseColor + "55" : "#13131f"}`,
                            borderRadius: 10, padding: "1.2rem", position: "relative", overflow: "hidden",
                          }}
                        >
                          {weekDone && (
                            <div style={{
                              position: "absolute", top: 0, right: 0, width: 80, height: 80,
                              background: `radial-gradient(circle at top right, ${phase.phaseColor}15, transparent 70%)`,
                              pointerEvents: "none",
                            }} />
                          )}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                            <div>
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#333", marginBottom: "0.1rem" }}>WEEK</div>
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.8rem", fontWeight: 700, color: phase.phaseColor, lineHeight: 1 }}>
                                {week.week}
                              </div>
                            </div>
                            {weekDone && (
                              <div style={{ background: phase.phaseColor, color: "#000", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.12em", padding: "3px 8px", borderRadius: 100, fontFamily: "'JetBrains Mono', monospace" }}>
                                ✓ DONE
                              </div>
                            )}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem 0.5rem", marginBottom: "0.85rem" }}>
                            {[
                              { l: "REPS", v: week.intervals },
                              { l: "DURATION", v: week.dur },
                              { l: "INTENSITY", v: week.power },
                              { l: "CADENCE", v: week.cadence },
                              { l: "RECOVERY", v: week.recovery },
                              { l: "TOTAL", v: week.total },
                            ].map(({ l, v }) => (
                              <div key={l}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.15em", color: "#333" }}>{l}</div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 600, color: "#aaa", marginTop: "0.1rem" }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ height: 1, background: "#13131f", marginBottom: "0.75rem" }} />
                          <p style={{ fontSize: "0.72rem", color: "#555", fontStyle: "italic", lineHeight: 1.5, marginBottom: "0.5rem" }}>{week.note}</p>
                          {week.warning && (
                            <p style={{ fontSize: "0.65rem", color: "#f87171", marginBottom: "0.5rem", fontFamily: "'JetBrains Mono', monospace" }}>⚠ {week.warning}</p>
                          )}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.75rem" }}>
                            {week.sessions.map((s) => {
                              const done = !!completed[s.id];
                              return (
                                <button
                                  key={s.id}
                                  className="session-btn"
                                  onClick={() => toggle(s.id)}
                                  style={{
                                    border: `1px solid ${done ? phase.phaseColor : "#1e1e32"}`,
                                    borderRadius: 6, padding: "0.55rem 0.4rem",
                                    background: done ? `${phase.phaseColor}18` : "transparent",
                                    color: done ? phase.phaseColor : "#333",
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem",
                                    fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
                                    textAlign: "center", lineHeight: 1.3,
                                  }}
                                >
                                  {done ? (
                                    <>
                                      <div>✓</div>
                                      <div style={{ fontSize: "0.55rem", color: phase.phaseColor + "bb" }}>{formatDate(completed[s.id])}</div>
                                    </>
                                  ) : (
                                    <div style={{ color: "#2a2a3e" }}>{s.label}</div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.52rem", color: "#1e1e32", marginTop: "0.85rem", letterSpacing: "0.05em" }}>
                            📁 {week.file}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", color: "#222",
              textAlign: "center", paddingTop: "1rem", paddingBottom: "2rem", lineHeight: 1.8, letterSpacing: "0.05em",
            }}>
              Click any session button to mark done · progress saves automatically
              <br />
              2 sessions/week · always seated · stop at knee pain · best during base/build phase
            </div>
          </main>
        )}
      </div>
    </>
  );
}
