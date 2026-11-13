import { useNavigate } from "react-router-dom";
import backIcon from "@/assets/icons/back.svg";

// 상단 헤더: 뒤로가기(40×40, 좌 12px · 상 12px — Figma 상태바 54px는 웹에선 브라우저 영역이라 제외) + 가운데(진행률·제목) + 우측 영역
// 제목 헤더는 좌우 대칭(12px)으로 가운데 정렬, 진행률 헤더는 우측 28px (진행 표시 322px)
function TopBar({ onBack, title, right, children }) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header
      className={`mt-3 flex h-10 shrink-0 items-center pl-3 ${title ? "pr-3" : "pr-7"}`}
    >
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={handleBack}
        className="flex size-10 shrink-0 items-center justify-center"
      >
        <img src={backIcon} alt="" width={22} height={22} />
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-center">
        {title ? (
          <h1 className="truncate text-lead font-bold">{title}</h1>
        ) : (
          children
        )}
      </div>
      {right ?? (title ? <span className="size-10 shrink-0" /> : null)}
    </header>
  );
}

export default TopBar;
