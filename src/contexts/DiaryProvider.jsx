import { useMemo, useState } from "react";
import { DiaryContext } from "@/contexts/diary";

const INITIAL = {
  emotion: null, // JOY | SADNESS | ANGER | FEAR | SURPRISE | SHAME
  inputType: null, // VOICE | TEXT
  content: "",
  // 질문·답변 3쌍: { order, type, content(질문), answer }
  answers: [],
};

// 일기 작성 중 데이터 — 감정·방식·본문·질문/답변을 페이지 간에 공유
// 서버 저장은 C13 완료하기에서 한 번만 하고, 실패해도 여기 값은 그대로 남아 다시 시도할 수 있다
function DiaryProvider({ children }) {
  const [state, setState] = useState(INITIAL);

  const value = useMemo(() => {
    const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

    // 같은 order는 덮어쓴다 (다시 녹음·수정 대응)
    const setQnA = (qna) =>
      setState((prev) => ({
        ...prev,
        answers: [
          ...prev.answers.filter((a) => a.order !== qna.order),
          { ...prev.answers.find((a) => a.order === qna.order), ...qna },
        ].sort((a, b) => a.order - b.order),
      }));

    return {
      ...state,
      update,
      setQnA,
      getQnA: (order) => state.answers.find((a) => a.order === order),
      reset: () => setState(INITIAL),
    };
  }, [state]);

  return (
    <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>
  );
}

export default DiaryProvider;
