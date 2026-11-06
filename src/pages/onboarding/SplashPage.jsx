import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SPLASH_DURATION = 1500;

// A01 스플래시 — 서비스 로고 표시 후 /start 이동
function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: 백엔드 연결 시 온보딩 완료 사용자는 /home으로 이동
    const timer = setTimeout(
      () => navigate("/start", { replace: true }),
      SPLASH_DURATION,
    );
    return () => clearTimeout(timer);
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
