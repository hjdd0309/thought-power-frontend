import { toISODate } from "@/utils/date";

// 보관함 시연용 일기 mock — 일기 상세 형식
// { diaryId, date, emotion, inputType, content, questions: [{ order, type, content, answer }] }
//
// 날짜는 "오늘" 기준으로 계산한다.
// - 이번 달 1일 ~ 어제 중에 고르게 배치 (오늘은 시연 중 직접 쓸 수 있게 비워 둠)
// - 이번 달 지난 날짜가 모자라면 지난달 말부터 이틀 간격으로 채움
// - 하루 1개 (DB UNIQUE(child_id, diary_date)와 같게)
// 감정 분포(14개): 기쁨 4 · 슬픔 3 · 놀람 2 · 화남 2 · 부끄러움 2 · 무서움 1

const TYPES = ["EMOTION", "REASON", "PERSPECTIVE"];

const DEMO = [
  {
    emotion: "JOY",
    inputType: "VOICE",
    content:
      "오늘 학교에서 친구랑 그림 그리기를 했어요.\n제가 그린 강아지를 선생님이 칭찬해 주셨어요.",
    qa: [
      [
        "선생님이 칭찬해 주셨을 때 어떤 기분이 들었나요?",
        "기분이 하늘을 나는 것 같았어요.",
      ],
      [
        "왜 그렇게 기뻤다고 생각하나요?",
        "강아지를 열심히 그렸는데 잘했다고 해 주셔서요.",
      ],
      [
        "옆에 있던 친구는 그때 어떤 기분이었을까요?",
        "친구도 같이 웃어 줬으니까 기뻤을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "SADNESS",
    inputType: "TEXT",
    content:
      "놀이터에서 놀다가 넘어져서 무릎이 까졌어요.\n아파서 조금 울었어요.",
    qa: [
      ["넘어졌을 때 어떤 기분이 들었나요?", "아프고 속상했어요."],
      [
        "왜 속상한 마음이 들었다고 생각하나요?",
        "더 놀고 싶었는데 집에 가야 했어요.",
      ],
      [
        "그때 엄마는 어떤 기분이었을까요?",
        "엄마도 걱정이 됐을 것 같아요. 밴드를 붙여 주셨어요.",
      ],
    ],
  },
  {
    emotion: "SURPRISE",
    inputType: "VOICE",
    content:
      "집에 왔는데 할머니가 와 계셨어요.\n오신다는 말을 못 들어서 깜짝 놀랐어요.",
    qa: [
      ["할머니를 봤을 때 어떤 기분이 들었나요?", "깜짝 놀랐는데 반가웠어요."],
      ["왜 그렇게 놀랐다고 생각하나요?", "아무도 말을 안 해 줘서 몰랐어요."],
      [
        "할머니는 그때 어떤 기분이었을까요?",
        "제가 놀라는 걸 보고 재미있으셨을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "JOY",
    inputType: "TEXT",
    content:
      "아빠랑 공원에서 자전거를 탔어요.\n처음으로 보조 바퀴 없이 혼자 탔어요!",
    qa: [
      [
        "혼자 자전거를 탔을 때 어떤 기분이 들었나요?",
        "너무 신나서 소리를 질렀어요.",
      ],
      [
        "왜 그렇게 신났다고 생각하나요?",
        "계속 넘어졌는데 드디어 성공했으니까요.",
      ],
      [
        "뒤에서 보던 아빠는 어떤 기분이었을까요?",
        "아빠도 박수를 쳐 주셨으니까 뿌듯했을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "ANGER",
    inputType: "VOICE",
    content:
      "동생이 제가 만든 블록 성을 무너뜨렸어요.\n그래서 동생한테 소리를 질렀어요.",
    qa: [
      ["블록 성이 무너졌을 때 어떤 기분이 들었나요?", "너무 화가 났어요."],
      ["왜 화가 났다고 생각하나요?", "오래 걸려서 만든 거였어요."],
      [
        "동생은 그때 어떤 기분이었을까요?",
        "동생도 같이 놀고 싶었던 것 같아요. 다음엔 같이 만들래요.",
      ],
    ],
  },
  {
    emotion: "SHAME",
    inputType: "TEXT",
    content:
      "수업 시간에 앞에 나가서 발표를 했어요.\n얼굴이 빨개져서 목소리가 작아졌어요.",
    qa: [
      ["앞에 나가서 발표할 때 어떤 기분이 들었나요?", "부끄럽고 떨렸어요."],
      [
        "왜 부끄러운 마음이 들었다고 생각하나요?",
        "친구들이 다 저만 쳐다봐서요.",
      ],
      [
        "발표를 듣던 친구들은 어떤 기분이었을까요?",
        "친구들도 발표할 때 떨렸을 거라서 이해해 줬을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "SADNESS",
    inputType: "VOICE",
    content:
      "제일 친한 친구가 오늘 학교에 안 왔어요.\n쉬는 시간에 혼자 있어서 심심했어요.",
    qa: [
      ["친구가 안 왔을 때 어떤 기분이 들었나요?", "쓸쓸하고 조금 슬펐어요."],
      [
        "왜 그런 기분이 들었다고 생각하나요?",
        "매일 같이 놀던 친구라서 보고 싶었어요.",
      ],
      [
        "학교에 못 온 친구는 어떤 기분이었을까요?",
        "친구도 아파서 학교에 오고 싶었을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "JOY",
    inputType: "VOICE",
    content:
      "엄마랑 같이 쿠키를 만들었어요.\n별 모양 쿠키를 가족들이 맛있게 먹었어요.",
    qa: [
      ["가족들이 쿠키를 먹을 때 어떤 기분이 들었나요?", "기쁘고 뿌듯했어요."],
      [
        "왜 뿌듯한 마음이 들었다고 생각하나요?",
        "제가 반죽도 하고 모양도 직접 찍었어요.",
      ],
      [
        "같이 만든 엄마는 어떤 기분이었을까요?",
        "엄마도 저랑 같이해서 즐거우셨을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "FEAR",
    inputType: "TEXT",
    content: "밤에 천둥이 크게 쳤어요.\n무서워서 이불 속에 숨었어요.",
    qa: [
      [
        "천둥소리를 들었을 때 어떤 기분이 들었나요?",
        "심장이 쿵쾅거리고 무서웠어요.",
      ],
      ["왜 무섭다고 느꼈다고 생각하나요?", "소리가 너무 크고 방이 깜깜했어요."],
      [
        "옆방에 있던 언니는 어떤 기분이었을까요?",
        "언니도 조금 무서웠을 것 같아요. 다음엔 같이 있자고 할래요.",
      ],
    ],
  },
  {
    emotion: "SURPRISE",
    inputType: "VOICE",
    content:
      "화분에 심은 씨앗에서 싹이 났어요.\n어제는 없었는데 아침에 보니 나와 있었어요.",
    qa: [
      ["싹을 처음 봤을 때 어떤 기분이 들었나요?", "우와 하고 놀랐어요."],
      ["왜 그렇게 놀랐다고 생각하나요?", "하루 만에 이렇게 자랄 줄 몰랐어요."],
      [
        "물을 같이 준 짝꿍은 어떤 기분이었을까요?",
        "짝꿍도 신기해서 보고 싶어 할 것 같아요.",
      ],
    ],
  },
  {
    emotion: "ANGER",
    inputType: "TEXT",
    content:
      "줄넘기 시합에서 친구가 반칙을 했어요.\n그런데 친구가 이겨서 화가 났어요.",
    qa: [
      ["친구가 이겼을 때 어떤 기분이 들었나요?", "억울하고 화가 났어요."],
      ["왜 억울한 마음이 들었다고 생각하나요?", "규칙을 지킨 건 저였으니까요."],
      [
        "시합한 친구는 그때 어떤 기분이었을까요?",
        "친구도 이기고 싶어서 그랬던 것 같아요. 규칙을 같이 다시 정할래요.",
      ],
    ],
  },
  {
    emotion: "SADNESS",
    inputType: "VOICE",
    content: "아끼던 지우개를 잃어버렸어요.\n가방을 다 찾아봤는데 없었어요.",
    qa: [
      [
        "지우개가 없어진 걸 알았을 때 어떤 기분이 들었나요?",
        "속상해서 눈물이 날 것 같았어요.",
      ],
      ["왜 그렇게 속상했다고 생각하나요?", "생일 선물로 받은 지우개였어요."],
      [
        "선물해 준 친구는 이 이야기를 들으면 어떤 기분일까요?",
        "친구도 아쉬워할 것 같지만 괜찮다고 해 줄 것 같아요.",
      ],
    ],
  },
  {
    emotion: "SHAME",
    inputType: "TEXT",
    content:
      "새로 전학 온 친구한테 먼저 말을 걸었어요.\n말하고 나니까 얼굴이 뜨거워졌어요.",
    qa: [
      [
        "먼저 말을 걸었을 때 어떤 기분이 들었나요?",
        "부끄러웠지만 용기가 났어요.",
      ],
      [
        "왜 부끄러운 마음이 들었다고 생각하나요?",
        "처음 보는 친구라서 무슨 말을 할지 몰랐어요.",
      ],
      [
        "전학 온 친구는 그때 어떤 기분이었을까요?",
        "친구도 아는 사람이 없어서 고마웠을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "JOY",
    inputType: "VOICE",
    content: "주말에 가족이랑 바다에 갔어요.\n모래성도 만들고 조개도 주웠어요.",
    qa: [
      ["바다에서 놀 때 어떤 기분이 들었나요?", "정말 행복하고 신났어요."],
      ["왜 그렇게 행복했다고 생각하나요?", "가족이 다 같이 놀아서 좋았어요."],
      [
        "같이 간 동생은 어떤 기분이었을까요?",
        "동생도 파도를 보고 엄청 좋아했어요.",
      ],
    ],
  },
];

const pad = (n) => String(n).padStart(2, "0");

/** 오늘 기준 시연 날짜 n개 (오래된 날짜 → 최근 날짜 순) */
function buildDemoDates(n, today = new Date()) {
  const y = today.getFullYear();
  const m = today.getMonth();
  const pastDays = today.getDate() - 1; // 이번 달 1일 ~ 어제
  const dates = [];

  if (pastDays >= n) {
    // 이번 달 지난 날짜 안에서 고르게 분산
    for (let i = 0; i < n; i++) {
      const day = 1 + Math.round((i * (pastDays - 1)) / (n - 1));
      dates.push(`${y}-${pad(m + 1)}-${pad(day)}`);
    }
    return [...new Set(dates)];
  }

  // 이번 달 지난 날짜는 모두 쓰고, 모자란 만큼 지난달 말부터 이틀 간격으로
  for (let day = 1; day <= pastDays; day++) {
    dates.push(`${y}-${pad(m + 1)}-${pad(day)}`);
  }
  const prevLast = new Date(y, m, 0); // 지난달 마지막 날
  for (let i = 0; dates.length < n; i++) {
    const d = new Date(prevLast);
    d.setDate(prevLast.getDate() - i * 2);
    dates.unshift(toISODate(d));
  }
  return dates.sort();
}

const dates = buildDemoDates(DEMO.length);

export const mockDiaries = DEMO.map((d, i) => ({
  diaryId: i + 1,
  date: dates[i],
  emotion: d.emotion,
  inputType: d.inputType,
  content: d.content,
  questions: d.qa.map(([content, answer], q) => ({
    order: q + 1,
    type: TYPES[q],
    content,
    answer,
  })),
}));

let nextId = mockDiaries.length + 1;

/** 작성 완료한 일기를 mock 보관함에 추가 */
export function addMockDiary(diary) {
  const saved = { ...diary, diaryId: nextId++ };
  mockDiaries.push(saved);
  return saved;
}

/** mock 보관함에서 삭제 */
export function removeMockDiary(diaryId) {
  const idx = mockDiaries.findIndex((d) => d.diaryId === Number(diaryId));
  if (idx >= 0) mockDiaries.splice(idx, 1);
}
