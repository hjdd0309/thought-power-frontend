import { Link } from "react-router-dom";
import settingIcon from "@/assets/icons/setting.svg";
import Character from "@/components/Character";

// B01 홈 — 캐릭터·일기 작성 안내, 우측 상단 설정 이동
function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mt-16.5 flex items-center justify-between px-5">
        <h1 className="font-logo text-[30px] leading-[1.2] text-ink">
          생각의힘
        </h1>
        <Link to="/settings" aria-label="설정" className="size-8">
          <img src={settingIcon} alt="" width={32} height={32} />
        </Link>
      </header>

      <Link
        to="/diary/emotion"
        className="mx-10 mt-21 flex h-28 flex-col items-center justify-center gap-1.5 rounded-dialog bg-yellow-light text-center"
      >
        <p className="text-lead font-medium text-ink">
          오늘의 일기를 써볼까요?
        </p>
        <p className="text-body font-medium text-muted">
          어떤 하루를 보냈나요?
        </p>
      </Link>

      <Character name="sit" className="mt-11.75" />
    </main>
  );
}

export default HomePage;
