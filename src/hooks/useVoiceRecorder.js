import { useCallback, useEffect, useRef, useState } from "react";
import { USE_MOCK } from "@/api/mock";

/**
 * 음성 녹음 + 기기(브라우저) 음성 인식 — docs/spec.md 프론트 담당 "녹음·기기 음성 인식"
 *
 * - 마이크: getUserMedia → MediaRecorder(녹음, 브라우저 메모리에만 보관) + AnalyserNode(파형)
 * - 인식: Web Speech API(SpeechRecognition, ko-KR, continuous + interim)
 * - 우리 서버로 음성 파일을 보내지 않는다. 서버에는 사용자가 수정·확인한 텍스트만 저장한다.
 *   ※ Chrome의 Web Speech API는 인식을 위해 음성을 Google 음성 인식 서비스로 전송한다(브라우저 구현).
 * - VITE_USE_MOCK=true이고 인식 결과가 비어 있으면 mockTranscript로 대신한다(개발·테스트용).
 *
 * status: "idle" | "requesting"(권한 요청 중) | "recording" | "processing"(정지 후 최종 결과 대기)
 * error : null | "insecure" | "unsupported" | "denied" | "no-mic" | "network" | "empty" | "failed"
 */

export const BAR_COUNT = 22;
const MIN_BAR = 5;
const MAX_BAR = 36;
const LEVEL_INTERVAL_MS = 80;
const FINAL_RESULT_TIMEOUT_MS = 1500;

const IDLE_LEVELS = Array(BAR_COUNT).fill(MIN_BAR);

const getRecognitionClass = () =>
  typeof window === "undefined"
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition || null;

/** 이 환경에서 말로 쓰기를 쓸 수 없는 이유 (쓸 수 있으면 null) */
export function getVoiceUnavailableReason() {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia || !getRecognitionClass()) {
    return "unsupported";
  }
  return null;
}

// 녹음 버튼과 "글로 쓰기로 바꾸기"가 함께 보이는 오류는 한 줄로 (하단 버튼에 가리지 않게)
export const VOICE_ERROR_MESSAGES = {
  insecure:
    "말로 쓰기는 보안 연결(https)에서만 쓸 수 있어요.\n글로 쓰기로 바꿔서 기록해 주세요.",
  unsupported:
    "이 브라우저에서는 말로 쓰기를 쓸 수 없어요.\n글로 쓰기로 바꿔서 기록해 주세요.",
  denied: "마이크 권한을 허용해 주세요.",
  "no-mic": "마이크를 찾을 수 없어요.",
  network: "음성 인식에 연결하지 못했어요.",
  empty: "말소리가 들리지 않았어요.",
  failed: "녹음을 시작하지 못했어요.",
};

// 다시 시도해도 해결되지 않는 오류 → 녹음 버튼을 숨기고 글로 쓰기만 안내
export const BLOCKING_ERRORS = ["insecure", "unsupported"];

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) =>
    MediaRecorder.isTypeSupported?.(t),
  );
}

