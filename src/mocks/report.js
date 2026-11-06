import { getEmotion } from "@/constants/emotions";

// 감정 리포트 AI 문구 mock — docs/spec.md "AI → BE2 응답"(description·advice·interpretation)
// 명세의 AI 생성 규칙을 따른다:
// - 전달받은 기록(집계)에만 근거, 통계 수치는 다시 계산하거나 바꾸지 않음
// - 기록에 없는 사건·원인·아이의 상태를 추측하지 않음
// - 진단이나 "좋아졌다/나빠졌다" 같은 단정 금지
// - 기록이 적으면 장기적인 변화로 해석하지 않음

// 일기 0건 — BE2가 AI를 호출하지 않고 돌려주는 문구 (명세 그대로)
export const EMPTY_REPORT_TEXT = {
  description: "선택한 기간에 작성된 일기가 없어요.",
  advice: "아이와 오늘의 기분을 이야기하며 첫 일기를 남겨 보세요.",
  interpretation: "감정 기록이 없어 변화 추이를 확인할 수 없어요.",
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
const ieotYeot = (w) => `${w}${hasFinal(w) ? "이었" : "였"}`;

const label = (code) => getEmotion(code)?.label ?? code;

/** 집계(distribution·days)로 AI 문구 3종을 만든다 */
export function buildReportText(distribution, days) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);
  if (!total) return EMPTY_REPORT_TEXT;

  const max = Math.max(...distribution.map((d) => d.count));
  const top = distribution.filter((d) => d.count === max).map((d) => d.emotion);
  const kinds = distribution.filter((d) => d.count > 0).length;
  // 동률이면 가장 최근에 기록한 감정 기준으로 조언
  const recorded = days.flatMap((d) => d.emotions);
  const last = recorded[recorded.length - 1];

  const min = Math.min(
    ...distribution.filter((d) => d.count > 0).map((d) => d.count),
  );
  const description =
    max === min && kinds > 1
      ? `선택한 기간에는 ${kinds}가지 감정을 비슷하게 기록했어요.`
      : `선택한 기간에는 ${eulReul(top.map(label).join("·"))} 가장 자주 기록했어요.`;

  const adviceEmotion = top.length > 1 && top.includes(last) ? last : top[0];
  const advice = ADVICE[adviceEmotion];

  let interpretation;
  if (total < 3) {
    interpretation =
      "기록이 아직 적어서 변화를 말하기는 어려워요. 날짜별 감정은 그래프에서 확인할 수 있어요.";
  } else if (kinds >= 4) {
    interpretation = `${kinds}가지 감정을 골고루 기록했고, 마지막 기록은 ${ieotYeot(label(last))}어요.`;
  } else {
    interpretation = `${recorded
      .filter((e, i) => recorded.indexOf(e) === i)
      .map(label)
      .join("·")} 감정을 기록했고, 마지막 기록은 ${ieotYeot(label(last))}어요.`;
  }

  return { description, advice, interpretation };
}
