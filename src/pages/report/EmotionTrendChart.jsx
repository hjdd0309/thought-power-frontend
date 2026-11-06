import { EMOTIONS, getEmotion } from "@/constants/emotions";
import { parseISODate } from "@/utils/date";

// E05 날짜별 감정 변화 — 362×280 카드 안 SVG
// Figma 기준: 행 간격 36px(기쁨 y=30 … 부끄러움 y=210), 1일 x=83, 하루 8.483px
const ROW_TOP = 30;
const ROW_GAP = 36;
const X_START = 83;
const DAY_STEP = 8.483;
const MIN_DAYS = 31;
const PLOT_WIDTH = DAY_STEP * (MIN_DAYS - 1);
const TICK_INDEXES = [0, 4, 9, 14, 19, 24, 29];

function EmotionTrendChart({ days }) {
  const step = PLOT_WIDTH / (Math.max(days.length, MIN_DAYS) - 1);
  const rowOf = (code) => EMOTIONS.findIndex((e) => e.code === code);

  const points = days.flatMap((d, i) =>
    d.emotions.map((emotion) => ({
      x: X_START + i * step,
      y: ROW_TOP + rowOf(emotion) * ROW_GAP,
      emotion,
      key: `${d.date}-${emotion}-${i}`,
    })),
  );

  return (
    <div className="relative h-70 rounded-card border border-border-neutral bg-white">
      <svg
        width="362"
        height="280"
        viewBox="0 0 362 280"
        className="absolute -top-px -left-px"
        role="img"
        aria-label="날짜별 감정 변화 그래프"
      >
        {EMOTIONS.map((e, i) => (
          <g key={e.code}>
            <text
              x="9"
              y={ROW_TOP + i * ROW_GAP + 4}
              className="fill-muted text-caption font-medium"
            >
              {e.label}
            </text>
            <rect
              x="77"
              y={ROW_TOP + i * ROW_GAP}
              width="270"
              height="1"
              className="fill-border-neutral"
            />
          </g>
        ))}

        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#BFC0C4"
          strokeWidth="1.5"
        />
        {points.map((p) => (
          <circle
            key={p.key}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={getEmotion(p.emotion)?.color}
          />
        ))}

        {TICK_INDEXES.map((idx) => {
          // 기간 시작일 + idx일의 '일' 표시 (기간이 짧아도 축은 31일 기준)
          const tickDate = days[0] ? parseISODate(days[0].date) : new Date();
          tickDate.setDate(tickDate.getDate() + idx);
          const label = `${tickDate.getDate()}일`;
          return (
            <text
              key={idx}
              x={86 + (idx === 0 ? 0 : ((idx + 1) / 5) * 40)}
              y="256"
              textAnchor="middle"
              className="fill-muted text-caption font-medium"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default EmotionTrendChart;
