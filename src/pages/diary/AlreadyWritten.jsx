import { useNavigate } from "react-router-dom";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import Character from "@/components/Character";
import TopBar from "@/components/TopBar";

// 하루 1개 제한 안내 — Figma에 없는 화면이라 C14 작성 완료 화면 구성을 최소한으로 재사용
// diaryId를 알면 해당 일기 상세로, 모르면(완료 저장 409) 보관함으로 이동
function AlreadyWritten({ diaryId, onLeave }) {
  const navigate = useNavigate();

  const go = (to) => {
    onLeave?.();
    navigate(to, { replace: true });
  };

  return (
    <>
      <TopBar onBack={() => go("/home")} />
      <main className="px-5 pt-13">
        <section className="flex flex-col items-center rounded-dialog border border-border-neutral bg-white py-17.75 text-center">
          <Character name="sit" className="-translate-x-1.25" />
          <h1 className="mt-11.25 text-headline font-bold">
            오늘은 이미 일기를 썼어요
          </h1>
          <p className="mt-3.5 text-body-sm font-medium text-muted">
            일기는 하루에 하나만 쓸 수 있어요.
          </p>
        </section>
      </main>
      <BottomAction className="items-center gap-3.5">
        <Button
          onClick={() => go(diaryId ? `/archive/${diaryId}` : "/archive")}
        >
          보관함에서 보기
        </Button>
      </BottomAction>
    </>
  );
}

export default AlreadyWritten;
