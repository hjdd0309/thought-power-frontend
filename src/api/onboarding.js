import client from "@/api/client";
import { USE_MOCK, mockResponse } from "@/api/mock";
import { AGREEMENT_ITEMS, TERMS_VERSION } from "@/constants/onboarding";
import { mockProfile } from "@/mocks/settings";

/**
 * 온보딩 완료 — POST /api/users/me/onboarding
 * 보조자·이름·나이·약관 동의값을 한 번에 저장 (서버 고정 사용자 1명)
 * 요청 { name, age, helperType, agreements: [{ type, version, agreed }] }
 * 응답 { userId, onboardingCompleted }
 * @param {{ guardianType: string, name: string, age: number, agreements: Record<string, boolean> }} payload
 *   agreements는 OnboardingContext 형식 { guardian, terms, privacy }
 */
export async function completeOnboarding({
  name,
  age,
  guardianType,
  agreements,
}) {
  if (USE_MOCK) {
    Object.assign(mockProfile, { name, age, guardianType });
    return mockResponse({ userId: 1, onboardingCompleted: true });
  }
  const { data } = await client.post("/api/users/me/onboarding", {
    name: name.trim(),
    age,
    helperType: guardianType,
    agreements: AGREEMENT_ITEMS.map(({ key, type }) => ({
      type,
      version: TERMS_VERSION,
      agreed: Boolean(agreements?.[key]),
    })),
  });
  return data;
}

/**
 * 온보딩 완료 여부 — GET /api/users/me 성공이면 true, 404면 false
 * 그 밖의 오류는 그대로 던진다 (호출하는 쪽에서 localStorage 값으로 대체)
 * mock에서는 판단할 수 없어 null
 */
export async function getOnboardingStatus() {
  if (USE_MOCK) return null;
  try {
    await client.get("/api/users/me");
    return true;
  } catch (e) {
    if (e?.response?.status === 404) return false;
    throw e;
  }
}
