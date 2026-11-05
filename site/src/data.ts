import type { BuildWeek, RationaleSection, Source, Workout } from './types'

const TSS = __ZWO_WORKOUTS_TSS__

// Follows the H2 sections of research/high-torque-training-research.md, in
// order. "Who this comes from" condenses the doc's "Source prescription
// reference" (bios from evidence-file P-rows only).
export const RATIONALE_SECTIONS: RationaleSection[] = [
  { id: 'who', heading: 'Who this is for' },
  { id: 'sources', heading: 'How to read the sources' },
  { id: 'core', heading: 'The core idea' },
  { id: 'evidence', heading: 'The evidence: thin and mixed' },
  { id: 'floor', heading: "Intensity floor: Zone 2 torque work doesn't count" },
  { id: 'gym', heading: 'Torque intervals and the gym' },
  { id: 'knee', heading: 'Knee safety' },
  { id: 'build', heading: 'The plan: adaptation and build' },
  { id: 'after', heading: 'After the build' },
  { id: 'zwift', heading: 'Riding it in Zwift: ERG and adapting to the day' },
  { id: 'people', heading: 'Who this comes from' },
  { id: 'confidence', heading: "What would change my mind" },
]


// Order and wording follow the research doc's "Sources" list. Categories are
// the doc's four trust categories (evidence file P15). Zwift's support pages
// are product documentation outside those categories, so they are cited
// inline as text, not here.
export const SOURCES: Record<string, Source> = {
  hebisz2024: {
    key: 'hebisz2024',
    category: 'research',
    shortName: 'Hebisz 2024',
    fullCitation:
      'Hebisz R, Hebisz P (2024). Greater improvement in aerobic capacity after a polarized training program including cycling interval training at low cadence (50–70 rpm) than freely chosen cadence (above 80 rpm). PLoS ONE 19(11):e0311833. (full text)',
    url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833',
  },
  dePablos2026: {
    key: 'dePablos2026',
    category: 'research',
    shortName: 'de Pablos 2026',
    fullCitation:
      'de Pablos R, Valenzuela PL, Martínez-Cava A, Alejo LB, Revuelta C, Sánchez-Redondo IR, Barranco-Gil D, Pallarés JG (2026). The Role of Pedaling Intensity During Torque Training in Cyclists: A Three-Arm Randomized Controlled Trial. Scand J Med Sci Sports 36(5):e70294. PubMed 42076918. (abstract only)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42076918/',
  },
  nimmerichter2012: {
    key: 'nimmerichter2012',
    category: 'research',
    shortName: 'Nimmerichter 2012',
    fullCitation:
      'Nimmerichter A, Eston R, Bachl N, Williams C (2012). Eur J Appl Physiol 112:69–78. PubMed 21479957. (abstract only)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21479957/',
  },
  kristoffersen2014: {
    key: 'kristoffersen2014',
    category: 'research',
    shortName: 'Kristoffersen 2014',
    fullCitation:
      'Kristoffersen M, Gundersen H, Leirdal S, Iversen VV (2014). Low cadence interval training at moderate intensity does not improve cycling performance in highly trained veteran cyclists. Front Physiol 5:34. (full text)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3907705/',
  },
  barrancoGil2024: {
    key: 'barrancoGil2024',
    category: 'research',
    shortName: 'Barranco-Gil 2024',
    fullCitation:
      'Barranco-Gil D, Hernández-Belmonte A, Iriberri J, Martínez-Cava A, Buendía-Romero Á, Alejo LB, Rodríguez-Rielves V, Sánchez-Redondo IR, de Pablos R, Lucia A, Valenzuela PL, Pallarés JG (2024). Relative pedaling forces are low during cycling. J Sci Med Sport 27(9):660–663. PubMed 38839539. (abstract only)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38839539/',
  },
  hansen2017: {
    key: 'hansen2017',
    category: 'research',
    shortName: 'Hansen & Rønnestad 2017',
    fullCitation:
      'Hansen EA, Rønnestad BR (2017). Effects of Cycling Training at Imposed Low Cadences: A Systematic Review. Int J Sports Physiol Perform 12:1127–1136. PubMed 28095074. (abstract only)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28095074/',
  },
  ahlquist1992: {
    key: 'ahlquist1992',
    category: 'research',
    shortName: 'Ahlquist 1992',
    fullCitation:
      'Ahlquist LE, Bassett DR Jr, Sufit R, Nagle FJ, Thomas DP (1992). The effect of pedaling frequency on glycogen depletion rates in type I and type II quadriceps muscle fibers during submaximal cycling exercise. Eur J Appl Physiol Occup Physiol 65(4):360–364. (abstract only)',
  },
  bini2013: {
    key: 'bini2013',
    category: 'research',
    shortName: 'Bini & Hume 2013',
    fullCitation:
      'Bini RR, Hume PA (2013). Effects of workload and pedalling cadence on knee forces in competitive cyclists. Sports Biomech 12:93–107. PubMed 23898683. (abstract only)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23898683/',
  },
  johnston2017: {
    key: 'johnston2017',
    category: 'research',
    shortName: 'Johnston 2017',
    fullCitation:
      'Johnston TE, Baskins TA, Koppel RV, Oliver SA, Stieber DJ, Hoglund LT (2017). The influence of extrinsic factors on knee biomechanics during cycling: a systematic review of the literature. Int J Sports Phys Ther 12(7):1023–1033. (full text)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5717478/',
  },
  ef: {
    key: 'ef',
    category: 'pro-team',
    shortName: 'EF Pro Cycling',
    fullCitation:
      "EF Pro Cycling, Pro Workouts: Torque Efforts with Noemi Rueegg (Noemi Rüegg's session; progression advice from Peter Schep, EF Pro Cycling Head of Performance).",
    url: 'https://www.efprocycling.com/tips-recipes/noemi-rueegg-torque-workouts/',
  },
  wakefieldTts465: {
    key: 'wakefieldTts465',
    category: 'pro-team',
    shortName: 'Wakefield (TTS #465)',
    fullCitation: 'John Wakefield, That Triathlon Show #465 (podcast; machine transcript).',
  },
  wakefieldS2S: {
    key: 'wakefieldS2S',
    category: 'pro-team',
    shortName: 'Wakefield (Science to Sport)',
    fullCitation: 'John Wakefield, Science to Sport article, 6 Feb 2026 (updated 18 Feb 2026).',
  },
  henderson: {
    key: 'henderson',
    category: 'pro-team',
    shortName: 'Henderson',
    fullCitation:
      'Neal Henderson on Fast Talk, episode 125 (20 Aug 2020), Put It in the Big Gear: We Explore Low-Cadence, High-Torque Training (machine transcript).',
    url: 'https://www.fasttalklabs.com/fast-talk/neal-henderson-put-it-in-the-big-gear-we-explore-low-cadence-high-torque-training/',
  },
  evoq: {
    key: 'evoq',
    category: 'coaching-business',
    shortName: 'EVOQ.BIKE',
    fullCitation: 'EVOQ.BIKE (Landry Bobo), Low Cadence Cycling: How Torque Training Makes You Faster, 1 Jan 2026.',
    url: 'https://www.evoq.bike/blog/low-cadence-cycling-how-torque-training-makes-you-faster',
  },
  housler: {
    key: 'housler',
    category: 'coaching-business',
    shortName: 'EVOQ.BIKE (Housler)',
    fullCitation: 'EVOQ.BIKE (Brendan Housler), Gravel Racing & Training Tips, 3 Aug 2020.',
    url: 'https://www.evoq.bike/blog/gravel-racing-training-tips',
  },
  evoqPodcast: {
    key: 'evoqPodcast',
    category: 'coaching-business',
    shortName: 'EVOQ podcast',
    fullCitation: 'EVOQ.BIKE podcast (Housler and Bobo; auto-captions).',
  },
  ctsRutberg: {
    key: 'ctsRutberg',
    category: 'coaching-business',
    shortName: 'CTS (Rutberg)',
    fullCitation: 'CTS (Jim Rutberg), MuscleTension intervals article, trainright.com.',
  },
  ctsPulford: {
    key: 'ctsPulford',
    category: 'coaching-business',
    shortName: 'CTS (Pulford)',
    fullCitation: 'CTS (Adam Pulford), YouTube video on torque training (auto-captions).',
    url: 'https://www.youtube.com/watch?v=FhEwwMhdekM',
  },
  roadman: {
    key: 'roadman',
    category: 'media',
    shortName: 'Roadman Podcast',
    fullCitation:
      'Roadman Cycling Podcast (auto-captions; the episode that inspired this site, and the nearest source for the move-on rule).',
    url: 'https://www.youtube.com/watch?v=tcar3G2v73I',
  },
  kiw58: {
    key: 'kiw58',
    category: 'media',
    shortName: 'Knowledge is Watt #58',
    fullCitation:
      'Knowledge is Watt #58, High Intensity Torque Training Can Increase Cycling Performance (commentary on Hebisz 2024; background reading only).',
    url: 'https://knowledgeiswatt.substack.com/p/58-high-intensity-torque-training',
  },
}

