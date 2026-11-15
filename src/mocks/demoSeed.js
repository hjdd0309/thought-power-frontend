import { toISODate } from "@/utils/date";

// 시연용 프론트 시드 일기 — VITE_DEMO_SEED=true일 때만 켜진다 (실서버 모드 전용)
// - 서버로 보내는 요청에는 절대 섞지 않고, 실서버 응답을 받은 뒤 "화면에 보여줄 데이터"에만 합친다
// - 날짜: 이번 달 1일 ~ 어제 중 10일 (오늘은 시연 중 직접 쓰도록 비워 둠)
// - 실서버에 같은 날짜 일기가 있으면 그 날짜 시드는 숨긴다
// - diaryId는 음수라 실서버 id와 겹치지 않는다
// 감정 분포(10개): 기쁨 3 · 슬픔 3 · 화남 1 · 무서움 1 · 놀람 1 · 부끄러움 1

export const DEMO_SEED_ENABLED = import.meta.env.VITE_DEMO_SEED === "true";

const SEED_COUNT = 10;
const TYPES = ["EMOTION", "REASON", "PERSPECTIVE"];

const SEED = [
  {
    emotion: "JOY",
    inputType: "VOICE",
    content:
      "오늘 학교에서 짝꿍이랑 종이접기를 했어요.\n제가 접은 개구리가 진짜로 폴짝 뛰었어요.",
    qa: [
      [
        "개구리가 폴짝 뛰었을 때 어떤 기분이 들었나요?",
        "너무 신나서 소리를 질렀어요.",
      ],
      ["왜 그렇게 신났다고 생각하나요?", "처음 접어 봤는데 잘 돼서요."],
      [
        "짝꿍은 그때 어떤 기분이었을까요?",
        "짝꿍도 같이 웃었으니까 재미있었을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "SADNESS",
    inputType: "TEXT",
    content:
      "아끼던 연필을 잃어버렸어요.\n필통이랑 가방을 다 찾아봤는데 없었어요.",
    qa: [
      [
        "연필이 없어진 걸 알았을 때 어떤 기분이 들었나요?",
        "속상해서 눈물이 날 것 같았어요.",
      ],
      ["왜 그렇게 속상했다고 생각하나요?", "생일 선물로 받은 연필이라서요."],
      [
        "연필을 준 사람은 이 이야기를 들으면 어떤 마음일까요?",
        "괜찮다고 해 줄 것 같아요. 다음엔 이름을 써 둘 거예요.",
      ],
    ],
  },
  {
    emotion: "SURPRISE",
    inputType: "VOICE",
    content:
      "아침에 일어났더니 밖에 비가 엄청 많이 왔어요.\n어제는 해가 쨍쨍했는데 깜짝 놀랐어요.",
    qa: [
      [
        "비가 오는 걸 봤을 때 어떤 기분이 들었나요?",
        "깜짝 놀랐어요. 우산을 챙겨야 했어요.",
      ],
      ["왜 놀랐다고 생각하나요?", "어제는 날씨가 좋아서 비가 올 줄 몰랐어요."],
      [
        "비가 오면 좋아하는 친구도 있을까요?",
        "달팽이랑 개구리는 좋아할 것 같아요.",
      ],
    ],
  },
  {
    emotion: "JOY",
    inputType: "TEXT",
    content:
      "저녁에 아빠랑 같이 김밥을 만들었어요.\n제가 만든 김밥이 제일 맛있었어요.",
    qa: [
      ["김밥을 먹었을 때 어떤 기분이 들었나요?", "뿌듯하고 행복했어요."],
      [
        "왜 행복했다고 생각하나요?",
        "아빠가 제가 만든 게 제일 맛있다고 해 주셨어요.",
      ],
      [
        "아빠는 그때 어떤 기분이었을까요?",
        "아빠도 저랑 같이 만들어서 즐거웠을 것 같아요.",
      ],
    ],
  },
  {
    emotion: "ANGER",
    inputType: "VOICE",
    content: "동생이 제 블록 성을 무너뜨렸어요.\n오래 만든 거라서 화가 났어요.",
    qa: [
      ["성이 무너졌을 때 어떤 기분이 들었나요?", "화가 나서 소리를 질렀어요."],
      [
        "왜 그렇게 화가 났다고 생각하나요?",
        "한 시간 동안 열심히 만들었거든요.",
      ],
      [
        "동생은 왜 그랬을까요?",
        "동생도 같이 놀고 싶었던 것 같아요. 다음엔 같이 만들래요.",
      ],
    ],
  },
  {
    emotion: "SADNESS",
    inputType: "TEXT",
    content:
      "제일 친한 친구가 오늘 학교에 안 왔어요.\n쉬는 시간에 혼자 있어서 심심했어요.",
    qa: [
      ["친구가 안 왔을 때 어떤 기분이 들었나요?", "외롭고 조금 슬펐어요."],
      ["왜 슬펐다고 생각하나요?", "매일 같이 놀았는데 오늘은 못 놀아서요."],
      [
        "아파서 못 온 친구는 어떤 마음일까요?",
        "친구도 학교에 오고 싶었을 것 같아요. 내일은 꼭 왔으면 좋겠어요.",
      ],
    ],
  },
  {
    emotion: "FEAR",
    inputType: "VOICE",
    content:
      "밤에 자려고 누웠는데 창문에서 이상한 소리가 났어요.\n무서워서 엄마 방으로 갔어요.",
    qa: [
      [
        "이상한 소리를 들었을 때 어떤 기분이 들었나요?",
        "무서워서 이불 속에 숨었어요.",
      ],
      ["왜 무서웠다고 생각하나요?", "깜깜해서 뭐가 있는지 안 보였어요."],
      [
        "엄마는 그 소리를 듣고 뭐라고 했을까요?",
        "바람 소리라고 했어요. 엄마가 안아 줘서 괜찮아졌어요.",
      ],
    ],
  },
  {
    emotion: "JOY",
    inputType: "TEXT",
    content:
      "체육 시간에 달리기를 했는데 제가 일등을 했어요.\n친구들이 박수를 쳐 줬어요.",
    qa: [
      ["일등을 했을 때 어떤 기분이 들었나요?", "날아갈 것처럼 기뻤어요."],
      [
        "왜 그렇게 기뻤다고 생각하나요?",
        "지난번에는 이등이었는데 이번엔 일등을 해서요.",
      ],
      [
        "일등을 못 한 친구들은 어떤 기분이었을까요?",
        "조금 아쉬웠을 것 같아요. 다음엔 같이 연습하자고 할래요.",
      ],
    ],
  },
  {
    emotion: "SHAME",
    inputType: "VOICE",
    content:
      "수업 시간에 발표를 하다가 말이 꼬였어요.\n친구들이 웃어서 얼굴이 빨개졌어요.",
    qa: [
      ["친구들이 웃었을 때 어떤 기분이 들었나요?", "부끄러워서 숨고 싶었어요."],
      ["왜 부끄러웠다고 생각하나요?", "다들 저를 보고 있었거든요."],
      [
        "친구들은 왜 웃었을까요?",
        "놀리려는 게 아니라 재미있어서 웃은 것 같아요. 선생님이 잘했다고 해 주셨어요.",
      ],
    ],
  },
  {
    emotion: "SADNESS",
    inputType: "TEXT",
    content:
      "키우던 방울토마토 잎이 노랗게 변했어요.\n물을 너무 많이 줬나 봐요.",
    qa: [
      [
        "잎이 노랗게 된 걸 봤을 때 어떤 기분이 들었나요?",
        "미안하고 속상했어요.",
      ],
      ["왜 속상했다고 생각하나요?", "매일 물을 주면서 열심히 키웠어요."],
      [
        "방울토마토가 말을 할 수 있다면 뭐라고 할까요?",
        "물은 조금만 줘도 괜찮다고 할 것 같아요. 내일부터 조금만 줄래요.",
      ],
    ],
  },
];

/** 이번 달 1일 ~ 어제 중 최대 SEED_COUNT일을 고르게 고른다 (오늘은 절대 포함하지 않음) */
function pickSeedDates(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const pastDays = now.getDate() - 1; // 1일 ~ 어제
  const count = Math.min(SEED_COUNT, pastDays);
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => {
    const day =
      count === 1 ? 1 : 1 + Math.round((i * (pastDays - 1)) / (count - 1));
    return toISODate(new Date(year, month, day));
  });
}

// 화면에서만 삭제한 시드 id (새로고침하면 다시 보인다)
const hiddenIds = new Set();

/** 지금 보여줄 시드 일기 목록 (상세 형식). 날짜는 호출 시점 기준으로 다시 계산한다 */
export function getSeedDiaries() {
  if (!DEMO_SEED_ENABLED) return [];
  const today = toISODate();
  return pickSeedDates()
    .filter((date) => date < today)
    .map((date, i) => {
      const { emotion, inputType, content, qa } = SEED[i % SEED.length];
      return {
        diaryId: -(i + 1),
        date,
        emotion,
        inputType,
        content,
        questions: qa.map(([question, answer], q) => ({
          order: q + 1,
          type: TYPES[q],
          content: question,
          answer,
        })),
      };
    })
    .filter((d) => !hiddenIds.has(d.diaryId));
}

export const isSeedId = (diaryId) => Number(diaryId) < 0;

export function findSeedDiary(diaryId) {
  return getSeedDiaries().find((d) => d.diaryId === Number(diaryId)) ?? null;
}

export function hideSeedDiary(diaryId) {
  hiddenIds.add(Number(diaryId));
}
