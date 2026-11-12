import { useNavigate } from "react-router-dom";
import { AGE_MAX, AGE_MIN } from "@/constants/onboarding";
import { useOnboarding } from "@/contexts/onboarding";
import OnboardingStep from "@/pages/onboarding/OnboardingStep";

// Figma 나이 선택 슬라이더: 트랙 308px(좌 27px), 핸들 28px
// 핸들 중심이 트랙 양 끝(6세·10세)까지 가도록 input은 트랙보다 핸들 크기만큼 넓게 둔다
const TRACK_WIDTH = 308;
const STEP_PX = TRACK_WIDTH / (AGE_MAX - AGE_MIN);

// 기본 range 모양을 지우고 흰 원 핸들만 보이게 (트랙·채움은 아래 div로 그림)
const RANGE_CLASS = [
  "absolute top-17.25 left-3.25 h-7 w-84 cursor-pointer appearance-none bg-transparent",
  "[&::-webkit-slider-runnable-track]:h-7 [&::-webkit-slider-runnable-track]:bg-transparent",
  "[&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-border-neutral [&::-webkit-slider-thumb]:bg-white",
  "[&::-moz-range-track]:h-7 [&::-moz-range-track]:bg-transparent",
  "[&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-border-neutral [&::-moz-range-thumb]:bg-white",
].join(" ");

// A07 나이 선택 (진행 3/3)
function AgePage() {
  const navigate = useNavigate();
  const { age, update } = useOnboarding();
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
        {/* 채움: 핸들 위치까지 (드래그 중 따라오도록 transition 없음) */}
        <div
          className="absolute top-18.75 left-6.75 h-4 rounded-lg bg-yellow"
          style={{ width: offset }}
        />
        {/* 슬라이더 (흰 원이 핸들) */}
        <input
          type="range"
          min={AGE_MIN}
          max={AGE_MAX}
          step={1}
          value={shown}
          onChange={(e) => update({ age: Number(e.target.value) })}
          aria-label="나이 선택"
          aria-valuetext={`${shown}세`}
          className={RANGE_CLASS}
        />
        <div className="absolute top-29 left-1.75 flex w-87 justify-between text-center text-body-sm font-medium text-muted">
          <span className="w-10">{AGE_MIN}세</span>
          <span className="w-10">{AGE_MAX}세</span>
        </div>
      </div>
    </OnboardingStep>
  );
}

export default AgePage;
