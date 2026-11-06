import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { completeDiary } from "@/api/diary";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import DiarySummary from "@/components/DiarySummary";
import TopBar from "@/components/TopBar";
import { QUESTION_COUNT } from "@/constants/diary";
import { useDiary } from "@/contexts/diary";
import { toISODate } from "@/utils/date";

// C13 / D06 전체 기록 확인 — 감정·날짜·본문·질문 3개와 답변, 완료하기
function ReviewPage() {
  const navigate = useNavigate();
  const diary = useDiary();
  const [saving, setSaving] = useState(false);

  const answered = diary.answers.filter((a) => a.answer);
  if (answered.length < QUESTION_COUNT) {
    return <Navigate to="/diary/write" replace />;
  }

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { diaryId } = await completeDiary(diary);
      diary.update({ diaryId });
      navigate("/diary/complete", { replace: true });
    } finally {
      setSaving(false);
    }
  };

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
        <Button disabled={saving} onClick={handleComplete}>
          완료하기
        </Button>
      </BottomAction>
    </>
  );
}

export default ReviewPage;
