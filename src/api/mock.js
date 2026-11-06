// mock 응답 헬퍼 — 실제 API처럼 비동기로 복사본을 돌려준다
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

// 실제처럼 테스트하기 위한 지연(ms)과 실패 확률(0~1). 기본 0
const MOCK_DELAY_MS = Number(import.meta.env.VITE_MOCK_DELAY_MS) || 0;
const MOCK_FAIL_RATE = Number(import.meta.env.VITE_MOCK_FAIL_RATE) || 0;

export class ApiError extends Error {
  constructor(code = "INTERNAL_ERROR", message = "요청에 실패했어요.") {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export function mockResponse(data, delay = MOCK_DELAY_MS) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < MOCK_FAIL_RATE) {
        reject(new ApiError("MOCK_FAILURE", "mock 실패(테스트용)"));
        return;
      }
      resolve(structuredClone(data));
    }, delay);
  });
}
