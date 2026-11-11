import { useMemo, useState } from "react";
import { DiaryContext } from "@/contexts/diary";

const INITIAL = {
  emotion: null, // JOY | SADNESS | ANGER | FEAR | SURPRISE | SHAME
  inputType: null, // VOICE | TEXT
  content: "",
  // 질문 흐름 진행 상태 — 본문이 바뀌면 null로 되돌려 처음부터 다시 시작
  // { flowId, questionVersion, question: {order,type,content,isFallback}|null, completed }
  flow: null,
  // 답한 질문·답변: { order, type, content(질문), answer } — 서버 응답의 questions 그대로
  answers: [],
};

// 일기 작성 중 데이터 — 감정·방식·본문·질문 흐름·질문/답변을 페이지 간에 공유
// 서버 저장은 C13 완료하기에서 한 번만 하고, 실패해도 여기 값은 그대로 남아 다시 시도할 수 있다
function DiaryProvider({ children }) {
  const [state, setState] = useState(INITIAL);

  const value = useMemo(() => {
    const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

    return {
      ...state,
      update,
      reset: () => setState(INITIAL),
    };
  }, [state]);

  return (
    <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>
  );
}

export default DiaryProvider;
