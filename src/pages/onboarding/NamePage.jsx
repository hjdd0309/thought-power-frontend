import { useNavigate } from "react-router-dom";
import TextField from "@/components/TextField";
import { useOnboarding } from "@/contexts/onboarding";
import OnboardingStep from "@/pages/onboarding/OnboardingStep";

// A06 이름 입력 (진행 2/3)
function NamePage() {
  const navigate = useNavigate();
  const { name, update } = useOnboarding();
  const trimmed = name.trim();

  return (
    <OnboardingStep
      step={2}
      question="이름이 뭐예요?"
      character="smile"
      nextDisabled={!trimmed}
      onNext={() => {
        update({ name: trimmed });
        navigate("/onboarding/age");
      }}
    >
      <TextField
        className="mt-16.25"
        placeholder="이름을 입력해 주세요"
        value={name}
        maxLength={20}
        onChange={(e) => update({ name: e.target.value })}
        aria-label="이름"
      />
    </OnboardingStep>
  );
}

export default NamePage;
