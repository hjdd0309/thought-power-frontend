import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";

// 말로 쓰기 하단 버튼 — 녹음 시작/완료, 오류 시 "글로 쓰기로 바꾸기"
function VoiceActions({ recorder, onToggle, onSwitchToText, disabled }) {
  const { isRecording, isBusy, error, isBlocked } = recorder;

  return (
    <BottomAction className="gap-3.5">
      {error && (
        <Button
          variant={isBlocked ? "primary" : "secondary"}
          onClick={onSwitchToText}
        >
          글로 쓰기로 바꾸기
        </Button>
      )}
      {!isBlocked && (
        <Button disabled={disabled || isBusy} onClick={onToggle}>
          {isRecording ? "녹음 완료" : error ? "다시 녹음" : "녹음 시작"}
        </Button>
      )}
    </BottomAction>
  );
}

export default VoiceActions;
