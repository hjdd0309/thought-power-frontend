import { useCallback, useEffect, useState } from "react";

/**
 * 화면 진입 시 조회 요청 — { data, loading, error, retry }
 * deps가 바뀌거나 retry()를 부르면 다시 요청한다. 이전 요청 결과는 무시한다.
 */
export default function useRequest(fetcher, deps = []) {
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([...deps, attempt]);
  const [result, setResult] = useState({
    key: null,
    data: undefined,
    error: null,
  });

  useEffect(() => {
    let ignore = false;
    fetcher().then(
      (data) => !ignore && setResult({ key, data, error: null }),
      (error) => !ignore && setResult({ key, data: undefined, error }),
    );
    return () => {
      ignore = true;
    };
    // fetcher는 매 렌더 새로 만들어지므로 deps(key) 기준으로만 다시 요청
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const loading = result.key !== key;

  return {
    data: loading ? undefined : result.data,
    error: loading ? null : result.error,
    loading,
    retry,
  };
}
