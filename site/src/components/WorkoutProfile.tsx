import { Segment } from "../data/workouts";

interface Props {
  segments: Segment[];
  totalDuration: number;
}

// Zwift-style power zone colors (by FTP fraction)
function powerColor(fraction: number): string {
  if (fraction <= 0.55) return "#9E9E9E"; // Z1 recovery
  if (fraction <= 0.75) return "#42A5F5"; // Z2 endurance
  if (fraction <= 0.90) return "#66BB6A"; // Z3 tempo
  if (fraction <= 1.05) return "#FFA726"; // Z4 threshold
  if (fraction <= 1.20) return "#FF7043"; // Z5 VO2max
  return "#E53935";                        // Z6+ anaerobic
}

interface Rect {
  x: number;
  width: number;
  height: number;
  color: string;
}

function buildRects(segments: Segment[], totalDuration: number, svgW: number, svgH: number, maxPower: number): Rect[] {
  const rects: Rect[] = [];
  let elapsed = 0;

  const xOf = (t: number) => (t / totalDuration) * svgW;
  const hOf = (p: number) => (p / maxPower) * svgH;

  for (const seg of segments) {
    switch (seg.type) {
      case "warmup":
      case "cooldown": {
        // Trapezoid: approximate with 20 thin slices for smooth gradient appearance
        const steps = 20;
        const low = seg.powerLow ?? 0;
        const high = seg.powerHigh ?? 0;
        const stepDur = seg.duration / steps;
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const p = seg.type === "warmup" ? low + t * (high - low) : high + t * (low - high);
          rects.push({
            x: xOf(elapsed + i * stepDur),
            width: xOf(stepDur) + 0.5, // +0.5 to avoid sub-pixel gaps
            height: hOf(p),
            color: powerColor(p),
          });
        }
        elapsed += seg.duration;
        break;
      }
      case "steady": {
        const p = seg.power ?? 0;
        rects.push({
          x: xOf(elapsed),
          width: xOf(seg.duration),
          height: hOf(p),
          color: powerColor(p),
        });
        elapsed += seg.duration;
        break;
      }
      case "intervals": {
        const repeat = seg.repeat ?? 1;
        const onD = seg.onDuration ?? 0;
        const offD = seg.offDuration ?? 0;
        const onP = seg.onPower ?? 0;
        const offP = seg.offPower ?? 0;
        for (let i = 0; i < repeat; i++) {
          rects.push({
            x: xOf(elapsed),
            width: xOf(onD),
            height: hOf(onP),
            color: powerColor(onP),
          });
          elapsed += onD;
          if (offD > 0) {
            rects.push({
              x: xOf(elapsed),
              width: xOf(offD),
              height: hOf(offP),
              color: powerColor(offP),
            });
            elapsed += offD;
          }
        }
        break;
      }
    }
  }

  return rects;
}

export default function WorkoutProfile({ segments, totalDuration }: Props) {
  if (!segments.length || totalDuration === 0) return null;

  const svgW = 600;
  const svgH = 80;

  let maxPower = 0.1;
  for (const seg of segments) {
    if (seg.power) maxPower = Math.max(maxPower, seg.power);
    if (seg.powerHigh) maxPower = Math.max(maxPower, seg.powerHigh);
    if (seg.onPower) maxPower = Math.max(maxPower, seg.onPower);
    if (seg.offPower) maxPower = Math.max(maxPower, seg.offPower);
  }
  maxPower *= 1.05;

  const rects = buildRects(segments, totalDuration, svgW, svgH, maxPower);

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "80px", display: "block" }}
      aria-hidden="true"
    >
      {rects.map((r, i) => (
        <rect
          key={i}
          x={r.x}
          y={svgH - r.height}
          width={r.width}
          height={r.height}
          fill={r.color}
        />
      ))}
    </svg>
  );
}
