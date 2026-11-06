import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import Character from "@/components/Character";
import ProgressBar from "@/components/ProgressBar";
import SpeechBubble from "@/components/SpeechBubble";
import TopBar from "@/components/TopBar";

// A05~A07 공통 틀: 뒤로가기 + 진행률 n/3 + 말풍선 + 캐릭터 + 입력 영역 + 다음으로
function OnboardingStep({
  step,
  question,
  character,
  nextDisabled = false,
  onNext,
  children,
}) {
  return (
    <>
      <TopBar>
        <ProgressBar current={step} total={3} />
      </TopBar>
      <main className="flex flex-col">
        <SpeechBubble className="mt-13">{question}</SpeechBubble>
        <Character name={character} className="mt-4.5" />
        <div className="px-5">{children}</div>
      </main>
      <BottomAction>
        <Button disabled={nextDisabled} onClick={onNext}>
          다음으로
        </Button>
      </BottomAction>
    </>
  );
}

export default OnboardingStep;
