import { useNavigate } from "react-router-dom";
import { getTodayDiary } from "@/api/archive";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import EmotionCharacter from "@/components/EmotionCharacter";
import LoadingState from "@/components/LoadingState";
import SelectCard from "@/components/SelectCard";
import TopBar from "@/components/TopBar";
import { EMOTIONS } from "@/constants/emotions";
import { useDiary } from "@/contexts/diary";
import useRequest from "@/hooks/useRequest";
import AlreadyWritten from "@/pages/diary/AlreadyWritten";

// B02 감정 선택 전(다음 비활성) / B03_0~5 감정 선택(강조 + 다음 활성)
// 홈 일기 쓰기·하단 + 버튼 진입점 — 오늘 일기가 이미 있으면 감정 선택 대신 안내 (하루 1개 제한)
function EmotionPage() {
  const navigate = useNavigate();
  const { emotion, update } = useDiary();
  // 확인에 실패하면 그대로 작성하게 두고, 완료 저장 때 DIARY_ALREADY_EXISTS로 한 번 더 막는다
  const today = useRequest(getTodayDiary);

  if (today.loading) {
    return (
      <>
        <TopBar onBack={() => navigate("/home")} />
        <LoadingState className="my-auto" />
      </>
    );
  }
  if (today.data) return <AlreadyWritten diaryId={today.data.diaryId} />;

  return (
    <>
      <TopBar onBack={() => navigate("/home")} />
      <main className="flex flex-col px-5">
        <h1 className="mt-8 text-headline font-bold">
          오늘의 기분을
          <br />
          알려주세요!
        </h1>
        <p className="mt-3.5 text-body-sm font-medium text-muted">
          오늘 가장 크게 느낀 감정을 골라봐요.
        </p>
        <div className="mt-11.5 grid grid-cols-2 gap-x-3.5 gap-y-3">
          {EMOTIONS.map((e) => {
            const selected = emotion === e.code;
            // 하나를 고르면 나머지 카드는 살짝 흐리게
            const dimmed = Boolean(emotion) && !selected;
            return (
              <SelectCard
                key={e.code}
                rounded="rounded-card"
                selected={selected}
                onClick={() => update({ emotion: e.code })}
                className={`h-31 flex-col gap-2 transition-opacity duration-300 ${
                  dimmed ? "opacity-60" : ""
                }`}
              >
                <EmotionCharacter
                  emotion={e.code}
                  size={64}
                  selected={selected || undefined}
                />
                {e.label}
              </SelectCard>
            );
          })}
        </div>
      </main>
      <BottomAction>
        <Button disabled={!emotion} onClick={() => navigate("/diary/mode")}>
          다음으로
        </Button>
      </BottomAction>
    </>
  );
}

export default EmotionPage;
