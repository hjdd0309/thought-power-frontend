// 감정 리포트 AI 문구 mock — docs/spec.md "AI → BE2 응답" 및 예외 처리 문구 기준
export const MOCK_REPORT_TEXT = {
  description: "선택한 기간에는 기쁨을 가장 자주 기록했어요.",
  advice:
    "아이와 즐거웠던 순간을 이야기하고, 슬펐던 날의 마음도 편안하게 들어 주세요.",
  interpretation: "기쁨과 슬픔을 기록했고, 마지막 기록은 기쁨이었어요.",
};

// 일기 0건일 때 BE2가 돌려주는 기본 문구
export const EMPTY_REPORT_TEXT = {
  description: "선택한 기간에 작성된 일기가 없어요.",
  advice: "아이와 오늘의 기분을 이야기하며 첫 일기를 남겨 보세요.",
  interpretation: "감정 기록이 없어 변화 추이를 확인할 수 없어요.",
};
