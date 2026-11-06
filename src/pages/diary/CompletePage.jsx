import { Link, useNavigate } from "react-router-dom";
import settingIcon from "@/assets/icons/setting.svg";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import Character from "@/components/Character";
import { useDiary } from "@/contexts/diary";

// C14 / D07 작성 완료 — 보관함에서 보기 · 홈으로 돌아가기
function CompletePage() {
  const navigate = useNavigate();
  const { reset } = useDiary();

  const go = (to) => {
    reset();
    navigate(to, { replace: true });
  };

  return (
    <>
      <header className="mt-17 flex justify-end px-5">
        <Link to="/settings" aria-label="설정" className="size-8">
          <img src={settingIcon} alt="" width={32} height={32} />
        </Link>
      </header>
      <main className="px-5 pt-13">
        <section className="flex h-119.25 flex-col items-center rounded-dialog border border-border-neutral bg-white pt-17.75 text-center">
          <Character name="sit" className="-translate-x-1.25" />
          <h1 className="mt-11.25 text-headline font-bold">
            오늘의 일기를 완성했어요!
          </h1>
          <p className="mt-3.5 text-body-sm font-medium text-muted">
            내 마음을 들여다보는 멋진 시간이었어요.
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