export default function useVoiceRecorder({ mockTranscript = "" } = {}) {
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState(IDLE_LEVELS);
  const [transcript, setTranscript] = useState(""); // 확정 + 인식 중(interim) 텍스트
  const [error, setError] = useState(() => getVoiceUnavailableReason());

  const r = useRef({
    stream: null,
    recorder: null,
    chunks: [],
    audioBlob: null,
    audioCtx: null,
    rafId: 0,
    timerId: 0,
    recognition: null,
    recording: false,
    committed: "", // 이전 인식 세션에서 확정된 텍스트
    sessionFinal: "", // 현재 세션에서 확정된 텍스트
    interim: "",
    onRecognitionEnd: null,
  });

  const releaseDevices = useCallback(() => {
    const s = r.current;
    cancelAnimationFrame(s.rafId);
    clearInterval(s.timerId);
    s.stream?.getTracks().forEach((t) => t.stop());
    s.stream = null;
    s.audioCtx?.close().catch(() => {});
    s.audioCtx = null;
    setLevels(IDLE_LEVELS);
  }, []);

  const abortAll = useCallback(() => {
    const s = r.current;
    s.recording = false;
    s.onRecognitionEnd = null;
    try {
      s.recognition?.abort();
    } catch {
      /* 이미 종료됨 */
    }
    s.recognition = null;
    if (s.recorder?.state === "recording") s.recorder.stop();
    s.recorder = null;
    releaseDevices();
  }, [releaseDevices]);

  // 화면을 벗어나면 마이크를 반드시 끈다
  useEffect(() => abortAll, [abortAll]);

  const fullText = () => {
    const s = r.current;
    return `${s.committed}${s.sessionFinal}${s.interim}`.trim();
  };

  const startRecognition = (Recognition) => {
    const s = r.current;
    const recognition = new Recognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text;
        else interimText += text;
      }
      s.sessionFinal = finalText;
      s.interim = interimText;
      setTranscript(fullText());
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      s.recording = false;
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setError("denied");
      } else if (event.error === "audio-capture") {
        setError("no-mic");
      } else if (event.error === "network") {
        setError("network");
      } else {
        setError("failed");
      }
      abortAll();
      setStatus("idle");
    };

    // Chrome은 침묵이 길면 세션을 끝낸다 → 녹음 중이면 이어서 다시 시작
    recognition.onend = () => {
      s.committed = `${s.committed}${s.sessionFinal}`;
      s.sessionFinal = "";
      if (s.recording) {
        s.interim = "";
        try {
          recognition.start();
        } catch {
          /* 재시작 실패 시 정지 처리에서 마무리 */
        }
        return;
      }
      s.onRecognitionEnd?.();
    };

    s.recognition = recognition;
    recognition.start();
  };

  const startLevels = (stream) => {
    const s = r.current;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.6;
    ctx.createMediaStreamSource(stream).connect(analyser);
    s.audioCtx = ctx;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let last = 0;
    const tick = (now) => {
      s.rafId = requestAnimationFrame(tick);
      if (now - last < LEVEL_INTERVAL_MS) return;
      last = now;
      analyser.getByteFrequencyData(data);
      // 말소리 대역(앞쪽 bin)을 22개 막대로 나눠 높이로 변환
      const usable = Math.floor(data.length * 0.7);
      const per = Math.max(1, Math.floor(usable / BAR_COUNT));
      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        let sum = 0;
        for (let j = 0; j < per; j++) sum += data[i * per + j] ?? 0;
        const v = sum / per / 255;
        return Math.round(MIN_BAR + Math.min(1, v * 1.6) * (MAX_BAR - MIN_BAR));
      });
      setLevels(next);
    };
    s.rafId = requestAnimationFrame(tick);
  };

  const start = async () => {
    const unavailable = getVoiceUnavailableReason();
    if (unavailable) {
      setError(unavailable);
      return;
    }
    const s = r.current;
    setError(null);
    setTranscript("");
    setSeconds(0);
    Object.assign(s, {
      committed: "",
      sessionFinal: "",
      interim: "",
      chunks: [],
      audioBlob: null,
    });
    setStatus("requesting");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setError(
        e?.name === "NotAllowedError" || e?.name === "SecurityError"
          ? "denied"
          : e?.name === "NotFoundError"
            ? "no-mic"
            : "failed",
      );
      setStatus("idle");
      return;
    }

    s.stream = stream;
    s.recording = true;

    // 녹음 — 음성 파일은 브라우저 메모리에만 두고 서버로 보내지 않는다
    if (typeof MediaRecorder !== "undefined") {
      try {
        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );
        recorder.ondataavailable = (e) => {
          if (e.data.size) s.chunks.push(e.data);
        };
        recorder.onstop = () => {
          s.audioBlob = new Blob(s.chunks, { type: recorder.mimeType });
        };
        recorder.start();
        s.recorder = recorder;
      } catch {
        s.recorder = null; // 녹음 파일 없이 인식만 진행
      }
    }

    startLevels(stream);
    try {
      startRecognition(getRecognitionClass());
    } catch {
      abortAll();
      setError("failed");
      setStatus("idle");
      return;
    }

    s.timerId = setInterval(() => setSeconds((sec) => sec + 1), 1000);
    setStatus("recording");
  };

  /** 녹음을 끝내고 최종 인식 텍스트를 돌려준다 (비어 있으면 "") */
  const stop = async () => {
    const s = r.current;
    if (!s.recording) return "";
    s.recording = false;
    setStatus("processing");

    // 마지막 확정 결과가 들어올 때까지 잠깐 기다린다
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, FINAL_RESULT_TIMEOUT_MS);
      s.onRecognitionEnd = () => {
        clearTimeout(timeout);
        resolve();
      };
      try {
        s.recognition?.stop();
      } catch {
        clearTimeout(timeout);
        resolve();
      }
    });
    s.onRecognitionEnd = null;
    s.recognition = null;
    if (s.recorder?.state === "recording") s.recorder.stop();
    s.recorder = null;
    releaseDevices();

    let text = fullText();
    if (!text && USE_MOCK) text = mockTranscript;
    setStatus("idle");
    if (!text) setError("empty");
    return text;
  };

  const reset = () => {
    abortAll();
    setStatus("idle");
    setSeconds(0);
    setTranscript("");
    setError(getVoiceUnavailableReason());
  };

  return {
    status,
    isRecording: status === "recording",
    isBusy: status === "requesting" || status === "processing",
    seconds,
    levels,
    transcript,
    error,
    isBlocked: BLOCKING_ERRORS.includes(error),
    start,
    stop,
    reset,
  };
}
