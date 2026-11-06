import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getQuestion, saveAnswer } from "@/api/diary";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import TopBar from "@/components/TopBar";
import VoiceRecorder from "@/components/VoiceRecorder";
import {
  INPUT_TYPES,
  QUESTION_COUNT,
  getDefaultQuestion,
  getQuestionStep,
} from "@/constants/diary";
import { useDiary } from "@/contexts/diary";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";
import { MOCK_TRANSCRIPTS } from "@/mocks/questions";
import TranscriptConfirm from "@/pages/diary/TranscriptConfirm";
import VoiceActions from "@/pages/diary/VoiceActions";
import ErrorRetry from "@/components/ErrorRetry";
import LoadingState from "@/components/LoadingState";
import useSubmit from "@/hooks/useSubmit";

// 질문 카드 상단: 질문 유형 + 질문 문구
function QuestionHeading({ label, content, top = "pt-7.75" }) {
  return (
    <div className={`px-5.75 ${top}`}>
      <p className="text-body-sm font-medium text-muted">{label}</p>
      <h1 className="mt-8 min-h-15.5 text-headline font-bold break-keep">
        {content ?? "질문을 불러오고 있어요…"}
      </h1>
    </div>
  );
}

// 말로 답하기: 녹음 전(C04/C07/C10) → 녹음 중(C05/C08/C11) → 수정·확인(C06/C09/C12)
function VoiceAnswer({
  order,
  step,
  question,
  initial,
  onSubmit,
  saving,
  error,
  onSwitchToText,
}) {
  const recorder = useVoiceRecorder({
    mockTranscript: MOCK_TRANSCRIPTS[order],
  });
  const [draft, setDraft] = useState(initial ?? null);

  // 정지 시 최종 인식 텍스트를 수정·확인(C06/C09/C12)으로 넘긴다. 비어 있으면 안내만 표시
  const toggle = async () => {
    if (recorder.isRecording) {
      const text = await recorder.stop();
      if (text) setDraft(text);
    } else {
      recorder.start();
    }
  };

  if (draft !== null) {
    return (
      <>
        <TopBar onBack={() => setDraft(null)}>
          <ProgressBar current={order} total={QUESTION_COUNT} />
        </TopBar>
        <TranscriptConfirm
          value={draft}
          onChange={setDraft}
          saving={saving}
          error={error && SAVE_ERROR_MESSAGE}
          onRetry={() => {
            setDraft(null);
            recorder.reset();
          }}
          onConfirm={() => onSubmit(draft.trim())}
        />
      </>
    );
  }

  return (
    <>
      <TopBar>
        <ProgressBar current={order} total={QUESTION_COUNT} />
      </TopBar>
      <main className="px-5 pt-10.5">
        <section className="min-h-142 rounded-dialog border border-border-neutral bg-white pb-6">
          <QuestionHeading label={step.label} content={question?.content} />
          <div className="mt-26.5">
            <VoiceRecorder recorder={recorder} onToggle={toggle} />
          </div>
        </section>
      </main>
      <VoiceActions
        recorder={recorder}
        onToggle={toggle}
        onSwitchToText={onSwitchToText}
        disabled={!question}
      />
    </>
  );
}

const TEXT_PLACEHOLDER = {
  1: "내 마음을 적어보세요.",
  2: "내 생각을 적어보세요.",
  3: "내 생각을 적어보세요.",
};

// 질문 생성 대기 — 질문 카드 자리에서 캐릭터가 생각하는 연출
function QuestionLoading({ order, step, inputType }) {
  return (
    <>
      <TopBar>
        <ProgressBar current={order} total={QUESTION_COUNT} />
      </TopBar>
      <main className="px-5 pt-10.5">
        <section
          className={`flex flex-col rounded-dialog border border-border-neutral bg-white ${
            inputType === INPUT_TYPES.TEXT ? "h-134" : "h-142"
          }`}
        >
          <p className="px-5.75 pt-7.75 text-body-sm font-medium text-muted">
            {step.label}
          </p>
          <LoadingState
            className="my-auto"
            character="note"
            size={160}
            message="생각의힘이 질문을 생각하고 있어요"
          />
        </section>
      </main>
      <BottomAction>
        <Button disabled>
          {inputType === INPUT_TYPES.TEXT
            ? order === QUESTION_COUNT
              ? "완료하기"
              : "다음으로"
            : "녹음 시작"}
        </Button>
      </BottomAction>
    </>
  );
}

