import { useRef, useState } from "react";

/**
 * 저장·전송 요청 — 처리 중 중복 클릭을 막는다. { run, pending, error, clearError }
 * run()은 성공 시 fn의 결과, 실패 시 undefined를 돌려주고 error에 담는다.
 */
export default function useSubmit(fn) {
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const run = async (...args) => {
    if (busy.current) return undefined;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      return await fn(...args);
    } catch (e) {
      setError(e);
      return undefined;
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return { run, pending, error, clearError: () => setError(null) };
}
