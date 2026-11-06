// mock 응답 헬퍼 — 실제 API처럼 비동기로 복사본을 돌려준다
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export function mockResponse(data, delay = 200) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), delay);
  });
}
