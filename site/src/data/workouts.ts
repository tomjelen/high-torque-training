export type SegmentType = "warmup" | "steady" | "intervals" | "cooldown";

export interface Segment {
  type: SegmentType;
  duration: number;
  power?: number;
  powerLow?: number;
  powerHigh?: number;
  cadence: number;
  repeat?: number;
  onDuration?: number;
  offDuration?: number;
  onPower?: number;
  offPower?: number;
  cadenceResting?: number;
}

export type FrequencyGuide = "weekly" | "every-2-3-weeks" | "monthly";

export interface Workout {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  powerPercent: number;
  cadence: number;
  fileName: string;
  folderName: string;
  segments: Segment[];
  frequencyGuide?: FrequencyGuide;
}

export interface Phase {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  workouts: Workout[];
}

// ---------------------------------------------------------------------------
// Phase 1 — Adaptation (Weeks 1–3)
// ---------------------------------------------------------------------------

const phase1Workouts: Workout[] = [
  {
    id: "w1",
    name: "W1 – Low Cadence Endurance",
    description: "2×10min Zone 2 · 68 rpm",
    durationMinutes: 50,
    powerPercent: 65,
    cadence: 68,
    fileName: "W1_Endurance_68rpm.zwo",
    folderName: "High Torque - Phase 1 Adaptation",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.68, cadence: 90 },
      { type: "steady", duration: 600, power: 0.65, cadence: 68 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 600, power: 0.65, cadence: 68 },
      { type: "cooldown", duration: 600, powerLow: 0.68, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "w2",
    name: "W2 – Low Cadence Endurance",
    description: "2×15min Zone 2 · 65 rpm",
    durationMinutes: 60,
    powerPercent: 65,
    cadence: 65,
    fileName: "W2_Endurance_65rpm.zwo",
    folderName: "High Torque - Phase 1 Adaptation",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.68, cadence: 90 },
      { type: "steady", duration: 900, power: 0.65, cadence: 65 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 900, power: 0.65, cadence: 65 },
      { type: "cooldown", duration: 600, powerLow: 0.68, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "w3",
    name: "W3 – Low Cadence Endurance",
    description: "3×10min Zone 2 · 62 rpm",
    durationMinutes: 65,
    powerPercent: 65,
    cadence: 62,
    fileName: "W3_Endurance_62rpm.zwo",
    folderName: "High Torque - Phase 1 Adaptation",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.68, cadence: 90 },
      { type: "steady", duration: 600, power: 0.65, cadence: 62 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 600, power: 0.65, cadence: 62 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 600, power: 0.65, cadence: 62 },
      { type: "cooldown", duration: 600, powerLow: 0.68, powerHigh: 0.40, cadence: 90 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Phase 2 — Build (Weeks 4–6)
// ---------------------------------------------------------------------------

const phase2Workouts: Workout[] = [
  {
    id: "w4a",
    name: "W4A – HIIT",
    description: "3×4min @ 85% FTP · 62 rpm",
    durationMinutes: 66,
    powerPercent: 85,
    cadence: 62,
    fileName: "W4A_HIIT_85pct_62rpm.zwo",
    folderName: "High Torque - Phase 2 Build",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.72, cadence: 90 },
      { type: "intervals", repeat: 3, onDuration: 240, offDuration: 480, onPower: 0.85, offPower: 0.50, cadence: 62, cadenceResting: 85, duration: 3 * (240 + 480) },
      { type: "cooldown", duration: 900, powerLow: 0.72, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "w4b",
    name: "W4B – Endurance",
    description: "2×20min Zone 2 · 68 rpm",
    durationMinutes: 70,
    powerPercent: 65,
    cadence: 68,
    fileName: "W4B_Endurance_68rpm.zwo",
    folderName: "High Torque - Phase 2 Build",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.68, cadence: 90 },
      { type: "steady", duration: 1200, power: 0.65, cadence: 68 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 1200, power: 0.65, cadence: 68 },
      { type: "cooldown", duration: 600, powerLow: 0.68, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "w5a",
    name: "W5A – HIIT",
    description: "4×4min @ 88% FTP · 60 rpm",
    durationMinutes: 78,
    powerPercent: 88,
    cadence: 60,
    fileName: "W5A_HIIT_88pct_60rpm.zwo",
    folderName: "High Torque - Phase 2 Build",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.72, cadence: 90 },
      { type: "intervals", repeat: 4, onDuration: 240, offDuration: 480, onPower: 0.88, offPower: 0.50, cadence: 60, cadenceResting: 85, duration: 4 * (240 + 480) },
      { type: "cooldown", duration: 900, powerLow: 0.72, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "w5b",
    name: "W5B – Endurance",
    description: "2×20min Zone 2 · 65 rpm",
    durationMinutes: 70,
    powerPercent: 65,
    cadence: 65,
    fileName: "W5B_Endurance_65rpm.zwo",
    folderName: "High Torque - Phase 2 Build",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.68, cadence: 90 },
      { type: "steady", duration: 1200, power: 0.65, cadence: 65 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 1200, power: 0.65, cadence: 65 },
      { type: "cooldown", duration: 600, powerLow: 0.68, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "w6a",
    name: "W6A – HIIT",
    description: "4×4min @ 90% FTP · 59 rpm",
    durationMinutes: 78,
    powerPercent: 90,
    cadence: 59,
    fileName: "W6A_HIIT_90pct_59rpm.zwo",
    folderName: "High Torque - Phase 2 Build",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "intervals", repeat: 4, onDuration: 240, offDuration: 480, onPower: 0.90, offPower: 0.50, cadence: 59, cadenceResting: 85, duration: 4 * (240 + 480) },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "w6b",
    name: "W6B – Endurance",
    description: "3×15min Zone 2 · 63 rpm",
    durationMinutes: 80,
    powerPercent: 65,
    cadence: 63,
    fileName: "W6B_Endurance_63rpm.zwo",
    folderName: "High Torque - Phase 2 Build",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.68, cadence: 90 },
      { type: "steady", duration: 900, power: 0.65, cadence: 63 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 900, power: 0.65, cadence: 63 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 900, power: 0.65, cadence: 63 },
      { type: "cooldown", duration: 600, powerLow: 0.68, powerHigh: 0.40, cadence: 90 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Phase 3 — Full Protocol (Weeks 7–8)
// ---------------------------------------------------------------------------

const phase3Workouts: Workout[] = [
  {
    id: "p3-w7d1",
    name: "Week 7 · Day 1 – SIT",
    description: "2×(4×30sec max) · 55 rpm",
    durationMinutes: 76,
    powerPercent: 150,
    cadence: 55,
    fileName: "Day1_SIT_55rpm.zwo",
    folderName: "High Torque - Phase 3 Protocol",
    segments: [
      { type: "warmup", duration: 1200, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "intervals", repeat: 4, onDuration: 30, offDuration: 90, onPower: 1.50, offPower: 0.50, cadence: 55, cadenceResting: 80, duration: 4 * (30 + 90) },
      { type: "steady", duration: 1500, power: 0.55, cadence: 85 },
      { type: "intervals", repeat: 4, onDuration: 30, offDuration: 90, onPower: 1.50, offPower: 0.50, cadence: 55, cadenceResting: 80, duration: 4 * (30 + 90) },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "p3-w7d2",
    name: "Week 7 · Day 2 – HIIT",
    description: "4×4min @ 110% FTP · 65 rpm",
    durationMinutes: 83,
    powerPercent: 110,
    cadence: 65,
    fileName: "Day2_HIIT_65rpm.zwo",
    folderName: "High Torque - Phase 3 Protocol",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "steady", duration: 30, power: 1.10, cadence: 90 },
      { type: "steady", duration: 120, power: 0.55, cadence: 90 },
      { type: "steady", duration: 30, power: 1.10, cadence: 90 },
      { type: "steady", duration: 120, power: 0.55, cadence: 90 },
      { type: "intervals", repeat: 4, onDuration: 240, offDuration: 480, onPower: 1.10, offPower: 0.50, cadence: 65, cadenceResting: 85, duration: 4 * (240 + 480) },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "p3-w7d3",
    name: "Week 7 · Day 3 – LIT",
    description: "90–120 min easy ride · normal cadence",
    durationMinutes: 105,
    powerPercent: 0,
    cadence: 0,
    fileName: "",
    folderName: "",
    segments: [],
  },
  {
    id: "p3-w7d4",
    name: "Week 7 · Day 4 – Recovery",
    description: "45–60 min easy spin",
    durationMinutes: 52,
    powerPercent: 0,
    cadence: 0,
    fileName: "",
    folderName: "",
    segments: [],
  },
  {
    id: "p3-w8d1",
    name: "Week 8 · Day 1 – SIT",
    description: "3×(4×30sec max) · 55 rpm",
    durationMinutes: 109,
    powerPercent: 150,
    cadence: 55,
    fileName: "W8_Day1_SIT_55rpm.zwo",
    folderName: "High Torque - Phase 3 Protocol",
    segments: [
      { type: "warmup", duration: 1200, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "intervals", repeat: 4, onDuration: 30, offDuration: 90, onPower: 1.50, offPower: 0.50, cadence: 55, cadenceResting: 80, duration: 4 * (30 + 90) },
      { type: "steady", duration: 1500, power: 0.55, cadence: 85 },
      { type: "intervals", repeat: 4, onDuration: 30, offDuration: 90, onPower: 1.50, offPower: 0.50, cadence: 55, cadenceResting: 80, duration: 4 * (30 + 90) },
      { type: "steady", duration: 1500, power: 0.55, cadence: 85 },
      { type: "intervals", repeat: 4, onDuration: 30, offDuration: 90, onPower: 1.50, offPower: 0.50, cadence: 55, cadenceResting: 80, duration: 4 * (30 + 90) },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "p3-w8d2",
    name: "Week 8 · Day 2 – HIIT",
    description: "6×4min @ 110% FTP · 65 rpm",
    durationMinutes: 107,
    powerPercent: 110,
    cadence: 65,
    fileName: "W8_Day2_HIIT_65rpm.zwo",
    folderName: "High Torque - Phase 3 Protocol",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "steady", duration: 30, power: 1.10, cadence: 90 },
      { type: "steady", duration: 120, power: 0.55, cadence: 90 },
      { type: "steady", duration: 30, power: 1.10, cadence: 90 },
      { type: "steady", duration: 120, power: 0.55, cadence: 90 },
      { type: "intervals", repeat: 6, onDuration: 240, offDuration: 480, onPower: 1.10, offPower: 0.50, cadence: 65, cadenceResting: 85, duration: 6 * (240 + 480) },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "p3-w8d3",
    name: "Week 8 · Day 3 – LIT",
    description: "90–120 min easy ride · normal cadence",
    durationMinutes: 105,
    powerPercent: 0,
    cadence: 0,
    fileName: "",
    folderName: "",
    segments: [],
  },
  {
    id: "p3-w8d4",
    name: "Week 8 · Day 4 – Recovery",
    description: "45–60 min easy spin",
    durationMinutes: 52,
    powerPercent: 0,
    cadence: 0,
    fileName: "",
    folderName: "",
    segments: [],
  },
];

// ---------------------------------------------------------------------------
// Library Sessions
// ---------------------------------------------------------------------------

const libraryWorkouts: Workout[] = [
  {
    id: "lib-sweet-spot",
    name: "Sweet Spot Torque",
    description: "3×12min @ 88% FTP · 60 rpm",
    durationMinutes: 84,
    powerPercent: 88,
    cadence: 60,
    fileName: "Sweet_Spot_Torque.zwo",
    folderName: "High Torque - Library",
    frequencyGuide: "weekly",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "intervals", repeat: 3, onDuration: 720, offDuration: 360, onPower: 0.88, offPower: 0.50, cadence: 60, cadenceResting: 85, duration: 3 * (720 + 360) },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "lib-pyramid",
    name: "Pyramid",
    description: "2-4-6-4-2 min @ 88% FTP · 60 rpm",
    durationMinutes: 60,
    powerPercent: 88,
    cadence: 60,
    fileName: "Pyramid_88pct_60rpm.zwo",
    folderName: "High Torque - Library",
    frequencyGuide: "weekly",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "steady", duration: 120, power: 0.88, cadence: 60 },
      { type: "steady", duration: 180, power: 0.50, cadence: 85 },
      { type: "steady", duration: 240, power: 0.88, cadence: 60 },
      { type: "steady", duration: 180, power: 0.50, cadence: 85 },
      { type: "steady", duration: 360, power: 0.88, cadence: 60 },
      { type: "steady", duration: 180, power: 0.50, cadence: 85 },
      { type: "steady", duration: 240, power: 0.88, cadence: 60 },
      { type: "steady", duration: 180, power: 0.50, cadence: 85 },
      { type: "steady", duration: 120, power: 0.88, cadence: 60 },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "lib-torque-endurance",
    name: "Torque Endurance",
    description: "4×15min @ 75% FTP · 60 rpm",
    durationMinutes: 110,
    powerPercent: 75,
    cadence: 60,
    fileName: "Torque_Endurance.zwo",
    folderName: "High Torque - Library",
    frequencyGuide: "weekly",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.72, cadence: 90 },
      { type: "intervals", repeat: 4, onDuration: 900, offDuration: 300, onPower: 0.75, offPower: 0.50, cadence: 60, cadenceResting: 85, duration: 4 * (900 + 300) },
      { type: "cooldown", duration: 900, powerLow: 0.72, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "lib-over-under",
    name: "Over-Under",
    description: "3×(4×2/1min) @ 95/78% FTP · 60 rpm",
    durationMinutes: 76,
    powerPercent: 95,
    cadence: 60,
    fileName: "Over_Under_Torque_60rpm.zwo",
    folderName: "High Torque - Library",
    frequencyGuide: "every-2-3-weeks",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "intervals", repeat: 4, onDuration: 120, offDuration: 60, onPower: 0.95, offPower: 0.78, cadence: 60, cadenceResting: 60, duration: 4 * (120 + 60) },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "intervals", repeat: 4, onDuration: 120, offDuration: 60, onPower: 0.95, offPower: 0.78, cadence: 60, cadenceResting: 60, duration: 4 * (120 + 60) },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "intervals", repeat: 4, onDuration: 120, offDuration: 60, onPower: 0.95, offPower: 0.78, cadence: 60, cadenceResting: 60, duration: 4 * (120 + 60) },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "lib-threshold",
    name: "Threshold Block",
    description: "2×20min @ 93% FTP · 60 rpm",
    durationMinutes: 75,
    powerPercent: 93,
    cadence: 60,
    fileName: "Threshold_Block_60rpm.zwo",
    folderName: "High Torque - Library",
    frequencyGuide: "every-2-3-weeks",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "steady", duration: 1200, power: 0.93, cadence: 60 },
      { type: "steady", duration: 300, power: 0.50, cadence: 85 },
      { type: "steady", duration: 1200, power: 0.93, cadence: 60 },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
  {
    id: "lib-torquemax",
    name: "TorqueMax (Advanced)",
    description: "6×2min @ 110% FTP · 55 rpm",
    durationMinutes: 71,
    powerPercent: 110,
    cadence: 55,
    fileName: "TorqueMax_Advanced.zwo",
    folderName: "High Torque - Library",
    frequencyGuide: "monthly",
    segments: [
      { type: "warmup", duration: 900, powerLow: 0.40, powerHigh: 0.75, cadence: 90 },
      { type: "steady", duration: 30, power: 1.10, cadence: 90 },
      { type: "steady", duration: 120, power: 0.55, cadence: 90 },
      { type: "steady", duration: 30, power: 1.10, cadence: 90 },
      { type: "steady", duration: 120, power: 0.55, cadence: 90 },
      { type: "intervals", repeat: 6, onDuration: 120, offDuration: 240, onPower: 1.10, offPower: 0.50, cadence: 55, cadenceResting: 85, duration: 6 * (120 + 240) },
      { type: "cooldown", duration: 900, powerLow: 0.75, powerHigh: 0.40, cadence: 90 },
    ],
  },
];

