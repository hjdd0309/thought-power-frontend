import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import ErrorRetry from "@/components/ErrorRetry";

// 음성 변환 결과 수정·확인 (C03 · C06 · C09 · C12)
function TranscriptConfirm({
  value,
  onChange,
  onRetry,
  onConfirm,
  saving,
  error,
}) {
  return (
    <>
      <main className="flex flex-col gap-4.5 px-5 pt-6.75">
        <h1 className="text-headline font-bold">이렇게 기록할까요?</h1>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="기록 내용"
          className="h-88 w-full resize-none rounded-card border border-border-neutral bg-white p-5 text-[20px] leading-[1.2] font-medium text-ink outline-none focus:border-yellow"
        />
      </main>
      <BottomAction className="gap-3.5">
        {error && <ErrorRetry inline message={error} />}
        <Button variant="secondary" disabled={saving} onClick={onRetry}>
          다시 녹음
        </Button>
        <Button disabled={!value.trim() || saving} onClick={onConfirm}>
          확인
        </Button>
      </BottomAction>
    </>
  );
}

export default TranscriptConfirm;
