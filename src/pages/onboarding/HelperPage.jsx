import { useNavigate } from "react-router-dom";
import SelectCard from "@/components/SelectCard";
import { GUARDIAN_TYPES } from "@/constants/onboarding";
import { useOnboarding } from "@/contexts/onboarding";
import OnboardingStep from "@/pages/onboarding/OnboardingStep";

// A05 도움을 주는 사람 선택 (진행 1/3)
function HelperPage() {
  const navigate = useNavigate();
  const { guardianType, update } = useOnboarding();

  return (
    <OnboardingStep
      step={1}
      question="누가 함께 도와주고 있나요?"
      character="wave"
      nextDisabled={!guardianType}
      onNext={() => navigate("/onboarding/name")}
    >
      <div className="mt-11.5 grid grid-cols-2 gap-3">
        {GUARDIAN_TYPES.map(({ code, label }) => (
          <SelectCard
            key={code}
            selected={guardianType === code}
            onClick={() => update({ guardianType: code })}
            className="h-18"
          >
            {label}
          </SelectCard>
        ))}
      </div>
    </OnboardingStep>
  );
}

export default HelperPage;
