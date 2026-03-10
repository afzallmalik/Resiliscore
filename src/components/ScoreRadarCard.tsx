"use client";

type RadarPoint = {
  label: string;
  value: number; // 0-100
};

const DEFAULT_POINTS: RadarPoint[] = [
  { label: "Governance", value: 72 },
  { label: "Risk", value: 64 },
  { label: "Technology", value: 58 },
  { label: "People", value: 61 },
  { label: "Suppliers", value: 49 },
  { label: "Recovery", value: 67 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function polygonPoints(points: RadarPoint[], cx: number, cy: number, radius: number) {
  return points
    .map((point, index) => {
      const angle = (360 / points.length) * index;
      const p = polarToCartesian(cx, cy, (radius * point.value) / 100, angle);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

function ringPoints(count: number, cx: number, cy: number, radius: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const p = polarToCartesian(cx, cy, radius, angle);
    return `${p.x},${p.y}`;
  }).join(" ");
}

export default function ScoreRadarCard({
  title = "Your cyber resilience score",
  subtitle = "Like a credit score for cybersecurity — simple enough for leaders, detailed enough to drive action.",
  overallScore = 63,
  points = DEFAULT_POINTS,
}: {
  title?: string;
  subtitle?: string;
  overallScore?: number;
  points?: RadarPoint[];
}) {
  const cx = 170;
  const cy = 170;
  const radius = 108;

  return (
    <div className="scoreCard">
      <div className="scoreCardTop">
        <div>
          <div className="scoreEyebrow">Signature visual</div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <div className="scoreBadge">
          <span className="scoreBadgeLabel">Overall score</span>
          <span className="scoreBadgeValue">{overallScore}</span>
          <span className="scoreBadgeOutOf">/100</span>
        </div>
      </div>

      <div className="scoreChartWrap">
        <svg viewBox="0 0 340 340" className="scoreChart" aria-label="Resiliscore radar chart">
          {[0.25, 0.5, 0.75, 1].map((level) => (
            <polygon
              key={level}
              points={ringPoints(points.length, cx, cy, radius * level)}
              fill="none"
              stroke="rgba(6,27,34,0.10)"
              strokeWidth="1"
            />
          ))}

          {points.map((point, index) => {
            const angle = (360 / points.length) * index;
            const outer = polarToCartesian(cx, cy, radius, angle);
            return (
              <line
                key={point.label}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(6,27,34,0.10)"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={polygonPoints(points, cx, cy, radius)}
            fill="rgba(13, 177, 123, 0.18)"
            stroke="rgba(13, 177, 123, 0.95)"
            strokeWidth="2"
          />

          {points.map((point, index) => {
            const angle = (360 / points.length) * index;
            const valuePoint = polarToCartesian(cx, cy, (radius * point.value) / 100, angle);
            const labelPoint = polarToCartesian(cx, cy, radius + 26, angle);

            return (
              <g key={point.label}>
                <circle cx={valuePoint.x} cy={valuePoint.y} r="4" fill="rgba(13, 177, 123, 1)" />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="rgba(6,27,34,0.78)"
                  fontWeight="700"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="scoreLegend">
        {points.map((point) => (
          <div key={point.label} className="scoreLegendItem">
            <span className="scoreLegendDot" />
            <span className="scoreLegendLabel">{point.label}</span>
            <span className="scoreLegendValue">{point.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}