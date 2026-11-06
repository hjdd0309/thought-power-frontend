import { useEffect, useState } from "react";
import micIcon from "@/assets/icons/mic-white.svg";
import pauseIcon from "@/assets/icons/pause.svg";
import { formatDuration } from "@/utils/date";

const BAR_COUNT = 22;
// 녹음 파형 · 반복 상태 — 4단계 루프 시뮬레이션 (실제 마이크 입력 아님)
const WAVE_PATTERN = [12, 22, 32, 16, 26, 36, 20];
const WAVE_STEP_MS = 220;

function Waveform({ active }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const timer = setInterval(() => setFrame((f) => (f + 1) % 4), WAVE_STEP_MS);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="flex h-9.5 w-60.5 items-center justify-center gap-1.25">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          className={`w-1 rounded-[3px] transition-all duration-200 ${
            active ? "bg-yellow" : "bg-inactive"
          }`}
          style={{
            height: active
              ? WAVE_PATTERN[(i + frame * 2) % WAVE_PATTERN.length]
              : 5,
          }}
        />
      ))}
    </div>
  );
}

// 음성 녹음: 녹음 버튼(100px) + 파형 + 안내/시간
function VoiceRecorder({ isRecording, seconds, onToggle }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        aria-label={isRecording ? "녹음 완료" : "녹음 시작"}
        onClick={onToggle}
        className="flex size-25 items-center justify-center rounded-full bg-yellow"
      >
        <img
          src={isRecording ? pauseIcon : micIcon}
          alt=""
          width={40}
          height={40}
        />
      </button>
      <Waveform active={isRecording} />
      <p className="text-center text-body-sm font-medium whitespace-pre-wrap text-muted">
        {isRecording
          ? `${formatDuration(seconds)}  ·  듣고 있어요`
          : "녹음 시작 버튼을 눌러서 시작해주세요."}
      </p>
    </div>
  );
}

export default VoiceRecorder;
