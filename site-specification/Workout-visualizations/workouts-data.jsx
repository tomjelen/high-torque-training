// Workout block definitions for every session in the High Torque library.
// dur values are in seconds; power is fraction of FTP.
// kind: 'block' for steady, 'ramp' for warmup/cooldown trapezoid.
//
// Convention:
//   - 15 min Z2 warmup ramp from 0.55→0.75
//   - 5 min Z1 cooldown ramp from 0.6→0.4 (or similar)
//   - Recoveries are Z1 at 0.50 FTP
//   - cadence: true means this block has a cadence target (drives accent)
//   - Sprint blocks use zone 6 with power 1.40+ (clamped at chart top)

const WORKOUTS = (() => {
  const warmup = (mins = 15) => ({
    kind: 'ramp', zone: 2, fromPower: 0.55, toPower: 0.75, dur: mins * 60,
  });
  const cooldown = (mins = 5) => ({
    kind: 'ramp', zone: 1, fromPower: 0.60, toPower: 0.40, dur: mins * 60,
  });
  const rest = (mins, secs = 0) => ({
    kind: 'block', zone: 1, power: 0.50, dur: mins * 60 + secs,
  });
  const work = (zone, power, mins, secs = 0, cadence = true) => ({
    kind: 'block', zone, power, dur: mins * 60 + secs, cadence,
  });
  const sprint = (cadence = true) => ({
    kind: 'block', zone: 6, power: 1.45, dur: 30, cadence,
  });

  // Helper: build a recovery between work blocks
  const list = (...items) => items.flat();

  return [
    // ── Adaptation Phase ────────────────────────────────────────────────────
    {
      id: 'adapt-w1', tier: 'A', title: 'W1', subtitle: '2×10 @ 65–70 rpm',
      durMin: 50, tss: null, cadenceLabel: '65–70 rpm',
      blocks: list(
        warmup(15),
        work(2, 0.65, 10), rest(5),
        work(2, 0.65, 10),
        cooldown(5),
      ),
    },
    {
      id: 'adapt-w2', tier: 'A', title: 'W2', subtitle: '2×15 @ 65 rpm',
      durMin: 60, tss: null, cadenceLabel: '65 rpm',
      blocks: list(
        warmup(15),
        work(2, 0.65, 15), rest(5),
        work(2, 0.65, 15),
        cooldown(5),
      ),
    },
    {
      id: 'adapt-w3', tier: 'A', title: 'W3', subtitle: '3×10 @ 60–65 rpm',
      durMin: 65, tss: null, cadenceLabel: '60–65 rpm',
      blocks: list(
        warmup(15),
        work(2, 0.65, 10), rest(5),
        work(2, 0.65, 10), rest(5),
        work(2, 0.65, 10),
        cooldown(5),
      ),
    },

    // ── Tier 1 ─────────────────────────────────────────────────────────────
    {
      id: 't1-entry', tier: 'T1', title: 'Entry 4×4',
      subtitle: '4×4 @ 80–85% FTP', durMin: 60, tss: 38,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        work(3, 0.82, 4), rest(3),
        work(3, 0.82, 4), rest(3),
        work(3, 0.82, 4), rest(3),
        work(3, 0.82, 4),
        cooldown(15),
      ),
    },
    {
      id: 't1-staple-3x5', tier: 'T1', title: 'Staple 3×5',
      subtitle: '3×5 @ ~90% FTP', durMin: 55, tss: 44,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        work(3, 0.90, 5), rest(3),
        work(3, 0.90, 5), rest(3),
        work(3, 0.90, 5),
        cooldown(15),
      ),
    },

    // ── Tier 2 ─────────────────────────────────────────────────────────────
    {
      id: 't2-hiit-intro', tier: 'T2', title: 'HIIT Intro',
      subtitle: '3×3 @ ~110% FTP', durMin: 55, tss: 50,
      cadenceLabel: '60–70 rpm',
      blocks: list(
        warmup(15),
        work(5, 1.10, 3), rest(3),
        work(5, 1.10, 3), rest(3),
        work(5, 1.10, 3),
        cooldown(15),
      ),
    },
    {
      id: 't2-staple-5x5', tier: 'T2', title: 'Staple 5×5',
      subtitle: '5×5 @ ~90% FTP', durMin: 75, tss: 64,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        work(4, 0.90, 5), rest(3),
        work(4, 0.90, 5), rest(3),
        work(4, 0.90, 5), rest(3),
        work(4, 0.90, 5), rest(3),
        work(4, 0.90, 5),
        cooldown(15),
      ),
    },
    {
      id: 't2-staple-5x8', tier: 'T2', title: 'Staple 5×8',
      subtitle: '5×8 @ ~90% FTP', durMin: 90, tss: 86,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        work(4, 0.90, 8), rest(3),
        work(4, 0.90, 8), rest(3),
        work(4, 0.90, 8), rest(3),
        work(4, 0.90, 8), rest(3),
        work(4, 0.90, 8),
        cooldown(15),
      ),
    },

    // ── Tier 3 ─────────────────────────────────────────────────────────────
    {
      id: 't3-hiit-4', tier: 'T3', title: 'HIIT VO2max (4 reps)',
      subtitle: '4×4 @ ~110% FTP', durMin: 83, tss: 81,
      cadenceLabel: '60–70 rpm',
      blocks: list(
        warmup(15),
        work(5, 1.10, 4), rest(4),
        work(5, 1.10, 4), rest(4),
        work(5, 1.10, 4), rest(4),
        work(5, 1.10, 4),
        cooldown(15),
      ),
    },
    {
      id: 't3-ruegg', tier: 'T3', title: 'Rüegg VO2max + Sprint',
      subtitle: '3×(5min @ 110% + 1min sprint)', durMin: 80, tss: 94,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        work(5, 1.10, 5),
        { kind: 'block', zone: 6, power: 1.30, dur: 60, cadence: false },
        rest(5),
        work(5, 1.10, 5),
        { kind: 'block', zone: 6, power: 1.30, dur: 60, cadence: false },
        rest(5),
        work(5, 1.10, 5),
        { kind: 'block', zone: 6, power: 1.30, dur: 60, cadence: false },
        cooldown(15),
      ),
    },
    {
      id: 't3-thresh-5x5', tier: 'T3', title: 'Threshold 5×5',
      subtitle: '5×5 @ ~95% FTP', durMin: 68, tss: 66,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        work(4, 0.95, 5), rest(3),
        work(4, 0.95, 5), rest(3),
        work(4, 0.95, 5), rest(3),
        work(4, 0.95, 5), rest(3),
        work(4, 0.95, 5),
        cooldown(8),
      ),
    },

    // ── Tier 4 ─────────────────────────────────────────────────────────────
    {
      id: 't4-hiit-6', tier: 'T4', title: 'HIIT VO2max (6 reps)',
      subtitle: '6×4 @ ~110% FTP', durMin: 107, tss: 110,
      cadenceLabel: '60–70 rpm',
      blocks: list(
        warmup(15),
        work(5, 1.10, 4), rest(4),
        work(5, 1.10, 4), rest(4),
        work(5, 1.10, 4), rest(4),
        work(5, 1.10, 4), rest(4),
        work(5, 1.10, 4), rest(4),
        work(5, 1.10, 4),
        cooldown(15),
      ),
    },
    {
      id: 't4-sit-2', tier: 'T4', title: 'SIT (2 sets)',
      subtitle: '2×(4×30s max)', durMin: 76, tss: 62,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(),
        rest(15),
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(),
        cooldown(15),
      ),
    },
    {
      id: 't4-sit-3', tier: 'T4', title: 'SIT (3 sets)',
      subtitle: '3×(4×30s max) · 12 × 30s sprints', durMin: 109, tss: 90,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(),
        rest(15),
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(),
        rest(15),
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(), { kind: 'block', zone: 1, power: 0.45, dur: 30 },
        sprint(),
        cooldown(15),
      ),
    },
    {
      id: 't4-torquemax', tier: 'T4', title: 'TorqueMax',
      subtitle: '6×2–3 @ 105–110% FTP', durMin: 71, tss: 73,
      cadenceLabel: '50–60 rpm',
      blocks: list(
        warmup(15),
        work(5, 1.08, 2, 30), rest(3),
        work(5, 1.08, 2, 30), rest(3),
        work(5, 1.08, 2, 30), rest(3),
        work(5, 1.08, 2, 30), rest(3),
        work(5, 1.08, 2, 30), rest(3),
        work(5, 1.08, 2, 30),
        cooldown(15),
      ),
    },
  ];
})();

window.WORKOUTS = WORKOUTS;
