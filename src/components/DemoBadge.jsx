// [DEMO] feature/ui-polish 데모 브랜치 전용 — 실데이터로 착각하지 않도록 화면 상단에 작게 표시
// 데모용, 머지 금지 — 동의 후 실서버 연결 버전으로 다시 작업
function DemoBadge() {
  return (
    <p
      role="note"
      className="pointer-events-none fixed top-0 left-1/2 z-50 -translate-x-1/2 rounded-b-lg bg-ink/75 px-2.5 py-0.5 text-[10.5px] leading-[1.4] font-medium whitespace-nowrap text-white"
    >
      UI 미리보기 (mock 데이터)
    </p>
  );
}

export default DemoBadge;
