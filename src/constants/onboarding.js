// 보호자(보조자) 유형 — 코드는 백엔드 GuardianType enum 기준, 라벨은 Figma A05 기준
export const GUARDIAN_TYPES = [
  { code: "SCHOOL_TEACHER", label: "학교 선생님" },
  { code: "FACILITY_TEACHER", label: "아동시설 선생님" },
  { code: "PARENT", label: "부모님" },
  { code: "OTHER", label: "기타" },
];

export const getGuardianLabel = (code) =>
  GUARDIAN_TYPES.find((g) => g.code === code)?.label ?? "";

// 나이 선택 범위 — 팀 확정 6–10세 (백엔드 DB 제약 ck_children_2와 동일)
// A07 슬라이더와 F03 개인정보 관리 나이 선택이 함께 사용
export const AGE_MIN = 6;
export const AGE_MAX = 10;
export const AGE_DEFAULT = 8;

// 약관 동의 항목 (A03)
export const AGREEMENT_ITEMS = [
  { key: "guardian", label: "만 14세 미만 보호자 동의 (필수)" },
  { key: "terms", label: "서비스 이용약관 (필수)" },
  { key: "privacy", label: "개인정보 처리방침 (필수)" },
];
