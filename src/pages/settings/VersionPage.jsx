import { getVersion } from "@/api/settings";
import ErrorRetry from "@/components/ErrorRetry";
import TopBar from "@/components/TopBar";
import useRequest from "@/hooks/useRequest";

// F08 버전 정보 — 서비스 로고·앱 버전
function VersionPage() {
  const { data, error, retry } = useRequest(() => getVersion(), []);

  return (
    <>
      <TopBar title="버전 정보" />
      <main className="flex flex-1 flex-col items-center justify-center pb-14 text-center">
        <h1 className="font-logo text-[56px] leading-[1.2] text-yellow">
          생각의힘
        </h1>
        {error ? (
          <ErrorRetry
            compact
            className="mt-7.75 w-full"
            message="버전 정보를 불러오지 못했어요."
            onRetry={retry}
          />
        ) : (
          <p className="mt-7.75 min-h-5.25 text-body font-medium text-muted">
            {data && `앱 버전 ${data.version}`}
          </p>
        )}
      </main>
    </>
  );
}

export default VersionPage;
