import { Outlet } from "react-router-dom";

// Figma 프레임 너비(402px) 기준 중앙 정렬 컨테이너
function MobileLayout() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-white">
        <Outlet />
      </div>
    </div>
  );
}

export default MobileLayout;
