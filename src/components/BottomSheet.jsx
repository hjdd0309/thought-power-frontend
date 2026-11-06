// 바텀 시트 (오버레이 #111 22%, 상단 radius 28, 높이 362.5)
function BottomSheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-40 mx-auto flex h-dvh max-w-mobile flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 cursor-default bg-ink/22"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative min-h-90.5 rounded-t-sheet bg-white px-6 pt-6 pb-10"
      >
        {children}
      </div>
    </div>
  );
}

export default BottomSheet;
