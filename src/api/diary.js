import { mockResponse } from "@/api/mock";
import { MOCK_QUESTIONS } from "@/mocks/questions";

// TODO: 백엔드 연결 시 프-백 API 명세 확정 후 각 함수를 client 호출로 교체

let mockDiarySeq = 100;

/** 선택한 감정·작성 방식으로 일기 초안 생성 (B 화면) */
export async function createDiaryDraft({ emotion, inputType }) {
  mockDiarySeq += 1;
  return mockResponse({ diaryId: mockDiarySeq, emotion, inputType });
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

/** 작성 완료 처리 (C13 완료하기) */
export async function completeDiary(diaryId) {
  return mockResponse({ diaryId, completed: true });
}
