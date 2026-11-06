import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { deleteDiary, getDiary } from "@/api/archive";
import trashIcon from "@/assets/icons/trash.svg";
import ConfirmDialog from "@/components/ConfirmDialog";
import DiarySummary from "@/components/DiarySummary";
import ErrorRetry from "@/components/ErrorRetry";
import LoadingState from "@/components/LoadingState";
import TopBar from "@/components/TopBar";
import useRequest from "@/hooks/useRequest";
import useSubmit from "@/hooks/useSubmit";
import { formatMonthDay } from "@/utils/date";

// E02 일기 상세 / 빈 날짜 안내 + 일기 삭제 확인
// /archive/:diaryId — 일기가 없는 날짜는 /archive/empty?date=YYYY-MM-DD
function DiaryDetailPage() {
  const navigate = useNavigate();
  const { diaryId } = useParams();
  const [searchParams] = useSearchParams();
  const isEmpty = diaryId === "empty";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const detail = useRequest(
    () => (isEmpty ? Promise.resolve(null) : getDiary(diaryId)),
    [diaryId],
  );
  const diary = detail.data;

  const remove = useSubmit(async () => {
    await deleteDiary(diaryId);
    setConfirmOpen(false);
    navigate("/archive", { replace: true });
  });

  const date = isEmpty ? searchParams.get("date") : diary?.date;
  const title = date ? `${formatMonthDay(date)}의 일기` : "";
  const hasDiary = !isEmpty && diary;

  return (
    <>
      <TopBar
        title={title}
        right={
          hasDiary ? (
            <button
              type="button"
              aria-label="일기 삭제"
              onClick={() => {
                remove.clearError();
                setConfirmOpen(true);
              }}
              className="mr-1 flex size-10 items-center justify-center"
            >
              <img src={trashIcon} alt="" width={32} height={32} />
            </button>
          ) : undefined
        }
      />
      <main className="px-5 pt-9.75 pb-10">
        {detail.loading && <LoadingState message="일기를 불러오고 있어요" />}
        {detail.error && (
          <ErrorRetry
            message="일기를 불러오지 못했어요."
            onRetry={detail.retry}
          />
        )}
        {hasDiary && (
          <DiarySummary
            emotion={diary.emotion}
            date={diary.date}
            content={diary.content}
            questions={diary.questions}
          />
        )}
        {!detail.loading && !detail.error && !hasDiary && (
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
        pending={remove.pending}
        error={remove.error && "삭제하지 못했어요. 다시 눌러 주세요."}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => remove.run()}
      />
    </>
  );
}

export default DiaryDetailPage;
