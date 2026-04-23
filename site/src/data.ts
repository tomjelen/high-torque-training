import type { ScienceSection, Source, Tier, Workout } from './types'
import { TSS } from './generated/tss'

export const SCIENCE_SECTIONS: ScienceSection[] = [
  { id: 'what', heading: 'What is torque training?' },
  { id: 'why', heading: 'Why does it work?' },
  { id: 'knee', heading: 'Knee safety' },
  { id: 'adaptation', heading: 'The adaptation phase' },
  { id: 'ongoing', heading: 'Ongoing training framework' },
  { id: 'evidence', heading: 'How solid is this evidence?' },
]


export const SOURCES: Record<string, Source> = {
  hebisz2024: {
    key: 'hebisz2024',
    shortName: 'Hebisz 2024',
    fullCitation:
      'Hebisz R & Hebisz P (2024). Greater improvement in aerobic capacity after a polarized training program including cycling interval training at low cadence (50–70 RPM) than freely chosen cadence (above 80 RPM). PLOS One.',
    url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833',
  },
  munoz2014: {
    key: 'munoz2014',
    shortName: 'Muñoz 2014',
    fullCitation:
      'Muñoz I et al. (2014). Low cadence interval training at moderate intensity does not improve cycling performance in highly trained veteran cyclists. PMC3907705.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3907705/',
  },
  dye: {
    key: 'dye',
    shortName: 'Dye et al.',
    fullCitation:
      'Dye SF et al. The influence of extrinsic factors on knee biomechanics during cycling. PMC5717478.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5717478/',
  },
  physiopedia: {
    key: 'physiopedia',
    shortName: 'Physio-pedia',
    fullCitation: "Physio-pedia: Cyclist's Knee.",
    url: "https://www.physio-pedia.com/Cyclist's_Knee",
  },
  evoq: {
    key: 'evoq',
    shortName: 'EVOQ.BIKE',
    fullCitation:
      'EVOQ.BIKE — Low Cadence Cycling: How Torque Training Makes You Faster.',
    url: 'https://www.evoq.bike/blog/low-cadence-cycling-how-torque-training-makes-you-faster',
  },
  kiw58: {
    key: 'kiw58',
    shortName: 'Knowledge is Watt #58',
    fullCitation:
      'Knowledge is Watt (Substack), issue 58 — High Intensity Torque Training Can Increase Cycling Performance.',
    url: 'https://knowledgeiswatt.substack.com/p/58-high-intensity-torque-training',
  },
  wkg: {
    key: 'wkg',
    shortName: 'W/KG',
    fullCitation: 'W/KG — Have Low Cadence Training Come Full Circle?',
    url: 'https://www.wattkg.com/low-cadence-training/',
  },
  henderson: {
    key: 'henderson',
    shortName: 'Henderson',
    fullCitation:
      'Neal Henderson on Fast Talk Labs — Put It in the Big Gear — We Explore Low-Cadence, High-Torque Training.',
    url: 'https://www.fasttalklabs.com/fast-talk/neal-henderson-put-it-in-the-big-gear-we-explore-low-cadence-high-torque-training/',
  },
  roadman: {
    key: 'roadman',
    shortName: 'Roadman Podcast',
    fullCitation:
      'The Roadman Podcast — New Study FINALLY Confirms What Cycling Coaches Have Been Saying For Years (YouTube, 2024).',
    url: 'https://www.youtube.com/watch?v=tcar3G2v73I',
  },
  ef: {
    key: 'ef',
    shortName: 'EF Pro',
    fullCitation:
      "EF Pro Cycling — Pro Workouts: Torque Efforts with Noemi Rüegg.",
    url: 'https://www.efprocycling.com/tips-recipes/noemi-rueegg-torque-workouts/',
  },
}

