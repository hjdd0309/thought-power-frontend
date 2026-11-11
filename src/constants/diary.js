// 작성 방식 — 백엔드 InputType enum 기준
export const INPUT_TYPES = {
  VOICE: "VOICE",
  TEXT: "TEXT",
};

// 질문 순서 — docs/spec.md 질문 순서 기준
export const QUESTION_STEPS = [
  { order: 1, type: "EMOTION", label: "감정 탐색" },
  { order: 2, type: "REASON", label: "이유 탐색" },
  { order: 3, type: "PERSPECTIVE", label: "관점 확장" },
];

export const QUESTION_COUNT = QUESTION_STEPS.length;

export const getQuestionStep = (order) =>
  QUESTION_STEPS.find((q) => q.order === Number(order));

// 기본 질문 — mock 질문 흐름에서 사용 (실서버는 실패 시 서버가 isFallback 질문을 내려준다)
export const DEFAULT_QUESTIONS = [
  { order: 1, type: "EMOTION", content: "그때 어떤 기분이 들었나요?" },
  { order: 2, type: "REASON", content: "왜 그런 기분이 들었다고 생각하나요?" },
  {
    order: 3,
    type: "PERSPECTIVE",
    content: "친구는 그때 어떤 기분이었을까요?",
  },
];

// 글로 쓰기 본문 최대 글자 수 (D01 0 / 500, DB 제약 동일)
export const TEXT_MAX_LENGTH = 500;
