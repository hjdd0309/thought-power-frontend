import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { deleteDiary, getDiary } from "@/api/archive";
import trashIcon from "@/assets/icons/trash.svg";
import ConfirmDialog from "@/components/ConfirmDialog";
import DiarySummary from "@/components/DiarySummary";
import TopBar from "@/components/TopBar";
import { formatMonthDay } from "@/utils/date";

// E02 일기 상세 / 빈 날짜 안내 + 일기 삭제 확인
// /archive/:diaryId — 일기가 없는 날짜는 /archive/empty?date=YYYY-MM-DD
function DiaryDetailPage() {
  const navigate = useNavigate();
  const { diaryId } = useParams();
  const [searchParams] = useSearchParams();
  const isEmpty = diaryId === "empty";
  const [diary, setDiary] = useState(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isEmpty) return;
    let ignore = false;
    getDiary(diaryId).then((d) => {
      if (!ignore) setDiary(d);
    });
    return () => {
      ignore = true;
    };
  }, [diaryId, isEmpty]);

  const date = isEmpty ? searchParams.get("date") : diary?.date;
  const title = date ? `${formatMonthDay(date)}의 일기` : "";
  const hasDiary = !isEmpty && diary;

  const handleDelete = async () => {
    await deleteDiary(diaryId);
    setConfirmOpen(false);
    navigate("/archive", { replace: true });
  };

  return (
    <>
      <TopBar
        title={title}
        right={
          hasDiary ? (
            <button
              type="button"
              aria-label="일기 삭제"
              onClick={() => setConfirmOpen(true)}
              className="mr-1 flex size-10 items-center justify-center"
            >
              <img src={trashIcon} alt="" width={32} height={32} />
            </button>
          ) : undefined
        }
      />
      <main className="px-5 pt-9.75 pb-10">
        {hasDiary && (
          <DiarySummary
            emotion={diary.emotion}
            date={diary.date}
            content={diary.content}
            questions={diary.questions}
          />
        )}
        {(isEmpty || diary === null) && (
          <p className="mt-6.75 text-center text-body font-medium">
            아직 등록된 일기가 없어요.
            <br />
            홈에서 오늘의 이야기를 기록해 주세요.
          </p>
        )}
      </main>
      <ConfirmDialog
        open={confirmOpen}
        title="일기를 삭제할까요?"
        description="삭제한 일기는 다시 볼 수 없어요."
        cancelText="취소"
        confirmText="삭제"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default DiaryDetailPage;
