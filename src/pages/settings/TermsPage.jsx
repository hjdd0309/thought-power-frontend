import { getTerms } from "@/api/settings";
import ErrorRetry from "@/components/ErrorRetry";
import LoadingState from "@/components/LoadingState";
import TopBar from "@/components/TopBar";
import useRequest from "@/hooks/useRequest";

// F06 이용약관 조회 — 서비스 이용약관 본문
function TermsPage() {
  const {
    data: terms,
    loading,
    error,
    retry,
  } = useRequest(() => getTerms(), []);

  return (
    <>
      <TopBar title="이용약관" />
      {loading && <LoadingState className="mt-16" />}
      {error && (
        <ErrorRetry
          className="mt-16"
          message="이용약관을 불러오지 못했어요."
          onRetry={retry}
        />
      )}
      {terms && (
        <main className="flex flex-col px-5 pt-9 pb-12">
          <h1 className="text-headline font-bold">{terms.title}</h1>
          <p className="mt-5.5 text-label font-medium text-muted">
            {terms.notice}
          </p>
          {terms.articles.map((a) => (
            <section key={a.title} className="mt-5.5 flex flex-col gap-4">
              <h2 className="text-body font-bold">{a.title}</h2>
              <p className="text-body-sm leading-[1.45] font-medium text-muted">
                {a.content}
              </p>
            </section>
          ))}
        </main>
      )}
    </>
  );
}

export default TermsPage;
