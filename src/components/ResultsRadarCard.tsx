"use client";

type RadarPoint = {
  label: string;
  value: number; // 0-5
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function radarPolygon(points: RadarPoint[], cx: number, cy: number, radius: number) {
  return points
    .map((point, index) => {
      const angle = (360 / points.length) * index;
      const scaledRadius = (radius * point.value) / 5;
      const p = polarToCartesian(cx, cy, scaledRadius, angle);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

function ringPolygon(count: number, cx: number, cy: number, radius: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (360 / count) * index;
    const p = polarToCartesian(cx, cy, radius, angle);
    return `${p.x},${p.y}`;
  }).join(" ");
}

export default function ResultsRadarCard({
  overall,
  grade,
  points,
}: {
  overall: number;
  grade: string;
  points: RadarPoint[];
}) {
  const cx = 170;
  const cy = 170;
  const radius = 108;

  return (
    <div className="rr-card">
      <div className="rr-top">
        <div>
          <div className="rr-kicker">Results dashboard</div>
          <h3>Your cyber resilience profile</h3>
          <p>Like a credit score for cybersecurity — clear enough for leaders, practical enough to drive action.</p>
        </div>

        <div className="rr-scoreBox">
          <div className="rr-scoreLabel">Overall</div>
          <div className="rr-scoreValue">{overall.toFixed(2)}</div>
          <div className="rr-scoreSub">
            Grade {grade}
          </div>
        </div>
      </div>

      <div className="rr-chartWrap">
        <svg viewBox="0 0 340 340" className="rr-chart" aria-label="Radar chart of domain scores">
          {[1, 2, 3, 4, 5].map((level) => (
            <polygon
              key={level}
              points={ringPolygon(points.length, cx, cy, (radius * level) / 5)}
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
            points={radarPolygon(points, cx, cy, radius)}
            fill="rgba(13, 177, 123, 0.18)"
            stroke="rgba(13, 177, 123, 0.95)"
            strokeWidth="2"
          />

          {points.map((point, index) => {
            const angle = (360 / points.length) * index;
            const valuePoint = polarToCartesian(cx, cy, (radius * point.value) / 5, angle);
            const labelPoint = polarToCartesian(cx, cy, radius + 26, angle);

            return (
              <g key={point.label}>
                <circle cx={valuePoint.x} cy={valuePoint.y} r="4" fill="rgba(13, 177, 123, 1)" />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
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

      <div className="rr-legend">
        {points.map((point) => (
          <div key={point.label} className="rr-legendItem">
            <span className="rr-dot" />
            <span className="rr-label">{point.label}</span>
            <span className="rr-value">{point.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}