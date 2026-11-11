import { useMemo, useState } from "react";
import { AGE_DEFAULT } from "@/constants/onboarding";
import { OnboardingContext } from "@/contexts/onboarding";

const INITIAL = {
  agreements: { guardian: false, terms: false, privacy: false },
  guardianType: null,
  name: "",
  age: AGE_DEFAULT,
};

// 온보딩 입력값 — 보조자·이름·나이·약관 동의(agreements)를 완료 시 한 번에 저장
// agreements는 { guardian, terms, privacy } 체크 상태 (AGREEMENT_ITEMS의 key)
function OnboardingProvider({ children }) {
  const [state, setState] = useState(INITIAL);

  const value = useMemo(
    () => ({
      ...state,
      update: (patch) => setState((prev) => ({ ...prev, ...patch })),
      reset: () => setState(INITIAL),
    }),
    [state],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export default OnboardingProvider;
