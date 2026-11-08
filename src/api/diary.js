import { DIARY_ALREADY_EXISTS, mockError, mockResponse } from "@/api/mock";
import { addMockDiary, mockDiaries } from "@/mocks/diaries";
import { MOCK_QUESTIONS } from "@/mocks/questions";
import { toISODate } from "@/utils/date";

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
 * 일기 완료 저장 (C13 / D06 완료하기) — 감정·작성 방식·본문·질문/답변 3쌍을 한 번에 전송
 * 저장 날짜(date)는 보내지 않는다. 서버가 Asia/Seoul 기준 오늘로 정하고 응답의 date를 사용한다
 * mock에서는 오늘 날짜로 보관함 목록에 추가. 같은 날짜 일기가 있으면 DIARY_ALREADY_EXISTS (서버 409와 같게)
 * @param {{ emotion, inputType, content, questions: {order,type,content,answer}[] }} payload
 * @returns {Promise<{ diaryId, date, completed }>}
 */
export async function saveDiary({ emotion, inputType, content, questions }) {
  // mock: 서버 역할로 저장 날짜를 정한다 (실서버는 Asia/Seoul 기준)
  const date = toISODate();
  if (mockDiaries.some((d) => d.date === date)) {
    return mockError(DIARY_ALREADY_EXISTS, "오늘은 이미 일기를 썼어요.");
  }
  const saved = addMockDiary({ date, emotion, inputType, content, questions });
  return mockResponse({
    diaryId: saved.diaryId,
    date: saved.date,
    completed: true,
  });
}
