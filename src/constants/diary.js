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

// 글로 쓰기 본문 최대 글자 수 (D01 0 / 500, DB 제약 동일)
export const TEXT_MAX_LENGTH = 500;
