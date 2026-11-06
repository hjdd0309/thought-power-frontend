import { getEmotion } from "@/constants/emotions";

const PLOT_HEIGHT = 130; // 0 → 최대 눈금 (Figma: 10 = 34px, 0 = 164px)

// E04 감정 기록 수 · 막대 차트 + 범례
function EmotionBarChart({ distribution }) {
  const maxCount = Math.max(0, ...distribution.map((d) => d.count));
  const maxTick = Math.max(10, Math.ceil(maxCount / 5) * 5);
  const ticks = [maxTick, maxTick / 2, 0];

  return (
    <div>
      <div className="relative h-45">
        {ticks.map((t, i) => (
          <div
            key={t}
            className="absolute left-0 flex w-full items-center"
            style={{ top: 34 + i * (PLOT_HEIGHT / 2) - 7 }}
          >
            <span className="w-6 text-right text-caption font-medium text-muted">
              {t}
            </span>
            <span className="ml-1.5 h-px w-80 bg-border-neutral" />
          </div>
        ))}
        <div className="absolute top-0 left-9 flex h-41 items-end gap-2.25">
          {distribution.map((d) => (
            <div key={d.emotion} className="flex w-11 justify-center">
              <div
                className="w-7 rounded-[5px]"
                style={{
                  height: (d.count / maxTick) * PLOT_HEIGHT,
                  backgroundColor: getEmotion(d.emotion)?.color,
                }}
                aria-label={`${getEmotion(d.emotion)?.label} ${d.count}개`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-8 flex gap-px">
        {distribution.map((d) => {
          const e = getEmotion(d.emotion);
          return (
            <div
              key={d.emotion}
              className="flex h-11 w-13 flex-col items-center gap-1"
            >
              <span
                className="size-2.5 rounded-[5px]"
                style={{ backgroundColor: e?.color }}
              />
              <span className="text-legend font-medium text-ink">
                {e?.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmotionBarChart;
