// AI 질문 mock — 형식 {order, type, content} (docs/spec.md AI → BE1 응답 기준)
export const MOCK_QUESTIONS = [
  { order: 1, type: "EMOTION", content: "그때 어떤 기분이 들었나요?" },
  {
    order: 2,
    type: "REASON",
    content: "왜 그런 기분이 들었다고 생각하나요?",
  },
  {
    order: 3,
    type: "PERSPECTIVE",
    content: "친구는 그때 어떤 기분이었을까요?",
  },
];

// 음성 인식 결과 mock (C03·C06·C09·C12 텍스트 확인 화면 예시 문구)
export const MOCK_TRANSCRIPTS = {
  content:
    "오늘 친구랑 놀다가 조금 속상한 일이 있었어요. 친구가 내 장난감을 먼저 가져가서 기분이 안 좋았어요.",
  1: "내 장난감을 말없이 가져가서 속상했어요.",
  2: "나도 가지고 놀고 싶었는데, 내 마음을 몰라주는 것 같았어요.",
  3: "친구도 그 장난감으로 놀고 싶었을 것 같아요. 다음에는 같이 놀자고 말할래요.",
};
