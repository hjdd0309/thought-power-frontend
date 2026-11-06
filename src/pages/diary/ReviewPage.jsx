import { Navigate, useNavigate } from "react-router-dom";
import { saveDiary } from "@/api/diary";
import { isDiaryAlreadyExists } from "@/api/mock";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import DiarySummary from "@/components/DiarySummary";
import ErrorRetry from "@/components/ErrorRetry";
import TopBar from "@/components/TopBar";
import { QUESTION_COUNT } from "@/constants/diary";
import { useDiary } from "@/contexts/diary";
import useSubmit from "@/hooks/useSubmit";
import AlreadyWritten from "@/pages/diary/AlreadyWritten";
import { toISODate } from "@/utils/date";

// C13 / D06 전체 기록 확인 — 감정·날짜·본문·질문 3개와 답변, 완료하기
// 완료하기에서 작성 내용 전체를 한 번에 저장한다. 실패해도 DiaryContext는 그대로라 다시 누르면 재시도
function ReviewPage() {
  const navigate = useNavigate();
  const diary = useDiary();
  const date = toISODate();
  const submit = useSubmit(async () => {
    await saveDiary({
      emotion: diary.emotion,
      inputType: diary.inputType,
      date,
      content: diary.content,
      questions: diary.answers.map(({ order, type, content, answer }) => ({
        order,
        type,
        content,
        answer,
      })),
    });
    navigate("/diary/complete", { replace: true });
  });

  // 그사이 오늘 일기가 저장된 경우(하루 1개) — 다시 시도 대신 이미 썼다는 안내
  if (isDiaryAlreadyExists(submit.error)) {
    return <AlreadyWritten onLeave={diary.reset} />;
  }

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
          date={date}
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
