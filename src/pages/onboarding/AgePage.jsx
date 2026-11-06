import { useNavigate } from "react-router-dom";
import { AGE_MAX, AGE_MIN } from "@/constants/onboarding";
import { useOnboarding } from "@/contexts/onboarding";
import OnboardingStep from "@/pages/onboarding/OnboardingStep";

// Figma 나이 선택 슬라이더: 트랙 308px(좌 27px), 핸들 28px
// 나이 한 칸 간격은 범위(AGE_MIN~AGE_MAX)에 맞춰 트랙 전체에 고르게 나눈다
const TRACK_LEFT = 27;
const TRACK_WIDTH = 308;
const STEP_PX = TRACK_WIDTH / (AGE_MAX - AGE_MIN);

// A07 나이 선택 (진행 3/3)
function AgePage() {
  const navigate = useNavigate();
  const { age, update } = useOnboarding();
  const ages = Array.from(
    { length: AGE_MAX - AGE_MIN + 1 },
    (_, i) => AGE_MIN + i,
  );
  // 범위 밖 값(이전 범위로 저장된 값 등)은 가장 가까운 끝으로 보정해서 표시
  const shown = Math.min(AGE_MAX, Math.max(AGE_MIN, age));
  const offset = (shown - AGE_MIN) * STEP_PX;

  return (
    <OnboardingStep
      step={3}
      question="몇 살이에요?"
      character="smile"
      onNext={() => {
        update({ age: shown });
        navigate("/onboarding/done");
      }}
    >
      <div className="relative mt-12 h-41.5">
        <p className="text-center text-[27.5px] leading-[1.2] font-bold">
          {shown}세
        </p>
        {/* 트랙 */}
        <div className="absolute top-18.75 left-6.75 h-4 w-77 rounded-lg bg-border-neutral" />
        <div
          className="absolute top-18.75 left-6.75 h-4 rounded-lg bg-yellow transition-all"
          style={{ width: offset }}
        />
        {/* 최소 나이 기준점 · 6세 */}
        <span className="absolute top-17.25 left-3.25 size-7 rounded-full border-2 border-border-neutral bg-white" />
        {/* 슬라이더 핸들 */}
        <span
          className="absolute top-17.25 size-7 rounded-full bg-yellow transition-all"
          style={{ left: TRACK_LEFT - 14 + offset }}
        />
        {/* 나이 터치 영역 */}
        <div
          role="radiogroup"
          aria-label="나이 선택"
          className="absolute top-13.75 flex"
          style={{ left: TRACK_LEFT - STEP_PX / 2 }}
        >
          {ages.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={shown === a}
              aria-label={`${a}세`}
              onClick={() => update({ age: a })}
              className="h-14"
              style={{ width: STEP_PX }}
            />
          ))}
        </div>
        <div className="absolute top-29 left-1.75 flex w-87 justify-between text-center text-body-sm font-medium text-muted">
          <span className="w-10">{AGE_MIN}세</span>
          <span className="w-10">{AGE_MAX}세</span>
        </div>
      </div>
    </OnboardingStep>
  );
}

export default AgePage;