// Adaptation phase workouts (weeks 1–4). A labelled composite: structure from
// Wakefield (TTS #465, machine transcript), intensity from Henderson (Fast Talk
// ep. 125, machine transcript) and Schep (EF); the 4-week arrangement is mine.
// `source: 'site'` renders as plain text (no single source to cite).
const ADAPTATION_SOURCE_NOTE =
  "A combination of coaches' advice for riders starting torque work (the combination is mine). John Wakefield (That Triathlon Show #465, machine transcript): four 4-minute reps, around 60–65 rpm for riders new to it, rest as long as the rep. Neal Henderson (Fast Talk ep. 125, 2020, machine transcript): 75–85% of threshold at 50–60 rpm. Peter Schep (EF Pro Cycling): 80–85% of FTP. My choices: 80% FTP in weeks 1–2, and the 4-week arrangement."

const ADAPTATION_PEOPLE = ['John Wakefield', 'Neal Henderson', 'Peter Schep']
const HEBISZ_PEOPLE = ['R. Hebisz', 'P. Hebisz']

const ADAPTATION_BASE: Workout[] = [
  {
    id: 'a1',
    name: 'Weeks 1–2 — 4×4 @ 60–65 rpm',
    params: [
      { label: 'Sets × duration', value: '4 × 4 min' },
      { label: 'Intensity', value: '80% FTP' },
      { label: 'Cadence', value: '60–65 rpm' },
      { label: 'Recovery', value: '4 min easy spin' },
    ],
    source: 'site',
    sourceNote: ADAPTATION_SOURCE_NOTE,
    file: 'High Torque - Adaptation/Adapt_W1-2_4x4_60-65rpm.zwo',
    people: ADAPTATION_PEOPLE,
    kind: 'moderate',
  },
  {
    id: 'a2',
    name: 'Weeks 3–4 — 4×4 @ 50–60 rpm',
    params: [
      { label: 'Sets × duration', value: '4 × 4 min' },
      { label: 'Intensity', value: "80% FTP (inside the coaches' 80–85%)" },
      { label: 'Cadence', value: '50–60 rpm' },
      { label: 'Recovery', value: '4 min easy spin' },
    ],
    source: 'site',
    sourceNote: ADAPTATION_SOURCE_NOTE,
    file: 'High Torque - Adaptation/Adapt_W3-4_4x4_50-60rpm.zwo',
    people: ADAPTATION_PEOPLE,
    kind: 'moderate',
  },
]

