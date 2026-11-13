// mock 응답 헬퍼 — 실제 API처럼 비동기로 복사본을 돌려준다
// [DEMO] feature/ui-polish 데모 브랜치 전용 — 환경변수와 상관없이 항상 mock 데이터를 쓴다
// 데모용, 머지 금지 — 동의 후 실서버 연결 버전으로 다시 작업
export const USE_MOCK = true;

// 실제처럼 테스트하기 위한 지연(ms)과 실패 확률(0~1). 기본 0
const MOCK_DELAY_MS = Number(import.meta.env.VITE_MOCK_DELAY_MS) || 0;
// [DEMO] 에러 화면이 섞이지 않게 실패 확률 0으로 고정
const MOCK_FAIL_RATE = 0;

export class ApiError extends Error {
  constructor(code = "INTERNAL_ERROR", message = "요청에 실패했어요.") {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

// 하루 1개 제약(DB UNIQUE(child_id, diary_date)) 위반 — 서버 409 응답 code
export const DIARY_ALREADY_EXISTS = "DIARY_ALREADY_EXISTS";

/** 오늘 일기를 이미 썼다는 에러인지 (mock ApiError · 실서버 axios 409 응답 모두) */
export const isDiaryAlreadyExists = (error) =>
  error?.code === DIARY_ALREADY_EXISTS ||
  error?.response?.data?.code === DIARY_ALREADY_EXISTS;

// 아이 프로필 미등록 — 서버 404 응답 code
export const PROFILE_NOT_FOUND = "PROFILE_NOT_FOUND";

/**
 * 프로필이 없다는 에러인지 (mock ApiError · 실서버 axios 404 응답 모두)
 * TODO: 백엔드 연결 시 404 PROFILE_NOT_FOUND → '프로필을 먼저 등록해 주세요' 안내 후 /start 이동
 */
export const isProfileNotFound = (error) =>
  error?.code === PROFILE_NOT_FOUND ||
  error?.response?.data?.code === PROFILE_NOT_FOUND;

/** mock 실패 응답 — 실제 API 에러처럼 비동기로 reject */
export function mockError(code, message, delay = MOCK_DELAY_MS) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new ApiError(code, message)), delay);
  });
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
