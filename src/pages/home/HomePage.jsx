import { Link } from "react-router-dom";
import settingIcon from "@/assets/icons/setting.svg";
import Character from "@/components/Character";
import useRequest from "@/hooks/useRequest";
import { getDiaryStats } from "@/utils/diaryStats";

// 캐릭터 아래 한 줄 — 연속 기록이 없으면 스티커 수만, 조회 중·실패면 숨김
function DiaryStats() {
  const { data } = useRequest(getDiaryStats);
  if (!data) return <p className="mt-5 min-h-5" />;
  const parts = [];
  if (data.streak > 0) parts.push(`${data.streak}일째 일기 쓰는 중`);
  parts.push(`이번 달 스티커 ${data.monthStickers}개`);
  return (
    <p className="mt-5 min-h-5 animate-fade-in-delayed text-center text-body-sm font-medium text-muted">
      {parts.join(" · ")}
    </p>
  );
}

// B01 홈 — 캐릭터·일기 작성 안내·기록 현황, 우측 상단 설정 이동
function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mt-6 flex items-center justify-between px-5">
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

      <Character name="sit" className="mt-11.75 motion-safe:animate-float" />
      <DiaryStats />
    </main>
  );
}

export default HomePage;