// 글로 답하기: D03~D05 — 입력 후 바로 다음 질문으로
function TextAnswer({
  order,
  step,
  question,
  initial,
  onSubmit,
  saving,
  error,
}) {
  const [text, setText] = useState(initial ?? "");
  const isLast = order === QUESTION_COUNT;

  return (
    <>
      <TopBar>
        <ProgressBar current={order} total={QUESTION_COUNT} />
      </TopBar>
      <main className="flex flex-col gap-8 px-5 pt-10.75">
        <section className="h-51 rounded-dialog border border-border-neutral bg-white">
          <QuestionHeading
            label={step.label}
            content={question?.content}
            top="pt-7.25"
          />
        </section>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={TEXT_PLACEHOLDER[order]}
          aria-label="나의 답"
          className="h-75 w-full resize-none rounded-bubble border border-border-neutral bg-white p-5 text-[20px] leading-[1.2] font-medium text-ink outline-none placeholder:text-muted focus:border-yellow"
        />
      </main>
      <BottomAction>
        {error && <ErrorRetry inline message={SAVE_ERROR_MESSAGE} />}
        <Button
          disabled={!question || !text.trim() || saving}
          onClick={() => onSubmit(text.trim())}
        >
          {isLast ? "완료하기" : "다음으로"}
        </Button>
      </BottomAction>
    </>
  );
}

const SAVE_ERROR_MESSAGE = "저장하지 못했어요. 다시 눌러 주세요.";

// /diary/question/:order — 질문 1~3 (진행률 n/3)
function QuestionPage({ order }) {
  const navigate = useNavigate();
  const {
    diaryId,
    emotion,
    inputType,
    content,
    answers,
    getQnA,
    setQnA,
    update,
  } = useDiary();
  const step = getQuestionStep(order);
  const qna = getQnA(order);

  // 질문이 아직 없으면 생성 요청 — 실패하면 순서별 기본 질문으로 대체하고 그대로 진행
  useEffect(() => {
    if (!step || qna?.content) return;
    let ignore = false;
    const previousAnswers = answers
      .filter((a) => a.order < order && a.answer)
      .map((a) => ({
        order: a.order,
        type: a.type,
        question: a.content,
        answer: a.answer,
      }));
    getQuestion({
      diaryId,
      emotion,
      content,
      order,
      type: step.type,
      previousAnswers,
    })
      .then((q) => (q?.content ? q : getDefaultQuestion(order)))
      .catch(() => getDefaultQuestion(order))
      .then((q) => {
        if (!ignore) setQnA(q);
      });
    return () => {
      ignore = true;
    };
    // 질문 요청은 order 기준으로 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const submit = useSubmit(async (answer) => {
    await saveAnswer(diaryId, { order, answer });
    setQnA({ order, type: step.type, answer });
    navigate(
      order < QUESTION_COUNT ? `/diary/question/${order + 1}` : "/diary/review",
    );
  });

  if (!inputType || !content) return <Navigate to="/diary/write" replace />;
  if (!step) return <Navigate to="/diary/question/1" replace />;
  if (!qna?.content) {
    return <QuestionLoading order={order} step={step} inputType={inputType} />;
  }

  const props = {
    order,
    step,
    question: qna,
    initial: qna.answer,
    onSubmit: submit.run,
    saving: submit.pending,
    error: submit.error,
  };

  return inputType === INPUT_TYPES.TEXT ? (
    <TextAnswer {...props} />
  ) : (
    <VoiceAnswer
      {...props}
      // TODO: 백엔드 연결 시 초안의 작성 방식(inputType)도 TEXT로 변경 요청
      onSwitchToText={() => update({ inputType: INPUT_TYPES.TEXT })}
    />
  );
}

// order가 바뀌면 녹음·입력 상태를 새로 시작하도록 key로 분리
function QuestionRoute() {
  const { order } = useParams();
  const n = Number(order);
  return <QuestionPage key={n} order={n} />;
}

export default QuestionRoute;
