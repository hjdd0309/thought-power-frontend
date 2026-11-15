import { vspace } from "@/utils/responsiveSpace";

// 화면 하단 고정 버튼 영역 (Figma: 좌우 20px, 하단 64px)
// 하단 여백은 보이는 높이가 작을수록 줄어들고(최대 bottom px 유지), standalone 홈 바 영역도 추가로 비킨다
// bottom: 버튼 아래 안내 문구 등으로 기본 64px보다 더 필요한 화면(예: 완료 화면)에서 지정
function BottomAction({ className = "", bottom = 64, children }) {
  return (
    <div
      style={{
        paddingBottom: `calc(${vspace(bottom, 0.3)} + env(safe-area-inset-bottom))`,
      }}
      className={`sticky bottom-0 mt-auto flex flex-col gap-3 bg-white px-5 pt-3 ${className}`}
    >
      {children}
    </div>
  );
}

export default BottomAction;