// The library, in display order: moderate → threshold → above threshold
// (Schep, evidence file O1; EVOQ, O2); SIT (maximal) last is my choice (O9).
const LIBRARY_BASE: Workout[] = [
  {
    id: 'te-3x8',
    name: 'Torque Endurance 3×8',
    params: [
      { label: 'Intervals', value: '3×8 min @ 95% FTP' },
      { label: 'Cadence', value: '60–70 rpm' },
    ],
    source: 'housler',
    sourceNote:
      "Scaled: 3 reps instead of Housler's 4. Recovery as long as the interval (8 min easy spin) is my choice, as coaches Wakefield and Rutberg (CTS) use.",
    file: 'High Torque - Library/TE_3x8_95pct.zwo',
    people: ['Brendan Housler'],
    kind: 'moderate',
  },
  {
    id: 'te-4x8',
    name: 'Torque Endurance 4×8',
    params: [
      { label: 'Intervals', value: '4×8 min @ 95% FTP' },
      { label: 'Cadence', value: '60–70 rpm' },
    ],
    source: 'housler',
    sourceNote: 'Recovery as long as the interval (8 min easy spin) is my choice, as coaches Wakefield and Rutberg (CTS) use.',
    file: 'High Torque - Library/TE_4x8_95pct.zwo',
    people: ['Brendan Housler'],
    kind: 'moderate',
  },
  {
    id: 'te-3x15',
    name: 'Torque Endurance 3×15',
    params: [
      { label: 'Intervals', value: '3×15 min @ 90% FTP' },
      { label: 'Cadence', value: '50–60 rpm' },
    ],
    source: 'housler',
    sourceNote:
      "90% is the bottom of Housler's 90–105% (my choice); recovery as long as the interval (15 min easy spin) is my choice.",
    file: 'High Torque - Library/TE_3x15_90pct.zwo',
    people: ['Brendan Housler'],
    kind: 'moderate',
  },
  {
    id: 'threshold-5x5',
    name: 'Threshold 5×5',
    params: [
      { label: 'Intervals', value: '5×5 min @ 95% FTP' },
      { label: 'Cadence', value: '50–60 rpm' },
    ],
    source: 'henderson',
    sourceNote: "2:30 easy spin: Henderson's rule of thumb of recovering for half the interval time, applied by me.",
    file: 'High Torque - Library/Threshold_5x5_95pct.zwo',
    people: ['Neal Henderson'],
    kind: 'moderate',
  },
  {
    id: 'torquemax',
    name: 'TorqueMax',
    params: [
      { label: 'Intervals', value: '6×2.5 min @ 110% FTP' },
      { label: 'Cadence', value: '50–60 rpm' },
    ],
    source: 'evoq',
    sourceNote: 'EVOQ (Bobo) gives 6×2–3 min at 105–110%. 2.5 min, 110% and the 4-min recovery are my picks.',
    file: 'High Torque - Library/TorqueMax_110pct.zwo',
    people: ['Landry Bobo'],
    kind: 'above-threshold',
  },
  {
    id: 'ruegg',
    name: 'Rüegg VO2max + Sprint',
    params: [
      { label: 'Intervals', value: '3×(5 min @ 110% FTP + 1 min max effort)' },
      { label: 'Cadence', value: '50–60 rpm (sprint at free cadence)' },
    ],
    source: 'ef',
    sourceNote:
      "Noemi Rüegg's own session, as published by EF Pro Cycling. Scaled: shorter warm-up and cool-down for Zwift (EF's version uses 30 min each).",
    file: 'High Torque - Library/Ruegg_VO2max_Sprint.zwo',
    people: ['Noemi Rüegg'],
    kind: 'above-threshold',
  },
  {
    id: 'hiit-4x4',
    name: 'HIIT 4×4',
    params: [
      { label: 'Intervals', value: '4×4 min @ ~120% FTP' },
      { label: 'Cadence', value: '60–70 rpm' },
    ],
    source: 'hebisz2024',
    sourceNote: '~120% FTP and the ~65% recoveries are my estimates from the paper.',
    file: 'High Torque - Library/HIIT_4x4_120pct.zwo',
    people: HEBISZ_PEOPLE,
    kind: 'above-threshold',
  },
  {
    id: 'hiit-6x4',
    name: 'HIIT 6×4',
    params: [
      { label: 'Intervals', value: '6×4 min @ ~120% FTP' },
      { label: 'Cadence', value: '60–70 rpm' },
    ],
    source: 'hebisz2024',
    sourceNote: '~120% FTP and the ~65% recoveries are my estimates from the paper.',
    file: 'High Torque - Library/HIIT_6x4_120pct.zwo',
    people: HEBISZ_PEOPLE,
    kind: 'above-threshold',
  },
  {
    id: 'sit-2',
    name: 'SIT (2 sets)',
    params: [
      { label: 'Intervals', value: '2×(4×30 sec max)' },
      { label: 'Cadence', value: '50–60 rpm' },
    ],
    source: 'hebisz2024',
    sourceNote: '~65% FTP recoveries are my estimate.',
    file: 'High Torque - Library/SIT_2sets.zwo',
    people: HEBISZ_PEOPLE,
    kind: 'maximal',
  },
  {
    id: 'sit-3',
    name: 'SIT (3 sets)',
    params: [
      { label: 'Intervals', value: '3×(4×30 sec max)' },
      { label: 'Cadence', value: '50–60 rpm' },
    ],
    source: 'hebisz2024',
    sourceNote: '~65% FTP recoveries are my estimate.',
    file: 'High Torque - Library/SIT_3sets.zwo',
    people: HEBISZ_PEOPLE,
    kind: 'maximal',
  },
]

