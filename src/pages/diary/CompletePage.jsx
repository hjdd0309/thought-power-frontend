import { Link, useNavigate } from "react-router-dom";
import settingIcon from "@/assets/icons/setting.svg";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import Character from "@/components/Character";
import Confetti from "@/components/Confetti";
import EmotionCharacter from "@/components/EmotionCharacter";
import { useDiary } from "@/contexts/diary";

// 칭찬 스티커 (별 모양, 흰 테두리 스티커 느낌)
function StarSticker({ size = 36 }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path
        d="M20 3.5l4.9 10 11 1.6-8 7.8 1.9 11L20 28.7l-9.8 5.2 1.9-11-8-7.8 11-1.6z"
        fill="var(--color-yellow)"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinejoin="round"
        paintOrder="stroke"
      />
      <path
        d="M14.5 20.5q2.5 2.5 5.5 0M20 20.5q2.5 2.5 5.5 0"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// C14 / D07 작성 완료 — 보관함에서 보기 · 홈으로 돌아가기
// 오늘 고른 감정 이모지가 색종이와 함께 기뻐하고, 칭찬 스티커 1개를 보여준다
function CompletePage() {
  const navigate = useNavigate();
  const { emotion, reset } = useDiary();

  const go = (to) => {
    reset();
    navigate(to, { replace: true });
  };

  return (
    <>
      <header className="mt-6.5 flex justify-end px-5">
        <Link to="/settings" aria-label="설정" className="size-8">
          <img src={settingIcon} alt="" width={32} height={32} />
        </Link>
      </header>
      <main className="px-5 pt-13">
        <section className="relative flex h-119.25 flex-col items-center rounded-dialog border border-border-neutral bg-white pt-14 text-center">
          <Confetti />
          <div className="relative motion-safe:animate-cheer">
            {emotion ? (
              <EmotionCharacter emotion={emotion} size={180} />
            ) : (
              // 새로고침 등으로 감정 정보가 없으면 기본 캐릭터
              <Character name="sit" size={180} />
            )}
          </div>
          <h1 className="mt-8 text-headline font-bold">
            오늘의 일기를 완성했어요!
          </h1>
          <p className="mt-3.5 text-body-sm font-medium text-muted">
            내 마음을 들여다보는 멋진 시간이었어요.
          </p>
          <p
            role="status"
            className="mt-7 flex animate-pop-in items-center gap-2 rounded-full bg-yellow-light py-2 pr-4.5 pl-2.5 text-body-sm font-bold"
          >
            <StarSticker />
            칭찬 스티커 1개를 받았어요!
          </p>
        </section>
      </main>
      <BottomAction className="items-center gap-3.5 pb-20.25">
        <Button onClick={() => go("/archive")}>보관함에서 보기</Button>
        <button
          type="button"
          onClick={() => go("/home")}
          className="text-body-sm font-medium text-muted"
        >
          홈으로 돌아가기
        </button>
      </BottomAction>
    </>
  );
}

export default CompletePage;
