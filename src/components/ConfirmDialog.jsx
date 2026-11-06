import Button from "@/components/Button";

// 확인 팝업 (322px, radius 24, 오버레이 #111 28%) — pending 중에는 버튼·바깥 클릭 비활성
function ConfirmDialog({
  open,
  title,
  description,
  cancelText = "취소",
  confirmText = "확인",
  pending = false,
  error,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 mx-auto flex h-dvh max-w-mobile items-center justify-center">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 cursor-default bg-ink/28"
        onClick={pending ? undefined : onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative flex w-80.5 flex-col gap-3 rounded-dialog bg-white p-6"
      >
        <p className="text-[20px] leading-[1.2] font-bold">{title}</p>
        {description && (
          <p className="text-body-sm font-medium text-muted">{description}</p>
        )}
        {error && (
          <p role="alert" className="text-body-sm font-medium text-ink">
            {error}
          </p>
        )}
        <div className="flex gap-2.5 pt-3">
          <Button
            variant="secondary"
            size="md"
            disabled={pending}
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button size="md" disabled={pending} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
