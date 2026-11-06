import { useEffect, useState } from "react";
import { getTerms } from "@/api/settings";
import TopBar from "@/components/TopBar";

// F06 이용약관 조회 — 서비스 이용약관 본문
function TermsPage() {
  const [terms, setTerms] = useState(null);

  useEffect(() => {
    let ignore = false;
    getTerms().then((t) => {
      if (!ignore) setTerms(t);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <TopBar title="이용약관" />
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
