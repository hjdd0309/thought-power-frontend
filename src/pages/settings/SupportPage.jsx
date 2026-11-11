import { getSupportItems } from "@/api/settings";
import ErrorRetry from "@/components/ErrorRetry";
import SettingRow from "@/components/SettingRow";
import TopBar from "@/components/TopBar";
import useRequest from "@/hooks/useRequest";

// F07 고객센터 — 자주 묻는 질문·문의하기 (이동 후 화면은 기획에 없음)
function SupportPage() {
  const { data: items, error, retry } = useRequest(() => getSupportItems(), []);

  return (
    <>
      <TopBar title="고객센터" />
      <main className="flex flex-col px-5 pt-9">
        <h1 className="text-headline font-bold">무엇을 도와드릴까요?</h1>
        {error && (
          <ErrorRetry
            compact
            className="mt-9.5"
            message="고객센터 정보를 불러오지 못했어요."
            onRetry={retry}
          />
        )}
        <ul className="mt-9.5">
          {(items ?? []).map((item) => (
            <li key={item.key}>
              {/* 문의하기는 서버 inquiryUrl이 있을 때만 새 창으로 연결
                  TODO: 자주 묻는 질문 이동 화면 확정 후 연결 */}
              <SettingRow
                onClick={() => {
                  if (item.url) window.open(item.url, "_blank", "noopener");
                }}
              >
                {item.label}
              </SettingRow>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

export default SupportPage;
