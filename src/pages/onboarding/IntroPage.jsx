import { useNavigate } from "react-router-dom";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import Character from "@/components/Character";
import SpeechBubble from "@/components/SpeechBubble";

// A04 서비스 소개
function IntroPage() {
  const navigate = useNavigate();

  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <SpeechBubble className="self-stretch">
          안녕! 나는 생각의힘이야.
          <br />
          우리 함께 오늘을 돌아볼까?
        </SpeechBubble>
        <Character name="wave" size={250} className="mt-4.25" />
        <h1 className="mt-6 font-logo text-[36px] leading-[1.2] text-ink">
          생각의힘
        </h1>
        <p className="mt-3.5 text-body-sm font-medium text-muted">
          질문으로 생각을 키우는 AI 일기 서비스
        </p>
      </main>
      <BottomAction>
        <Button onClick={() => navigate("/onboarding/helper")}>시작하기</Button>
      </BottomAction>
    </>
  );
}

export default IntroPage;