// Adaptation phase workouts — source: EVOQ.BIKE progression structure
// Research doc: "adapted from standard coach guidance on torque training progressions [EVOQ.BIKE]"
export const ADAPTATION_WORKOUTS: Workout[] = [
  {
    id: 'w1',
    name: 'Week 1 — 2×10 @ 65–70 rpm',
    params: [
      { label: 'Sets × duration', value: '2 × 10 min' },
      { label: 'Intensity', value: 'Zone 2 (~65% FTP)' },
      { label: 'Cadence', value: '65–70 rpm' },
      { label: 'Recovery', value: '5 min easy spin' },
      { label: 'Total time', value: '~50 min' },
    ],
    source: 'evoq',
    file: 'High Torque - Adaptation/Week1_2x10_65-70rpm.zwo',
  },
  {
    id: 'w2',
    name: 'Week 2 — 2×15 @ 65 rpm',
    params: [
      { label: 'Sets × duration', value: '2 × 15 min' },
      { label: 'Intensity', value: 'Zone 2 (~65% FTP)' },
      { label: 'Cadence', value: '65 rpm' },
      { label: 'Recovery', value: '5 min easy between' },
      { label: 'Total time', value: '~60 min' },
    ],
    source: 'evoq',
    file: 'High Torque - Adaptation/Week2_2x15_65rpm.zwo',
  },
  {
    id: 'w3',
    name: 'Week 3 — 3×10 @ 60–65 rpm',
    params: [
      { label: 'Sets × duration', value: '3 × 10 min' },
      { label: 'Intensity', value: 'Zone 2 (~65% FTP)' },
      { label: 'Cadence', value: '60–65 rpm' },
      { label: 'Recovery', value: '5 min easy between' },
      { label: 'Total time', value: '~65 min' },
    ],
    source: 'evoq',
    file: 'High Torque - Adaptation/Week3_3x10_60-65rpm.zwo',
  },
]

