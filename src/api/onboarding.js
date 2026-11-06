import { mockResponse } from "@/api/mock";
import { mockProfile } from "@/mocks/settings";

/**
 * 온보딩 완료 — 보조자·이름·나이·동의값을 함께 저장 (docs/spec.md 화면별 반영 기준 A)
 * @param {{ guardianType: string, name: string, age: number,
 *           agreements: { guardian: boolean, terms: boolean, privacy: boolean } }} payload
 */
export async function completeOnboarding(payload) {
  // TODO: 백엔드 연결 시 프-백 API 명세 확정 후 client 호출로 교체
  const { name, age, guardianType } = payload;
  Object.assign(mockProfile, { name, age, guardianType });
  return mockResponse({ ...payload, completed: true });
}
