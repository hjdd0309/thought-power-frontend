import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import archiveIcon from "@/assets/icons/archive.svg";
import homeIcon from "@/assets/icons/home.svg";
import plusIcon from "@/assets/icons/plus.svg";

// 하단 메뉴 · 활성 확대 — 활성 원 60px/아이콘 30px, 비활성 원 48px/아이콘 24px. + → 홈 → 보관함
const ITEMS = [
  { to: "/diary/emotion", label: "일기 쓰기", icon: plusIcon },
  { to: "/home", label: "홈", icon: homeIcon },
  {
    to: "/archive",
    label: "보관함",
    icon: archiveIcon,
    match: ["/archive", "/report"],
  },
];

function BottomNav() {
  const { pathname } = useLocation();
  // 누르는 동안 해당 메뉴만 활성으로 보여준다 (B01 · 일기 쓰기 활성 피드백)
  const [pressed, setPressed] = useState(null);

  return (
    <nav className="sticky bottom-0 z-30 box-content flex h-24 shrink-0 items-center justify-center gap-7 bg-white pb-7.5">
      {ITEMS.map((item) => {
        const matched = (item.match ?? [item.to]).some((p) =>
          pathname.startsWith(p),
        );
        const isActive = pressed ? pressed === item.to : matched;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onPointerDown={() => setPressed(item.to)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            className="flex h-21 w-18 flex-col items-center gap-0.5"
          >
            <span className="flex h-16 w-18 items-center justify-center">
              <span
                className={`flex items-center justify-center rounded-full transition-all ${
                  isActive ? "size-15 bg-yellow" : "size-12 bg-border-neutral"
                }`}
              >
                <img
                  src={item.icon}
                  alt=""
                  className={`transition-all ${isActive ? "size-7.5" : "size-6"}`}
                />
              </span>
            </span>
            <span className="text-label font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default BottomNav;
