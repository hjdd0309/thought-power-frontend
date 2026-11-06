import { useEffect, useState } from "react";
import { getSupportItems } from "@/api/settings";
import SettingRow from "@/components/SettingRow";
import TopBar from "@/components/TopBar";

// F07 고객센터 — 자주 묻는 질문·문의하기 (이동 후 화면은 기획에 없음)
function SupportPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ignore = false;
    getSupportItems().then((list) => {
      if (!ignore) setItems(list);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <TopBar title="고객센터" />
      <main className="flex flex-col px-5 pt-9">
        <h1 className="text-headline font-bold">무엇을 도와드릴까요?</h1>
        <ul className="mt-9.5">
          {items.map((item) => (
            <li key={item.key}>
              {/* TODO: 자주 묻는 질문·문의하기 이동 화면/링크 확정 후 연결 */}
              <SettingRow onClick={() => {}}>{item.label}</SettingRow>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

export default SupportPage;
