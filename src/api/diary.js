import { mockResponse } from "@/api/mock";
import { addMockDiary } from "@/mocks/diaries";
import { MOCK_QUESTIONS } from "@/mocks/questions";
import { toISODate } from "@/utils/date";

// TODO: 백엔드 연결 시 프-백 API 명세 확정 후 각 함수를 client 호출로 교체

let mockDraftSeq = 1000;

/** 선택한 감정·작성 방식으로 일기 초안 생성 (B 화면) */
export async function createDiaryDraft({ emotion, inputType }) {
  mockDraftSeq += 1;
  return mockResponse({ diaryId: mockDraftSeq, emotion, inputType });
}

/** 수정·확인한 일기 본문 저장 (C01~C03 / D01) */
export async function saveDiaryContent(diaryId, content) {
  return mockResponse({ diaryId, content });
}

/** 질문 생성 — 응답 {order, type, content} */
export async function getQuestion(diaryId, order) {
  const question = MOCK_QUESTIONS.find((q) => q.order === Number(order));
  return mockResponse(question, 400);
}

/** 수정·확인한 답변 저장 */
export async function saveAnswer(diaryId, { order, answer }) {
  return mockResponse({ diaryId, order, answer });
}

/** 작성 완료 처리 (C13 완료하기) — mock에서는 보관함 목록에 추가 */
export async function completeDiary({ emotion, inputType, content, answers }) {
  const saved = addMockDiary({
    date: toISODate(),
    emotion,
    inputType,
    content,
    questions: answers,
  });
  return mockResponse({ diaryId: saved.diaryId, completed: true });
}
