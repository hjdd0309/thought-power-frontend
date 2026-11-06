// 설정 mock — F01·F03 프로필 / F04 구독 / F06 이용약관 / F07 고객센터 / F08 버전 (Figma 예시 문구 기준)

// 온보딩 완료 시 덮어쓴다 (로그인 없음: 서버 기본 사용자 1명)
export const mockProfile = {
  name: "김지우",
  age: 8,
  guardianType: "PARENT",
};

export const MOCK_SUBSCRIPTION = [
  { title: "현재 플랜", value: "무료 플랜" },
  { title: "결제 상태", value: "결제 내역 없음" },
  { title: "다음 결제일 / 결제 수단", value: "해당 없음" },
];

// 온보딩·설정 약관 조회는 같은 API 재사용 (docs/spec.md)
export const MOCK_TERMS = {
  title: "서비스 이용약관",
  notice: "화면 구성용 예시 문구",
  articles: [
    {
      title: "제1조 목적",
      content:
        "이 약관은 생각의힘 서비스 이용에 관한 기본 사항을 안내하기 위한 예시입니다.",
    },
    {
      title: "제2조 서비스 이용",
      content:
        "보호자 동의 후 서비스를 이용하며, 글 또는 음성으로 일기를 기록할 수 있습니다.",
    },
    {
      title: "제3조 개인정보",
      content:
        "수집 항목과 보관 기간 등은 실제 운영 정책에 따라 별도로 정합니다.",
    },
    {
      title: "제4조 이용자의 권리",
      content:
        "서비스 이용, 기록 관리, 문의 및 해지 방법을 안내하는 내용이 들어갑니다.",
    },
    {
      title: "제5조 문의",
      content: "실제 고객센터 연락처와 처리 절차를 기재하는 영역입니다.",
    },
  ],
};

export const MOCK_SUPPORT = [
  { key: "faq", label: "자주 묻는 질문" },
  { key: "contact", label: "문의하기" },
];

export const MOCK_VERSION = { version: "1.0.0" };
