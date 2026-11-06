import { mockResponse } from "@/api/mock";
import { mockProfile } from "@/mocks/settings";

/**
 * 온보딩 완료 — 보조자·이름·나이를 함께 저장
 * 약관 동의값은 화면 표시용으로만 쓰고 저장하지 않는다 (팀 확정, docs/api-frontend.md 5. 확정)
 * @param {{ guardianType: string, name: string, age: number }} payload
 */
export async function completeOnboarding({ name, age, guardianType }) {
  // TODO: 백엔드 연결 시 프-백 API 명세 확정 후 client 호출로 교체
  Object.assign(mockProfile, { name, age, guardianType });
  return mockResponse({ name, age, guardianType, completed: true });
}
