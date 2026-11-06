import { useEffect, useState } from "react";
import { getSubscription } from "@/api/settings";
import TopBar from "@/components/TopBar";

// F04 구독 관리 — 현재 플랜·결제 상태·다음 결제일/결제 수단 표시 (실제 결제 동작 없음)
function SubscriptionPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ignore = false;
    getSubscription().then((list) => {
      if (!ignore) setItems(list);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <TopBar title="구독 관리" />
      <main className="flex flex-col px-5 pt-20.5">
        {items.map((item, i) => (
          <section
            key={item.title}
            className={`flex flex-col justify-center gap-3 rounded-card px-6.5 ${
              i === 0 ? "h-27.5 bg-yellow-light" : "h-25 bg-white"
            } ${i === 1 ? "mt-4" : ""} ${i === 2 ? "mt-6.5" : ""}`}
          >
            <p className="text-body font-bold text-ink">{item.title}</p>
            <p className="text-body-sm font-medium text-muted">{item.value}</p>
          </section>
        ))}
      </main>
    </>
  );
}

export default SubscriptionPage;
