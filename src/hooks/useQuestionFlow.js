import { useRef, useState } from "react";
import {
  QUESTION_FLOW_ACTIONS,
  isQuestionFlowExpired,
  startQuestionFlow,
  submitQuestionAnswer,
} from "@/api/questionFlow";
import { useDiary } from "@/contexts/diary";

export const FLOW_RESTART_NOTICE = "질문을 처음부터 다시 시작할게요";

/**
 * 질문 흐름 진행 — 흐름 데이터(flowId·questionVersion·question·answers)는 DiaryContext에 두고,
 * 요청 중·에러·안내 문구처럼 화면에만 필요한 상태는 여기서 관리한다.
 * { flow, pending, error, notice, failedAnswer, start, submit }
 * - start/submit은 처리 중 중복 호출을 막고, 성공 시 서버 응답을 돌려준다(실패 시 undefined)
 * - 410 QUESTION_FLOW_EXPIRED면 같은 감정·본문으로 흐름을 처음부터 다시 시작한다
 */
export default function useQuestionFlow() {
  const { emotion, content, flow, update } = useDiary();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  // 전송에 실패한 답변 — 다시 그린 답변 화면에 그대로 채워 다시 보낼 수 있게
  const [failedAnswer, setFailedAnswer] = useState(null);

  // 서버 응답을 Context에 반영. COMPLETE는 question이 null이라 order를 읽지 않는다
  const apply = (res) => {
    const completed = res.action === QUESTION_FLOW_ACTIONS.COMPLETE;
    update({
      flow: {
        flowId: res.flowId,
        questionVersion: res.questionVersion,
        question: completed ? null : res.question,
        completed,
      },
      answers: [...(res.questions ?? [])].sort((a, b) => a.order - b.order),
    });
    return res;
  };

  const restart = async () => {
    update({ flow: null, answers: [] });
    return apply(await startQuestionFlow({ emotion, content }));
  };

  const run = async (task) => {
    if (busy.current) return undefined;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      return await task();
    } catch (e) {
      setError(e);
      return undefined;
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  const start = () => run(restart);

  const submit = (answer) =>
    run(async () => {
      setNotice(null);
      setFailedAnswer(answer);
      try {
        const res = await submitQuestionAnswer(flow.flowId, {
          questionVersion: flow.questionVersion,
          answer,
        });
        setFailedAnswer(null);
        return apply(res);
      } catch (e) {
        if (!isQuestionFlowExpired(e)) throw e;
        // 만료: 본문은 그대로 두고 질문만 처음부터
        setFailedAnswer(null);
        setNotice(FLOW_RESTART_NOTICE);
        return restart();
      }
    });

  return { flow, pending, error, notice, failedAnswer, start, submit };
}
