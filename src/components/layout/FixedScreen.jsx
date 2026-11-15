import "@/utils/viewportHeight";

// 고정 화면 공통 틀 — 상단바·하단 버튼은 그 자리에 있고, 가운데 영역(children)만
// 남는 공간을 쓰다가 모자라면 가운데만 스크롤된다(전체 페이지 스크롤 없음).
// height는 --app-vh(visualViewport, iOS 키보드 대응)가 있으면 그 값을, 없으면 100dvh를 쓴다.
// 보관함·일기 상세·리포트·일기 확인처럼 내용이 원래 긴 화면에는 쓰지 않는다.
// 하단 메뉴(BottomNav) 높이만큼 빼야 하는 화면(홈)은 height를 직접 넘긴다.
function FixedScreen({ height = "var(--app-vh, 100dvh)", className = "", children }) {
  return (
    <div
      style={{ height, paddingTop: "env(safe-area-inset-top)" }}
      className={`flex min-h-0 flex-col overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export default FixedScreen;
