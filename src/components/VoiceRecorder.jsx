import micIcon from "@/assets/icons/mic-white.svg";
import pauseIcon from "@/assets/icons/pause.svg";
import { VOICE_ERROR_MESSAGES } from "@/hooks/useVoiceRecorder";
import { formatDuration } from "@/utils/date";

const LIVE_TEXT_MAX = 60;

// 녹음 파형 — 마이크 입력 크기(AnalyserNode) 반영, 대기 중에는 회색 5px
function Waveform({ active, levels }) {
  return (
    <div
      className="flex h-9.5 w-60.5 items-center justify-center gap-1.25"
      aria-hidden="true"
    >
      {levels.map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-[3px] transition-[height] duration-75 ${
            active ? "bg-yellow" : "bg-inactive"
          }`}
          style={{ height: active ? h : 5 }}
        />
      ))}
    </div>
  );
}

function statusText({ isRecording, isBusy, seconds, error }) {
  if (error) return VOICE_ERROR_MESSAGES[error];
  if (isBusy && !isRecording) return "잠시만 기다려 주세요…";
  if (isRecording) return `${formatDuration(seconds)}  ·  듣고 있어요`;
  return "녹음 시작 버튼을 눌러서 시작해주세요.";
}

// 음성 녹음: 녹음 버튼(100px) + 파형 + 안내/시간 + 실시간 인식 텍스트
function VoiceRecorder({ recorder, onToggle }) {
  const { isRecording, isBusy, levels, transcript, error, isBlocked } =
    recorder;
  const live =
    transcript.length > LIVE_TEXT_MAX
      ? `…${transcript.slice(-LIVE_TEXT_MAX)}`
      : transcript;

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        aria-label={isRecording ? "녹음 완료" : "녹음 시작"}
        onClick={onToggle}
        disabled={isBusy || isBlocked}
        className="flex size-25 items-center justify-center rounded-full bg-yellow disabled:bg-border-neutral"
      >
        <img
          src={isRecording ? pauseIcon : micIcon}
          alt=""
          width={40}
          height={40}
        />
      </button>
      <Waveform active={isRecording} levels={levels} />
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <p
          role={error ? "alert" : "status"}
          className="text-body-sm font-medium whitespace-pre-wrap text-muted"
        >
          {statusText(recorder)}
        </p>
        {isRecording && live && (
          <p className="line-clamp-2 text-body-sm font-medium text-ink">
            {live}
          </p>
        )}
      </div>
    </div>
  );
}

export default VoiceRecorder;
