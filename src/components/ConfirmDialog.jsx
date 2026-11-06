import Button from "@/components/Button";

// 확인 팝업 (322px, radius 24, 오버레이 #111 28%)
function ConfirmDialog({
  open,
  title,
  description,
  cancelText = "취소",
  confirmText = "확인",
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
        onClick={onCancel}
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
        <div className="flex gap-2.5 pt-3">
          <Button variant="secondary" size="md" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button size="md" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
