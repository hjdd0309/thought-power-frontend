import { DEFAULT_QUESTIONS } from "@/constants/diary";

// AI 질문 mock — 형식 {order, type, content} (question-flow 응답의 question 기준)
export const MOCK_QUESTIONS = DEFAULT_QUESTIONS;

// 빈 답변으로 RETRY될 때 보여줄 mock 질문 (같은 order, 더 쉬운 표현)
export const MOCK_RETRY_QUESTIONS = [
  { order: 1, type: "EMOTION", content: "그때 기분이 좋았나요, 속상했나요?" },
  { order: 2, type: "REASON", content: "어떤 일 때문에 그런 기분이 들었나요?" },
  {
    order: 3,
    type: "PERSPECTIVE",
    content: "다른 사람이라면 어떻게 생각했을까요?",
  },
];

// 음성 인식 결과 mock (C03·C06·C09·C12 텍스트 확인 화면 예시 문구)
export const MOCK_TRANSCRIPTS = {
  content:
    "오늘 친구랑 놀다가 조금 속상한 일이 있었어요.\n친구가 내 장난감을 먼저 가져갔거든요.",
  1: "내 장난감을 말없이 가져가서 속상했어요.",
  2: "나도 가지고 놀고 싶었는데,\n내 마음을 몰라주는 것 같았어요.",
  3: "친구도 그 장난감으로 놀고 싶었을 것 같아요.\n다음에는 같이 놀자고 말할래요.",
};
