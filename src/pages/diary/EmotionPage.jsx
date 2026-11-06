import { useNavigate } from "react-router-dom";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import SelectCard from "@/components/SelectCard";
import TopBar from "@/components/TopBar";
import { EMOTIONS } from "@/constants/emotions";
import { useDiary } from "@/contexts/diary";

// B02 감정 선택 전(다음 비활성) / B03_0~5 감정 선택(강조 + 다음 활성)
function EmotionPage() {
  const navigate = useNavigate();
  const { emotion, update } = useDiary();

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
          {EMOTIONS.map((e) => (
            <SelectCard
              key={e.code}
              rounded="rounded-card"
              selected={emotion === e.code}
              onClick={() => update({ emotion: e.code })}
              className="h-31 flex-col gap-3"
            >
              <img src={e.icon} alt="" width={48} height={48} />
              {e.label}
            </SelectCard>
          ))}
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
