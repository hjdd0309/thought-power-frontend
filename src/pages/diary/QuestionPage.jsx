import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { QUESTION_FLOW_ACTIONS } from "@/api/questionFlow";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import EmotionCharacter from "@/components/EmotionCharacter";
import ErrorRetry from "@/components/ErrorRetry";
import { LoadingDots } from "@/components/LoadingState";
import ProgressBar from "@/components/ProgressBar";
import TopBar from "@/components/TopBar";
import VoiceRecorder from "@/components/VoiceRecorder";
import {
  INPUT_TYPES,
  QUESTION_COUNT,
  getQuestionStep,
} from "@/constants/diary";
import { useDiary } from "@/contexts/diary";
import useQuestionFlow from "@/hooks/useQuestionFlow";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";
import { MOCK_TRANSCRIPTS } from "@/mocks/questions";
import TranscriptConfirm from "@/pages/diary/TranscriptConfirm";
import QuestionHelp from "@/pages/diary/QuestionHelp";
import VoiceActions from "@/pages/diary/VoiceActions";

const EMPTY_HINT = "생각이 안 나면 비워 둬도 괜찮아요";
const SUBMIT_ERROR = "답변을 보내지 못했어요. 다시 눌러 주세요.";

// 질문 흐름 안내(예: 만료로 처음부터 다시 시작) — 질문 카드 위 한 줄
function FlowNotice({ message }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="mb-3 text-center text-body-sm font-medium text-muted"
    >
      {message}
    </p>
  );
}

// 질문 카드 상단: 질문 유형 + (오늘 고른 감정 캐릭터가 묻는) 질문 문구 + 잘 모르겠어요
function QuestionHeading({ label, content, emotion, type, top = "pt-7.75" }) {
  return (
    <div className={`px-5.75 ${top}`}>
      <p className="text-body-sm font-medium text-muted">{label}</p>
      <div className="mt-6 flex items-start gap-3">
        <EmotionCharacter
          emotion={emotion}
          size={52}
          className="mt-0.5 motion-safe:animate-float"
        />
        <h1 className="min-h-15.5 min-w-0 flex-1 text-headline font-bold break-keep">
          {content}
        </h1>
      </div>
      <QuestionHelp key={type} type={type} className="mt-4" />
    </div>
  );
}

