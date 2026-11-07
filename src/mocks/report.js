import { getEmotion } from "@/constants/emotions";

// 감정 리포트 AI 문구 mock — DB emotion_reports 컬럼 기준, snake_case로 내려온다
// (most_emotion_reason·least_emotion_reason·parent_advice·trend_interpretation).
// trend_title은 프론트 고정 문구라 미사용.
// AI 생성 규칙(docs/spec.md):
// - 전달받은 기록(집계)에만 근거, 통계 수치는 다시 계산하거나 바꾸지 않음
// - 기록에 없는 사건·원인·아이의 상태를 추측하지 않음
// - 진단이나 "좋아졌다/나빠졌다" 같은 단정 금지
// - 기록이 적으면 장기적인 변화로 해석하지 않음

// 일기 0건 — BE2가 AI를 호출하지 않고 돌려주는 문구
export const EMPTY_REPORT_TEXT = {
  most_emotion_reason: "선택한 기간에 작성된 일기가 없어요.",
  least_emotion_reason: "선택한 기간에 작성된 일기가 없어요.",
  parent_advice: "아이와 오늘의 기분을 이야기하며 첫 일기를 남겨 보세요.",
  trend_interpretation: "감정 기록이 없어 변화 추이를 확인할 수 없어요.",
};

// 가장 자주 기록한 감정에 맞춘 보호자 한 줄 조언 (1문장)
const ADVICE = {
  JOY: "아이와 즐거웠던 순간을 함께 떠올리며 어떤 점이 좋았는지 물어봐 주세요.",
  SADNESS: "속상했던 날의 이야기를 서두르지 말고 편안하게 들어 주세요.",
  ANGER: "화가 났던 상황에서 아이가 어떤 마음이었는지 차분히 물어봐 주세요.",
  FEAR: "무서웠던 일을 이야기할 때 곁에서 안심할 수 있도록 들어 주세요.",
  SURPRISE: "놀랐던 일을 아이가 어떻게 느꼈는지 함께 이야기해 보세요.",
  SHAME: "부끄러웠던 순간도 괜찮다고 말해 주며 이야기를 들어 주세요.",
};

// 받침 여부로 조사 고르기 (을/를, 이었/였)
const hasFinal = (word) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
};
const eulReul = (w) => `${w}${hasFinal(w) ? "을" : "를"}`;
const eunNeun = (w) => `${w}${hasFinal(w) ? "은" : "는"}`;
const ieotYeot = (w) => `${w}${hasFinal(w) ? "이었" : "였"}`;

const label = (code) => getEmotion(code)?.label ?? code;

/**
 * 집계(distribution)·최다/최소 감정(mostFrequentEmotions·leastFrequentEmotions)·
 * 일기별 감정 기록(recorded, 날짜순)으로 AI 문구 4종(snake_case)을 만든다
 */
export function buildReportText(
  distribution,
  mostFrequentEmotions,
  leastFrequentEmotions,
  recorded,
) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);
  if (!total) return EMPTY_REPORT_TEXT;

  const kinds = distribution.filter((d) => d.count > 0).length;
  // 동률이면 가장 최근에 기록한 감정 기준으로 조언
  const last = recorded[recorded.length - 1];
  const tied = mostFrequentEmotions.length === distribution.length;

  const most_emotion_reason = tied
    ? `선택한 기간에는 ${distribution.length}가지 감정을 비슷하게 기록했어요.`
    : `선택한 기간에는 ${eulReul(mostFrequentEmotions.map(label).join("·"))} 가장 자주 기록했어요.`;

  // 최소 감정이 0건이면 "가장 적게 기록했어요" 대신 아예 기록되지 않았다고 안내
  const leastCount = leastFrequentEmotions.length
    ? (distribution.find((d) => d.emotion === leastFrequentEmotions[0])
        ?.count ?? 0)
    : 0;
  const least_emotion_reason = tied
    ? most_emotion_reason
    : leastCount === 0
      ? `${eunNeun(leastFrequentEmotions.map(label).join("·"))} 선택한 기간에 기록되지 않았어요.`
      : `선택한 기간에는 ${eulReul(leastFrequentEmotions.map(label).join("·"))} 가장 적게 기록했어요.`;

  const adviceEmotion =
    mostFrequentEmotions.length > 1 && mostFrequentEmotions.includes(last)
      ? last
      : mostFrequentEmotions[0];
  const parent_advice = ADVICE[adviceEmotion];

  let trend_interpretation;
  if (total < 3) {
    trend_interpretation =
      "기록이 아직 적어서 변화를 말하기는 어려워요. 날짜별 감정은 그래프에서 확인할 수 있어요.";
  } else if (kinds >= 4) {
    trend_interpretation = `${kinds}가지 감정을 골고루 기록했고, 마지막 기록은 ${ieotYeot(label(last))}어요.`;
  } else {
    trend_interpretation = `${recorded
      .filter((e, i) => recorded.indexOf(e) === i)
      .map(label)
      .join("·")} 감정을 기록했고, 마지막 기록은 ${ieotYeot(label(last))}어요.`;
  }

  return {
    most_emotion_reason,
    least_emotion_reason,
    parent_advice,
    trend_interpretation,
  };
}
