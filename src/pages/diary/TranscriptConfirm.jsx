import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import ErrorRetry from "@/components/ErrorRetry";

// 음성 변환 결과 수정·확인 (C03 · C06 · C09 · C12)
// - allowEmpty: 질문 답변(C06·C09·C12)은 비어 있어도 확인 가능. 일기 본문(C03)은 필수
// - hint: 입력 영역 아래 안내 문구 / error: 전송 실패 안내 (확인을 다시 누르면 재시도)
function TranscriptConfirm({
  value,
  onChange,
  onRetry,
  onConfirm,
  allowEmpty = false,
  hint,
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
        {hint && <p className="text-body-sm font-medium text-muted">{hint}</p>}
      </main>
      <BottomAction className="gap-3.5">
        {error && <ErrorRetry inline message={error} />}
        <Button variant="secondary" onClick={onRetry}>
          다시 녹음
        </Button>
        <Button disabled={!allowEmpty && !value.trim()} onClick={onConfirm}>
          확인
        </Button>
      </BottomAction>
    </>
  );
}

export default TranscriptConfirm;