export const TIERS: Tier[] = [
  {
    number: 1,
    name: 'Entry',
    description:
      'Your first ongoing sessions. Lower intensity to bridge from adaptation into real torque work.',
    color: '#86efac',
    workouts: [
      {
        id: 't1-entry',
        name: 'Entry 4×4',
        params: [
          { label: 'Intervals', value: '4×4 min @ 80–85% FTP' },
          { label: 'Cadence', value: '50–60 rpm' },
          { label: 'Total time', value: '~60 min' },
        ],
        source: 'henderson',
        file: 'High Torque - Tier 1 Entry/Entry_4x4_80pct.zwo',
      },
      {
        id: 't1-staple-short',
        name: 'Staple 3×5',
        params: [
          { label: 'Intervals', value: '3×5 min @ ~90% FTP' },
          { label: 'Cadence', value: '50–60 rpm' },
          { label: 'Total time', value: '~55 min' },
        ],
        source: 'evoq',
        sourceNote: 'Scaled — fewer reps (3×5 instead of EVOQ\'s 5×5) as a lower-volume entry point.',
        file: 'High Torque - Tier 1 Entry/Staple_3x5_90pct.zwo',
      },
    ],
  },
  {
    number: 2,
    name: 'Development',
    description:
      "The bread-and-butter sessions. EVOQ's staple format and a shorter VO2max intro.",
    color: '#fbbf24',
    workouts: [
      {
        id: 't2-staple',
        name: 'Staple 5×5',
        params: [
          { label: 'Intervals', value: '5×5 min @ ~90% FTP' },
          { label: 'Cadence', value: '50–60 rpm' },
          { label: 'Total time', value: '~75 min' },
        ],
        source: 'evoq',
        file: 'High Torque - Tier 2 Development/Staple_5x5_90pct.zwo',
      },
      {
        id: 't2-staple-long',
        name: 'Staple 5×8',
        params: [
          { label: 'Intervals', value: '5×8 min @ ~90% FTP' },
          { label: 'Cadence', value: '50–60 rpm' },
          { label: 'Total time', value: '~90 min' },
        ],
        source: 'evoq',
        file: 'High Torque - Tier 2 Development/Staple_5x8_90pct.zwo',
      },
      {
        id: 't2-hiit-intro',
        name: 'HIIT Intro',
        params: [
          { label: 'Intervals', value: '3×3 min @ ~110% FTP' },
          { label: 'Cadence', value: '60–70 rpm' },
          { label: 'Total time', value: '~55 min' },
        ],
        source: 'hebisz2024',
        sourceNote: 'Scaled — fewer reps and shorter intervals (3×3 instead of the study\'s 4×4) as a lower-stress introduction.',
        file: 'High Torque - Tier 2 Development/HIIT_Intro_110pct.zwo',
      },
    ],
  },
  {
    number: 3,
    name: 'Challenging',
    description:
      'Threshold and VO2max. Higher knee stress. Only after several weeks of comfortable Tier 2 work.',
    color: '#fb923c',
    workouts: [
      {
        id: 't3-threshold',
        name: 'Threshold 5×5',
        params: [
          { label: 'Intervals', value: '5×5 min @ ~95% FTP' },
          { label: 'Cadence', value: '50–60 rpm' },
          { label: 'Total time', value: '~68 min' },
        ],
        source: 'henderson',
        file: 'High Torque - Tier 3 Challenging/Threshold_5x5_95pct.zwo',
      },
      {
        id: 't3-hiit-vo2-4',
        name: 'HIIT VO2max (4 reps)',
        params: [
          { label: 'Intervals', value: '4×4 min @ ~110% FTP' },
          { label: 'Cadence', value: '60–70 rpm' },
          { label: 'Total time', value: '~83 min' },
        ],
        source: 'hebisz2024',
        file: 'High Torque - Tier 3 Challenging/HIIT_VO2max_4rep.zwo',
      },
      {
        id: 't3-ruegg',
        name: 'Rüegg VO2max + Sprint',
        params: [
          { label: 'Intervals', value: '3×(5 min @ ~110% FTP + 1 min max sprint)' },
          { label: 'Cadence', value: '50–60 rpm (sprint at normal cadence)' },
          { label: 'Total time', value: '~80 min' },
        ],
        source: 'ef',
        file: 'High Torque - Tier 3 Challenging/Ruegg_VO2max_Sprint.zwo',
      },
    ],
  },
  {
    number: 4,
    name: 'Advanced',
    description:
      'Sprint and supra-threshold. Highest knee stress. Monthly at most initially. Relevant to Zwift sprint racing.',
    color: '#f87171',
    workouts: [
      {
        id: 't4-torquemax',
        name: 'TorqueMax',
        params: [
          { label: 'Intervals', value: '6×2–3 min @ 105–110% FTP' },
          { label: 'Cadence', value: '50–60 rpm' },
          { label: 'Total time', value: '~71 min' },
        ],
        source: 'evoq',
        file: 'High Torque - Tier 4 Advanced/TorqueMax_110pct.zwo',
      },
      {
        id: 't4-sit-2',
        name: 'SIT (2 sets)',
        params: [
          { label: 'Intervals', value: '2×(4×30 sec max)' },
          { label: 'Cadence', value: '50–60 rpm' },
          { label: 'Total time', value: '~76 min' },
        ],
        source: 'hebisz2024',
        file: 'High Torque - Tier 4 Advanced/SIT_2sets.zwo',
      },
      {
        id: 't4-hiit-vo2-6',
        name: 'HIIT VO2max (6 reps)',
        params: [
          { label: 'Intervals', value: '6×4 min @ ~110% FTP' },
          { label: 'Cadence', value: '60–70 rpm' },
          { label: 'Total time', value: '~107 min' },
        ],
        source: 'hebisz2024',
        file: 'High Torque - Tier 4 Advanced/HIIT_VO2max_6rep.zwo',
      },
      {
        id: 't4-sit-3',
        name: 'SIT (3 sets)',
        params: [
          { label: 'Intervals', value: '3×(4×30 sec max)' },
          { label: 'Cadence', value: '50–60 rpm' },
          { label: 'Total time', value: '~109 min' },
        ],
        source: 'hebisz2024',
        file: 'High Torque - Tier 4 Advanced/SIT_3sets.zwo',
      },
    ],
  },
]

export const COLLECTION_WORKOUTS: Workout[] = TIERS.flatMap((tier) =>
  tier.workouts.map((w) => ({
    ...w,
    tier: tier.number as 1 | 2 | 3 | 4,
    tss: TSS[w.file],
  }))
)
