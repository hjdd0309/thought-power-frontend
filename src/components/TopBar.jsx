import { useNavigate } from "react-router-dom";
import backIcon from "@/assets/icons/back.svg";

// 상단 헤더: 뒤로가기(40×40, 좌 12px · 상 54px) + 가운데(진행률·제목) + 우측 영역
function TopBar({ onBack, title, right, children }) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header className="mt-13.5 flex h-10 shrink-0 items-center pr-7 pl-3">
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
