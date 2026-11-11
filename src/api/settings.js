import client from "@/api/client";
import { USE_MOCK, mockResponse } from "@/api/mock";
import {
  MOCK_SUBSCRIPTION,
  MOCK_SUPPORT,
  MOCK_TERMS,
  MOCK_VERSION,
  mockProfile,
} from "@/mocks/settings";

// 설정(F) API — USE_MOCK=false면 실서버, true면 src/mocks
// 응답 필드는 여기서 화면 형식으로 바꾼다 (서버 helperType → 화면 guardianType 등)

/** 서버 UserResponse { userId, name, age, helperType } → 화면 { name, age, guardianType } */
const toProfile = ({ name, age, helperType }) => ({
  name,
  age,
  guardianType: helperType,
});

/** 개인정보 조회 — GET /api/users/me → { name, age, guardianType } (온보딩 전이면 404) */
export async function getProfile() {
  if (USE_MOCK) return mockResponse(mockProfile);
  const { data } = await client.get("/api/users/me");
  return toProfile(data);
}

/** 개인정보 수정 — PATCH /api/users/me { name, age, helperType } */
export async function updateProfile({ name, age, guardianType }) {
  if (USE_MOCK) {
    Object.assign(mockProfile, { name, age, guardianType });
    return mockResponse(mockProfile);
  }
  const { data } = await client.patch("/api/users/me", {
    name,
    age,
    helperType: guardianType,
  });
  return toProfile(data);
}

/**
 * 구독 정보 — GET /api/subscription → [{ title, value }] 3줄 (F04)
 * 서버는 아직 결제 기능이 없어 { subscription: null }을 준다 → 무료 플랜 기본 문구로 표시
 * TODO: subscription 객체 형식이 정해지면 매핑 추가
 */
export async function getSubscription() {
  if (USE_MOCK) return mockResponse(MOCK_SUBSCRIPTION);
  await client.get("/api/subscription");
  return structuredClone(MOCK_SUBSCRIPTION);
}

/**
 * 이용약관 (온보딩·설정 공용) — GET /api/terms
 * 서버 { terms: [{ type, title, required }] } → 화면 { title, notice, articles[{ title, content }], items[{ type, label }] }
 * - items: 온보딩 동의 항목 라벨 (A03)
 * - 서버가 약관 본문(content)을 주지 않아 articles의 content는 빈 문자열 (제목만 표시)
 */
export async function getTerms() {
  if (USE_MOCK) return mockResponse(MOCK_TERMS);
  const { data } = await client.get("/api/terms");
  const terms = data?.terms ?? [];
  return {
    title: "이용약관",
    notice: "",
    articles: terms.map((t) => ({ title: t.title, content: t.content ?? "" })),
    items: terms.map((t) => ({
      type: t.type,
      label: `${t.title}${t.required ? " (필수)" : ""}`,
    })),
  };
}

/**
 * 고객센터 항목 — GET /api/support → [{ key, label, url? }]
 * 서버 { fags: [], inquiryUrl } (fags는 서버 필드명 그대로). 문의 URL이 있으면 문의하기에 연결
 */
export async function getSupportItems() {
  if (USE_MOCK) return mockResponse(MOCK_SUPPORT);
  const { data } = await client.get("/api/support");
  return MOCK_SUPPORT.map((item) =>
    item.key === "contact" && data?.inquiryUrl
      ? { ...item, url: data.inquiryUrl }
      : { ...item },
  );
}

/** 버전 정보 — GET /api/app/version → { version, logoUrl } */
export async function getVersion() {
  if (USE_MOCK) return mockResponse(MOCK_VERSION);
  const { data } = await client.get("/api/app/version");
  return data;
}
