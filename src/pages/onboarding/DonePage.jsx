import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "@/api/onboarding";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import Character from "@/components/Character";
import { useOnboarding } from "@/contexts/onboarding";
import { markOnboarded } from "@/utils/storage";

// A08 시작 준비 완료 — 온보딩 값 일괄 저장 후 홈 이동
function DonePage() {
  const navigate = useNavigate();
  const { agreements, guardianType, name, age } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    setSaving(true);
    try {
      await completeOnboarding({ agreements, guardianType, name, age });
      markOnboarded();
      navigate("/home", { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <main className="flex flex-col items-center pt-60.75">
        <Character name="wave" size={260} />
        <h1 className="mt-12.5 text-headline font-bold">이제 시작해요!</h1>
      </main>
      <BottomAction>
        <Button disabled={saving} onClick={handleStart}>
          시작하기
        </Button>
      </BottomAction>
    </>
  );
}

export default DonePage;
