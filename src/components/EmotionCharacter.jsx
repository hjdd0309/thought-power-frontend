import { getEmotion } from "@/constants/emotions";

/**
 * 감정 이모지 (감정 선택·보관함 달력·리포트 범례·그림일기장·완료 화면 공용)
 * 그림은 기존 감정 이모지 SVG(constants/emotions의 icon)를 그대로 쓴다
 * @param emotion 감정 코드 (JOY | SADNESS | ANGER | FEAR | SURPRISE | SHAME)
 * @param size 한 변 px (기본 64)
 * @param selected true: 살짝 커지고 통통 튐 / false: 흐리게 / undefined: 기본
 * @param label 있으면 접근성 이름으로 읽어 준다 (없으면 장식용으로 숨김)
 */
function EmotionCharacter({
  emotion,
  size = 64,
  selected,
  label,
  className = "",
}) {
  const e = getEmotion(emotion);
  if (!e) return null;

  const state =
    selected === true
      ? "scale-115"
      : selected === false
        ? "opacity-45 saturate-50"
        : "";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center transition duration-300 ${state} ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={e.icon}
        alt={label ?? ""}
        aria-hidden={label ? undefined : true}
        width={size}
        height={size}
        className={`pointer-events-none origin-bottom ${
          selected === true ? "motion-safe:animate-hop" : ""
        }`}
      />
    </span>
  );
}

export default EmotionCharacter;
