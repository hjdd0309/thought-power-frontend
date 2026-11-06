// 진행 표시/n-3 (트랙 250×8, 숫자 13.5px)
function ProgressBar({ current, total = 3 }) {
  const percent = Math.min(100, (current / total) * 100);
  return (
    <div className="flex w-full items-center justify-center gap-3.5">
      <div
        className="relative h-2 w-62.5 rounded-lg bg-border-neutral"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-lg bg-yellow"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="w-10 text-right text-label font-medium text-muted">
        {current}/{total}
      </p>
    </div>
  );
}

export default ProgressBar;
