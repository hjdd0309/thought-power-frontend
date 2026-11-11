import client from "@/api/client";
import { ApiError, USE_MOCK, mockError, mockResponse } from "@/api/mock";
import { QUESTION_COUNT, QUESTION_STEPS } from "@/constants/diary";
import { MOCK_QUESTIONS, MOCK_RETRY_QUESTIONS } from "@/mocks/questions";

/**
 * 질문 흐름(question-flow) API — 질문 3개를 서버가 순서대로 이끈다
 * 1) startQuestionFlow → 첫 질문(action QUESTION)
 * 2) submitQuestionAnswer → RETRY(같은 order 새 질문) | NEXT(다음 질문) | COMPLETE(질문 끝)
 * 3) COMPLETE 응답의 questions를 그대로 saveDiary(POST /api/diaries)로 저장
 * 기존 단건 질문 API(POST /api/diaries/questions)와 섞어 쓰지 않는다.
 *
 * 응답 형식 (QuestionFlowResponse)
 * {
 *   flowId: string, action: "QUESTION"|"RETRY"|"NEXT"|"COMPLETE",
 *   questionVersion: number, retryCount: number, informative: boolean|null,
 *   question: { order, type, content, isFallback } | null,   // COMPLETE면 null
 *   questions: { order, type, content, answer }[]             // 지금까지 답한 질문·답변
 * }
 */

export const QUESTION_FLOW_ACTIONS = {
  QUESTION: "QUESTION",
  RETRY: "RETRY",
  NEXT: "NEXT",
  COMPLETE: "COMPLETE",
};

// 흐름이 만료됨(서버 재시작 포함) — 서버 410 응답 code
export const QUESTION_FLOW_EXPIRED = "QUESTION_FLOW_EXPIRED";

/** 질문 흐름 만료 에러인지 (mock ApiError · 실서버 axios 410 응답 모두) */
export const isQuestionFlowExpired = (error) =>
  error?.code === QUESTION_FLOW_EXPIRED ||
  error?.response?.data?.code === QUESTION_FLOW_EXPIRED ||
  error?.response?.status === 410;

/**
 * 첫 질문 시작 — POST /api/diaries/question-flows
 * @param {{ emotion: string, content: string }} payload content = 사용자가 수정·확인한 일기 본문
 */
export async function startQuestionFlow({ emotion, content }) {
  const first = QUESTION_STEPS[0];
  const body = {
    emotion,
    content,
    order: first.order,
    type: first.type,
    previousAnswers: [],
  };
  if (USE_MOCK) return mockStart(body);
  const { data } = await client.post("/api/diaries/question-flows", body);
  return data;
}

/**
 * 답변 제출 — POST /api/diaries/question-flows/{flowId}/answers
 * 빈 답변은 "" 그대로 보낸다. questionVersion은 직전 응답의 최신 값
 * @param {string} flowId
 * @param {{ questionVersion: number, answer: string }} payload
 */
export async function submitQuestionAnswer(
  flowId,
  { questionVersion, answer },
) {
  const body = { questionVersion, answer };
  if (USE_MOCK) return mockSubmit(flowId, body);
  const { data } = await client.post(
    `/api/diaries/question-flows/${encodeURIComponent(flowId)}/answers`,
    body,
  );
  return data;
}

// ---- mock: 서버 흐름 흉내 (빈 답변이면 같은 질문 순서에서 한 번 RETRY) ----

const mockFlows = new Map();

const mockQuestion = (order, retried) => ({
  ...(retried ? MOCK_RETRY_QUESTIONS : MOCK_QUESTIONS).find(
    (q) => q.order === order,
  ),
  isFallback: false,
});

const mockFlowResponse = (flow, action) => ({
  flowId: flow.flowId,
  action,
  questionVersion: flow.version,
  retryCount: flow.retryCount,
  informative: null,
  question: flow.question,
  questions: structuredClone(flow.questions),
});

function mockStart() {
  const flow = {
    flowId: crypto.randomUUID(),
    version: 0,
    retryCount: 0,
    question: mockQuestion(1, false),
    questions: [],
  };
  mockFlows.set(flow.flowId, flow);
  return mockResponse(mockFlowResponse(flow, QUESTION_FLOW_ACTIONS.QUESTION));
}

function mockSubmit(flowId, { questionVersion, answer }) {
  const flow = mockFlows.get(flowId);
  // 새로고침 등으로 흐름이 사라지면 서버처럼 410
  if (!flow) {
    return mockError(
      QUESTION_FLOW_EXPIRED,
      "질문 진행 정보가 만료되었습니다. 작성 내용을 보관하고 질문을 다시 시작해주세요.",
    );
  }
  if (questionVersion !== flow.version) {
    return Promise.reject(
      new ApiError("INVALID_REQUEST", "질문 버전이 맞지 않아요."),
    );
  }

  const { order } = flow.question;
  flow.version += 1;

  if (!answer.trim() && flow.retryCount === 0) {
    flow.retryCount = 1;
    flow.question = mockQuestion(order, true);
    return mockResponse(mockFlowResponse(flow, QUESTION_FLOW_ACTIONS.RETRY));
  }

  flow.questions.push({
    order,
    type: flow.question.type,
    content: flow.question.content,
    answer,
  });
  flow.retryCount = 0;

  if (order >= QUESTION_COUNT) {
    flow.question = null;
    mockFlows.delete(flowId);
    return mockResponse(mockFlowResponse(flow, QUESTION_FLOW_ACTIONS.COMPLETE));
  }
  flow.question = mockQuestion(order + 1, false);
  return mockResponse(mockFlowResponse(flow, QUESTION_FLOW_ACTIONS.NEXT));
}
