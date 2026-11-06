// 화면 하단 고정 버튼 영역 (Figma: 좌우 20px, 하단 64px)
function BottomAction({ className = "", children }) {
  return (
    <div
      className={`sticky bottom-0 mt-auto flex flex-col gap-3 bg-white px-5 pt-3 pb-16 ${className}`}
    >
      {children}
    </div>
  );
}

export default BottomAction;
