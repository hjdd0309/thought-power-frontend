import { getSubscription } from "@/api/settings";
import ErrorRetry from "@/components/ErrorRetry";
import LoadingState from "@/components/LoadingState";
import TopBar from "@/components/TopBar";
import useRequest from "@/hooks/useRequest";

// F04 구독 관리 — 현재 플랜·결제 상태·다음 결제일/결제 수단 표시 (실제 결제 동작 없음)
function SubscriptionPage() {
  const {
    data: items,
    loading,
    error,
    retry,
  } = useRequest(() => getSubscription(), []);

  return (
    <>
      <TopBar title="구독 관리" />
      {loading && <LoadingState className="mt-16" />}
      {error && (
        <ErrorRetry
          className="mt-16"
          message="구독 정보를 불러오지 못했어요."
          onRetry={retry}
        />
      )}
      {items && (
        <main className="flex flex-col px-5 pt-20.5">
          {items.map((item, i) => (
            <section
              key={item.title}
              className={`flex flex-col justify-center gap-3 rounded-card px-6.5 ${
                i === 0 ? "h-27.5 bg-yellow-light" : "h-25 bg-white"
              } ${i === 1 ? "mt-4" : ""} ${i === 2 ? "mt-6.5" : ""}`}
            >
              <p className="text-body font-bold text-ink">{item.title}</p>
              <p className="text-body-sm font-medium text-muted">
                {item.value}
              </p>
            </section>
          ))}
        </main>
      )}
    </>
  );
}

export default SubscriptionPage;