// ---------------------------------------------------------------------------
// All phases
// ---------------------------------------------------------------------------

export const phases: Phase[] = [
  {
    id: "phase-1",
    name: "Phase 1 — Adaptation",
    subtitle: "Weeks 1–3",
    description:
      "One low-cadence session per week. All other rides: normal cadence. Tendons and connective tissue adapt more slowly than muscles — this phase is non-negotiable.",
    workouts: phase1Workouts,
  },
  {
    id: "phase-2",
    name: "Phase 2 — Build",
    subtitle: "Weeks 4–6",
    description:
      "Two low-cadence sessions per week: one HIIT (A), one endurance (B). Do not do A and B on consecutive days.",
    workouts: phase2Workouts,
  },
  {
    id: "phase-3",
    name: "Phase 3 — Full Protocol",
    subtitle: "Weeks 7–8",
    description:
      "Four-day microcycle from the Hebisz & Hebisz (2024) study. Only proceed if knees have felt fine in Phases 1 and 2. Microcycle order: Day 1 → Day 2 → Day 3 (easy, normal cadence) → Day 4 (rest/recovery).",
    workouts: phase3Workouts,
  },
  {
    id: "library",
    name: "Library",
    subtitle: "Ongoing — after the 8-week block",
    description:
      "Max 2 low-cadence sessions per week (coach consensus: Henderson, EVOQ, EF Pro Cycling). Pick one harder and one easier. Rotate for variety.",
    workouts: libraryWorkouts,
  },
];
