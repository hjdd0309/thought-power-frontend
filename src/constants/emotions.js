import angerIcon from "@/assets/emotions/anger.svg";
import fearIcon from "@/assets/emotions/fear.svg";
import joyIcon from "@/assets/emotions/joy.svg";
import sadnessIcon from "@/assets/emotions/sadness.svg";
import shameIcon from "@/assets/emotions/shame.svg";
import surpriseIcon from "@/assets/emotions/surprise.svg";

// 감정 6종 — 저장 코드는 docs/spec.md 감정 코드 기준, 색상은 Figma --emotion-* 변수
export const EMOTIONS = [
  { code: "JOY", label: "기쁨", color: "#fcdb04", icon: joyIcon },
  { code: "SADNESS", label: "슬픔", color: "#a1d8ea", icon: sadnessIcon },
  { code: "ANGER", label: "화남", color: "#f96553", icon: angerIcon },
  { code: "FEAR", label: "무서움", color: "#ccabdb", icon: fearIcon },
  { code: "SURPRISE", label: "놀람", color: "#cbec89", icon: surpriseIcon },
  { code: "SHAME", label: "부끄러움", color: "#fbc9cd", icon: shameIcon },
];

export const EMOTION_MAP = Object.fromEntries(EMOTIONS.map((e) => [e.code, e]));

export const getEmotion = (code) => EMOTION_MAP[code];
