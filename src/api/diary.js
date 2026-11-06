import { DIARY_ALREADY_EXISTS, mockError, mockResponse } from "@/api/mock";
import { addMockDiary, mockDiaries } from "@/mocks/diaries";
import { MOCK_QUESTIONS } from "@/mocks/questions";

// 작성 중 데이터는 DiaryContext가 들고 있다가 완료 시 saveDiary로 한 번에 저장한다
// TODO: 백엔드 연결 시 프-백 API 명세 확정 후 각 함수를 client 호출로 교체

/**
 * AI 질문 요청 — 저장 없이 질문만 받아온다 (docs/spec.md "BE1 → AI 요청" 형식)
 * @param {{ emotion, content, order, type, previousAnswers: {order,type,question,answer}[] }} payload
 * @returns {Promise<{ order, type, content }>}
 */
export async function getQuestion({ order }) {
  const question = MOCK_QUESTIONS.find((q) => q.order === Number(order));
  return mockResponse(question);
}

/**
 * 일기 완료 저장 (C13 / D06 완료하기) — 감정·작성 방식·날짜·본문·질문/답변 3쌍을 한 번에 전송
 * mock에서는 보관함 목록에 추가. 같은 날짜 일기가 있으면 DIARY_ALREADY_EXISTS (서버 409와 같게)
 * @param {{ emotion, inputType, date, content, questions: {order,type,content,answer}[] }} payload
 * @returns {Promise<{ diaryId, date }>}
 */
export async function saveDiary({
  emotion,
  inputType,
  date,
  content,
  questions,
}) {
  if (mockDiaries.some((d) => d.date === date)) {
    return mockError(DIARY_ALREADY_EXISTS, "오늘은 이미 일기를 썼어요.");
  }
  const saved = addMockDiary({ date, emotion, inputType, content, questions });
  return mockResponse({ diaryId: saved.diaryId, date: saved.date });
}
