import { mockResponse } from "@/api/mock";
import {
  MOCK_SUBSCRIPTION,
  MOCK_SUPPORT,
  MOCK_TERMS,
  MOCK_VERSION,
  mockProfile,
} from "@/mocks/settings";

// TODO: 백엔드 연결 시 프-백 API 명세 확정 후 각 함수를 client 호출로 교체

/** 개인정보 조회 — { name, age, guardianType } */
export async function getProfile() {
  return mockResponse(mockProfile);
}

/** 개인정보 수정 */
export async function updateProfile(profile) {
  Object.assign(mockProfile, profile);
  return mockResponse(mockProfile);
}

/** 구독 정보 */
export async function getSubscription() {
  return mockResponse(MOCK_SUBSCRIPTION);
}

/** 이용약관 (온보딩·설정 공용) */
export async function getTerms() {
  return mockResponse(MOCK_TERMS);
}

/** 고객센터 항목 */
export async function getSupportItems() {
  return mockResponse(MOCK_SUPPORT);
}

/** 버전 정보 */
export async function getVersion() {
  return mockResponse(MOCK_VERSION);
}
