import { Navigate, useNavigate } from "react-router-dom";
import { completeDiary } from "@/api/diary";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import DiarySummary from "@/components/DiarySummary";
import ErrorRetry from "@/components/ErrorRetry";
import TopBar from "@/components/TopBar";
import { QUESTION_COUNT } from "@/constants/diary";
import { useDiary } from "@/contexts/diary";
import useSubmit from "@/hooks/useSubmit";
import { toISODate } from "@/utils/date";

// C13 / D06 전체 기록 확인 — 감정·날짜·본문·질문 3개와 답변, 완료하기
function ReviewPage() {
  const navigate = useNavigate();
  const diary = useDiary();
  const submit = useSubmit(async () => {
    const { diaryId } = await completeDiary(diary);
    diary.update({ diaryId });
    navigate("/diary/complete", { replace: true });
  });

  const answered = diary.answers.filter((a) => a.answer);
  if (answered.length < QUESTION_COUNT) {
    return <Navigate to="/diary/write" replace />;
  }

  return (
    <>
      <TopBar />
      <main className="flex flex-col gap-4.5 px-5 pt-6.75">
        <h1 className="text-headline font-bold">이렇게 기록할까요?</h1>
        <DiarySummary
          emotion={diary.emotion}
          date={toISODate()}
          content={diary.content}
          questions={diary.answers}
        />
      </main>
      <BottomAction className="pt-6">
        {submit.error && (
          <ErrorRetry inline message="저장하지 못했어요. 다시 눌러 주세요." />
        )}
        <Button disabled={submit.pending} onClick={() => submit.run()}>
          {submit.pending ? "저장하고 있어요…" : "완료하기"}
        </Button>
      </BottomAction>
    </>
  );
}

export default ReviewPage;
