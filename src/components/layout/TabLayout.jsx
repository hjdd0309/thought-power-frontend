import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

// 하단 메뉴가 보이는 화면(홈·보관함·리포트)
function TabLayout() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}

export default TabLayout;
