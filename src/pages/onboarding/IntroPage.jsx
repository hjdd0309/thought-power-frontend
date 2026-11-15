import { useNavigate } from "react-router-dom";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import Character from "@/components/Character";
import SpeechBubble from "@/components/SpeechBubble";
import FixedScreen from "@/components/layout/FixedScreen";
import { vspace } from "@/utils/responsiveSpace";

// A04 서비스 소개
function IntroPage() {
  const navigate = useNavigate();

  return (
    <FixedScreen>
      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto py-6 text-center">
        <SpeechBubble className="self-stretch">
          안녕! 나는 생각의힘이야.
          <br />
          우리 함께 오늘을 돌아볼까?
        </SpeechBubble>
        <Character name="wave" size={250} style={{ marginTop: vspace(17) }} />
        <h1
          style={{ marginTop: vspace(24) }}
          className="font-logo text-[36px] leading-[1.2] text-ink"
        >
          생각의힘
        </h1>
        <p
          style={{ marginTop: vspace(14) }}
          className="text-body-sm font-medium text-muted"
        >
          질문으로 생각을 키우는 AI 일기 서비스
        </p>
      </main>
      <BottomAction>
        <Button onClick={() => navigate("/onboarding/helper")}>시작하기</Button>
      </BottomAction>
    </FixedScreen>
  );
}

export default IntroPage;
