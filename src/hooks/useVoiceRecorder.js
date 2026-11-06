import { useEffect, useState } from "react";

/**
 * 녹음 상태 관리 (UI용)
 * status: "idle" | "recording"
 *
 * TODO: 다음 단계에서 실제 녹음·기기 음성 인식 구현
 *   - start(): 마이크 권한 요청 후 녹음 시작 (MediaRecorder / Web Speech API 등, 방식은 팀 합의 후)
 *   - stop(): 녹음 종료 후 인식된 텍스트 반환
 * 현재는 타이머만 동작하고 stop()은 전달받은 mock 텍스트를 돌려준다.
 */
export default function useVoiceRecorder({ mockTranscript = "" } = {}) {
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (status !== "recording") return undefined;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const start = () => {
    setSeconds(0);
    setStatus("recording");
  };

  const stop = async () => {
    setStatus("idle");
    return mockTranscript;
  };

  const reset = () => {
    setStatus("idle");
    setSeconds(0);
  };

  return {
    status,
    seconds,
    isRecording: status === "recording",
    start,
    stop,
    reset,
  };
}
