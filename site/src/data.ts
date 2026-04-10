import type { Source, Workout } from './types'

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
    name: 'W1 — Zone 2 at 65–70 rpm',
    params: [
      { label: 'Sets × duration', value: '2 × 10 min' },
      { label: 'Intensity', value: 'Zone 2 (~65% FTP)' },
      { label: 'Cadence', value: '65–70 rpm' },
      { label: 'Recovery', value: '5 min easy spin' },
      { label: 'Total time', value: '~50 min' },
    ],
    source: 'evoq',
    file: 'High Torque - Adaptation/W1_Endurance_65-70rpm.zwo',
  },
  {
    id: 'w2',
    name: 'W2 — Zone 2 at 65 rpm',
    params: [
      { label: 'Sets × duration', value: '2 × 15 min' },
      { label: 'Intensity', value: 'Zone 2 (~65% FTP)' },
      { label: 'Cadence', value: '65 rpm' },
      { label: 'Recovery', value: '5 min easy between' },
      { label: 'Total time', value: '~60 min' },
    ],
    source: 'evoq',
    file: 'High Torque - Adaptation/W2_Endurance_65rpm.zwo',
  },
  {
    id: 'w3',
    name: 'W3 — Zone 2 at 60–65 rpm',
    params: [
      { label: 'Sets × duration', value: '3 × 10 min' },
      { label: 'Intensity', value: 'Zone 2 (~65% FTP)' },
      { label: 'Cadence', value: '60–65 rpm' },
      { label: 'Recovery', value: '5 min easy between' },
      { label: 'Total time', value: '~65 min' },
    ],
    source: 'evoq',
    file: 'High Torque - Adaptation/W3_Endurance_60-65rpm.zwo',
  },
]
