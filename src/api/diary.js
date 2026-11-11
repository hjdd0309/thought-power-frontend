import client from "@/api/client";
import {
  DIARY_ALREADY_EXISTS,
  USE_MOCK,
  mockError,
  mockResponse,
} from "@/api/mock";
import { addMockDiary, mockDiaries } from "@/mocks/diaries";
import { toISODate } from "@/utils/date";

// 작성 중 데이터는 DiaryContext가 들고 있다가 완료 시 saveDiary로 한 번에 저장한다
// 질문은 question-flow API(@/api/questionFlow)로 받는다

/**
 * 일기 완료 저장 (C13 / D06 완료하기) — POST /api/diaries
 * 감정·작성 방식·본문·질문/답변 3쌍(question-flow COMPLETE 응답의 questions)을 한 번에 전송
 * date·flowId·questionVersion은 보내지 않는다. 저장 날짜는 서버가 Asia/Seoul 기준 오늘로 정하고 응답의 date를 사용한다
 * mock에서는 오늘 날짜로 보관함 목록에 추가. 같은 날짜 일기가 있으면 DIARY_ALREADY_EXISTS (서버 409와 같게)
 * @param {{ emotion, inputType, content, questions: {order,type,content,answer}[] }} payload
 * @returns {Promise<{ diaryId, date, completed }>}
 */
export async function saveDiary({ emotion, inputType, content, questions }) {
  if (!USE_MOCK) {
    const { data } = await client.post("/api/diaries", {
      emotion,
      inputType,
      content,
      questions,
    });
    return data;
  }

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
