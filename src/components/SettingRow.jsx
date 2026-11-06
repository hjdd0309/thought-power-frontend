import { Link } from "react-router-dom";
import chevronIcon from "@/assets/icons/chevron-right.svg";

// 설정 행 (64px, 좌우 4px, 우측 화살표 18px) — to가 있으면 링크, 없으면 버튼
function SettingRow({ to, onClick, children }) {
  const className =
    "flex h-16 w-full items-center justify-between px-1 text-left text-body font-medium text-ink";
  const content = (
    <>
      <span>{children}</span>
      <img src={chevronIcon} alt="" width={18} height={18} />
    </>
  );
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default SettingRow;
