import Button from "@/components/Button";

/**
 * API 실패 안내 + 다시 시도
 * - 기본: 화면 가운데 큰 안내 (조회 실패)
 * - compact: 한 줄 안내 + 작은 다시 시도 버튼 (화면 일부 조회 실패)
 * - inline: 버튼 위 한 줄 문구만 (저장 실패 — 원래 버튼을 다시 누르면 재시도)
 */
function ErrorRetry({
  message = "잠시 문제가 생겼어요.",
  onRetry,
  inline = false,
  compact = false,
  className = "",
}) {
  if (inline) {
    return (
      <p
        role="alert"
        className={`text-center text-body-sm font-medium text-muted ${className}`}
      >
        {message}
      </p>
    );
  }

  if (compact) {
    return (
      <div
        role="alert"
        className={`flex items-center justify-between gap-3 rounded-bubble bg-border-neutral px-5 py-3 ${className}`}
      >
        <p className="text-body-sm font-medium text-ink">{message}</p>
        {onRetry && (
          <Button size="sm" className="shrink-0" onClick={onRetry}>
            다시 시도
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-4 py-12 text-center ${className}`}
    >
      <p className="text-body font-medium whitespace-pre-line text-ink">
        {message}
      </p>
      {onRetry && (
        <div className="flex w-40">
          <Button variant="secondary" size="md" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorRetry;
