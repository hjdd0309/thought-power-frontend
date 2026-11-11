import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOnboardingStatus } from "@/api/onboarding";
import { isOnboarded, markOnboarded } from "@/utils/storage";

const SPLASH_DURATION = 1500;

// A01 스플래시 — 서비스 로고 표시 후 온보딩 완료 사용자는 /home, 아니면 /start
function SplashPage() {
  const navigate = useNavigate();

  // 실서버면 사용자 조회(GET /api/users/me, 온보딩 전 404)로 판단하고,
  // mock이거나 조회에 실패하면 이 기기의 localStorage 값으로 판단한다
  useEffect(() => {
    let cancelled = false;
    const status = getOnboardingStatus().catch(() => null);
    const wait = new Promise((resolve) => setTimeout(resolve, SPLASH_DURATION));
    Promise.all([status, wait]).then(([onboarded]) => {
      if (cancelled) return;
      if (onboarded) markOnboarded();
      const done = onboarded ?? isOnboarded();
      navigate(done ? "/home" : "/start", { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="flex flex-1 items-center justify-center pb-13">
      <h1 className="font-logo text-[80px] leading-[1.2] text-yellow">
        생각의힘
      </h1>
    </main>
  );
}

export default SplashPage;
