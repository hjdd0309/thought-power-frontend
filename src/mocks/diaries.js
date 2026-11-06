// 보관함 일기 mock — 일기 상세 형식
// { diaryId, date, emotion, inputType, content, questions: [{ order, type, content, answer }] }

const QUESTIONS = [
  { order: 1, type: "EMOTION", content: "그때 어떤 기분이 들었나요?" },
  { order: 2, type: "REASON", content: "왜 그런 기분이 들었다고 생각하나요?" },
  {
    order: 3,
    type: "PERSPECTIVE",
    content: "친구는 그때 어떤 기분이었을까요?",
  },
];

const make = (diaryId, date, emotion, content, answers) => ({
  diaryId,
  date,
  emotion,
  inputType: "VOICE",
  content,
  questions: QUESTIONS.map((q, i) => ({ ...q, answer: answers[i] })),
});

const SAMPLE_ANSWERS = [
  "친구와 함께 완성해서 기뻤어요.",
  "서로 도우니 더 재미있었어요.",
  "친구도 함께해서 좋았을 것 같아요.\n다음에도 필요한 것을 나눌래요.",
];

// Figma E01 '일기 존재' 날짜(10월 1·2·3·4·6·7·8·10·11·12·14·15일) 기준 12개
// 감정 분포는 E04 예시(기쁨 4, 슬픔·화남·부끄러움 2, 무서움·놀람 1)와 맞춤
const SEED = [
  ["2026-10-01", "JOY"],
  ["2026-10-02", "SADNESS"],
  ["2026-10-03", "ANGER"],
  ["2026-10-04", "JOY"],
  ["2026-10-06", "SHYNESS"],
  ["2026-10-07", "FEAR"],
  ["2026-10-08", "JOY"],
  ["2026-10-10", "SADNESS"],
  ["2026-10-11", "SURPRISE"],
  ["2026-10-12", "ANGER"],
  ["2026-10-14", "SHYNESS"],
  ["2026-10-15", "JOY"],
];

export const mockDiaries = SEED.map(([date, emotion], i) =>
  make(
    i + 1,
    date,
    emotion,
    "오늘 친구와 준비물을 나눠 썼어요.\n함께 만들기를 완성해서 기뻤어요.",
    SAMPLE_ANSWERS,
  ),
);

let nextId = mockDiaries.length + 1;

/** 작성 완료한 일기를 mock 보관함에 추가 */
export function addMockDiary(diary) {
  const saved = { ...diary, diaryId: nextId++ };
  mockDiaries.push(saved);
  return saved;
}

/** mock 보관함에서 삭제 */
export function removeMockDiary(diaryId) {
  const idx = mockDiaries.findIndex((d) => d.diaryId === Number(diaryId));
  if (idx >= 0) mockDiaries.splice(idx, 1);
}