// 말로 답하기: 녹음 전(C04/C07/C10) → 녹음 중(C05/C08/C11) → 수정·확인(C06/C09/C12)
function VoiceAnswer({
  question,
  step,
  emotion,
  initial,
  notice,
  error,
  onSubmit,
  onSwitchToText,
}) {
  const { order } = question;
  const recorder = useVoiceRecorder({
    mockTranscript: MOCK_TRANSCRIPTS[order],
  });
  const [draft, setDraft] = useState(initial ?? null);

  // 정지 시 인식 텍스트를 수정·확인(C06/C09/C12)으로 넘긴다. 비어 있어도 확인 화면으로(빈 답변 허용)
  const toggle = async () => {
    if (recorder.isRecording) {
      const text = await recorder.stop();
      setDraft(text ?? "");
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
          onRetry={() => {
            setDraft(null);
            recorder.reset();
          }}
          onConfirm={() => onSubmit(draft.trim())}
          allowEmpty
          hint={EMPTY_HINT}
          error={error}
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
        <FlowNotice message={notice} />
        <section className="min-h-142 rounded-dialog border border-border-neutral bg-white pb-6">
          <QuestionHeading
            label={step.label}
            content={question.content}
            emotion={emotion}
            type={question.type ?? step.type}
          />
          <div className="mt-14">
            <VoiceRecorder recorder={recorder} onToggle={toggle} />
          </div>
        </section>
      </main>
      <VoiceActions
        recorder={recorder}
        onToggle={toggle}
        onSwitchToText={onSwitchToText}
      />
    </>
  );
}

const TEXT_PLACEHOLDER = {
  1: "내 마음을 적어보세요.",
  2: "내 생각을 적어보세요.",
  3: "내 생각을 적어보세요.",
};

// 질문 대기 — 질문 카드 자리에서 감정 캐릭터가 "음… 생각 중이야" 하며 흔들리는 연출
// (첫 질문 · 답변 전송 후 다음 질문)
function QuestionLoading({ order, inputType, emotion }) {
  const step = getQuestionStep(order);
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
            {step?.label}
          </p>
          <div
            role="status"
            aria-live="polite"
            className="my-auto flex animate-fade-in-delayed flex-col items-center gap-4 py-8 text-center"
          >
            <p className="relative rounded-bubble bg-yellow-light px-5 py-3 text-lead font-bold">
              음… 생각 중이야
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-1/2 size-3.5 -translate-x-1/2 rotate-45 bg-yellow-light"
              />
            </p>
            <div className="origin-bottom motion-safe:animate-think">
              <EmotionCharacter emotion={emotion} size={140} />
            </div>
            <LoadingDots />
            <p className="text-body-sm font-medium text-muted">
              생각의힘이 질문을 생각하고 있어요
            </p>
          </div>
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

// 글로 답하기: D03~D05 — 비어 있어도 다음으로 진행 가능
function TextAnswer({
  question,
  step,
  emotion,
  initial,
  notice,
  error,
  onSubmit,
}) {
  const { order } = question;
  const [text, setText] = useState(initial ?? "");
  const isLast = order === QUESTION_COUNT;

  return (
    <>
      <TopBar>
        <ProgressBar current={order} total={QUESTION_COUNT} />
      </TopBar>
      <main className="flex flex-col px-5 pt-10.75">
        <FlowNotice message={notice} />
        <section className="min-h-51 rounded-dialog border border-border-neutral bg-white pb-5">
          <QuestionHeading
            label={step.label}
            content={question.content}
            emotion={emotion}
            type={question.type ?? step.type}
            top="pt-7.25"
          />
        </section>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={TEXT_PLACEHOLDER[order]}
          aria-label="나의 답"
          className="mt-8 h-75 w-full resize-none rounded-bubble border border-border-neutral bg-white p-5 text-[20px] leading-[1.2] font-medium text-ink outline-none placeholder:text-muted focus:border-yellow"
        />
        <p className="mt-3 text-body-sm font-medium text-muted">{EMPTY_HINT}</p>
      </main>
      <BottomAction>
        {error && <ErrorRetry inline message={error} />}
        <Button onClick={() => onSubmit(text.trim())}>
          {isLast ? "완료하기" : "다음으로"}
        </Button>
      </BottomAction>
    </>
  );
}

// 첫 질문을 받지 못함 — 다시 시도
function QuestionStartError({ onRetry }) {
  return (
    <>
      <TopBar>
        <ProgressBar current={1} total={QUESTION_COUNT} />
      </TopBar>
      <main className="px-5 pt-10.5">
        <ErrorRetry
          message={"질문을 불러오지 못했어요.\n다시 시도해 주세요."}
          onRetry={onRetry}
        />
      </main>
    </>
  );
}

// /diary/question/:order — 질문 1~3 (진행률 question.order / 3)
// 화면은 URL 순서가 아니라 질문 흐름의 현재 question 데이터로 그린다.
// URL은 현재 질문 순서를 따라가기만 하고(replace), 서버 흐름은 되돌릴 수 없으므로
// 뒤로가기는 본문 작성 화면으로 돌아간다(본문을 다시 확인하면 흐름을 새로 시작)
function QuestionRoute() {
  const { order: orderParam } = useParams();
  const navigate = useNavigate();
  const { emotion, inputType, content, update } = useDiary();
  const qf = useQuestionFlow();
  const { flow } = qf;

  const ready = Boolean(emotion && inputType && content);
  const needsStart = ready && !flow && !qf.pending && !qf.error;

  // 흐름이 없으면 첫 질문 시작 (중복 호출은 useQuestionFlow가 막는다)
  useEffect(() => {
    if (needsStart) qf.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsStart]);

  const handleSubmit = async (answer) => {
    const res = await qf.submit(answer);
    if (!res) return; // 실패: 같은 화면에서 다시 누르면 재시도
    if (res.action === QUESTION_FLOW_ACTIONS.COMPLETE) {
      navigate("/diary/review", { replace: true });
    } else {
      navigate(`/diary/question/${res.question.order}`, { replace: true });
    }
  };

  if (!emotion) return <Navigate to="/diary/emotion" replace />;
  if (!inputType || !content) return <Navigate to="/diary/write" replace />;
  if (flow?.completed) return <Navigate to="/diary/review" replace />;

  const question = flow?.question;
  if (!question) {
    return qf.error ? (
      <QuestionStartError onRetry={qf.start} />
    ) : (
      <QuestionLoading order={1} inputType={inputType} emotion={emotion} />
    );
  }

  const { order } = question;
  if (Number(orderParam) !== order) {
    return <Navigate to={`/diary/question/${order}`} replace />;
  }
  if (qf.pending) {
    return (
      <QuestionLoading order={order} inputType={inputType} emotion={emotion} />
    );
  }

  // RETRY(같은 order, 새 version)에도 녹음·입력 상태를 새로 시작
  const key = `${order}-${flow.questionVersion}`;
  const props = {
    question,
    step: getQuestionStep(order),
    emotion,
    initial: qf.error ? (qf.failedAnswer ?? undefined) : undefined,
    notice: qf.notice,
    error: qf.error ? SUBMIT_ERROR : null,
    onSubmit: handleSubmit,
  };

  return inputType === INPUT_TYPES.TEXT ? (
    <TextAnswer key={key} {...props} />
  ) : (
    <VoiceAnswer
      key={key}
      {...props}
      // 글로 쓰기로 바꾸면 완료 저장 때 최종 작성 방식(TEXT)만 보낸다
      onSwitchToText={() => update({ inputType: INPUT_TYPES.TEXT })}
    />
  );
}

export default QuestionRoute;