// TSS is computed from each .zwo at build time and joined by file path.
const withTss = (w: Workout): Workout => ({ ...w, tss: TSS[w.file] })

export const ADAPTATION_WORKOUTS: Workout[] = ADAPTATION_BASE.map(withTss)
export const LIBRARY_WORKOUTS: Workout[] = LIBRARY_BASE.map(withTss)
export const ALL_WORKOUTS: Workout[] = [...ADAPTATION_WORKOUTS, ...LIBRARY_WORKOUTS]

const WORKOUTS_BY_ID = new Map(ALL_WORKOUTS.map((w) => [w.id, w]))

// Returns undefined for unknown ids, e.g. retired ids (w1, t1-entry, …) still
// sitting in an old browser's localStorage. Callers must handle that.
export function workoutById(id: string): Workout | undefined {
  return WORKOUTS_BY_ID.get(id)
}

// The plan: a 4-week adaptation, then an 8-week build (running week 1–12 here), per research/training-calendar.md "The plan: adaptation, then build".
export const BUILD_WEEKS: BuildWeek[] = [
  { week: 1, phase: 'adaptation', workoutIds: ['a1'] },
  { week: 2, phase: 'adaptation', workoutIds: ['a1'] },
  { week: 3, phase: 'adaptation', workoutIds: ['a2'] },
  { week: 4, phase: 'adaptation', workoutIds: ['a2'] },
  { week: 5, phase: 'build', workoutIds: ['te-3x8'] },
  { week: 6, phase: 'build', workoutIds: ['te-3x8'] },
  { week: 7, phase: 'build', workoutIds: ['threshold-5x5'] },
  { week: 8, phase: 'build', workoutIds: ['threshold-5x5'] },
  { week: 9, phase: 'build', workoutIds: ['torquemax'] },
  { week: 10, phase: 'build', workoutIds: ['torquemax'] },
  { week: 11, phase: 'build', workoutIds: ['hiit-4x4'] },
  { week: 12, phase: 'build', workoutIds: ['hiit-4x4'] },
]
