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
  getQuestionStep,
} from "@/constants/diary";
import { useDiary } from "@/contexts/diary";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";
import { MOCK_TRANSCRIPTS } from "@/mocks/questions";
import TranscriptConfirm from "@/pages/diary/TranscriptConfirm";

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
function VoiceAnswer({ order, step, question, initial, onSubmit, saving }) {
  const recorder = useVoiceRecorder({
    mockTranscript: MOCK_TRANSCRIPTS[order],
  });
  const [draft, setDraft] = useState(initial ?? null);

  const toggle = async () => {
    if (recorder.isRecording) setDraft(await recorder.stop());
    else recorder.start();
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
        <section className="h-142 rounded-dialog border border-border-neutral bg-white">
          <QuestionHeading label={step.label} content={question?.content} />
          <div className="mt-26.5">
            <VoiceRecorder
              isRecording={recorder.isRecording}
              seconds={recorder.seconds}
              onToggle={toggle}
            />
          </div>
        </section>
      </main>
      <BottomAction>
        <Button disabled={!question} onClick={toggle}>
          {recorder.isRecording ? "녹음 완료" : "녹음 시작"}
        </Button>
      </BottomAction>
    </>
  );
}

const TEXT_PLACEHOLDER = {
  1: "내 마음을 적어보세요.",
  2: "내 생각을 적어보세요.",
  3: "내 생각을 적어보세요.",
};

// 글로 답하기: D03~D05 — 입력 후 바로 다음 질문으로
function TextAnswer({ order, step, question, initial, onSubmit, saving }) {
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

// /diary/question/:order — 질문 1~3 (진행률 n/3)
function QuestionPage({ order }) {
  const navigate = useNavigate();
  const { diaryId, inputType, content, getQnA, setQnA } = useDiary();
  const step = getQuestionStep(order);
  const qna = getQnA(order);
  const [saving, setSaving] = useState(false);

  // 질문이 아직 없으면 생성 요청 (이전 답변을 반영한 질문은 서버/AI 담당)
  useEffect(() => {
    if (!diaryId || qna?.content) return;
    let ignore = false;
    getQuestion(diaryId, order).then((q) => {
      if (!ignore) setQnA(q);
    });
    return () => {
      ignore = true;
    };
    // 질문 요청은 order 기준으로 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaryId, order]);

  if (!inputType || !content) return <Navigate to="/diary/write" replace />;
  if (!step) return <Navigate to="/diary/question/1" replace />;

  const handleSubmit = async (answer) => {
    setSaving(true);
    try {
      await saveAnswer(diaryId, { order, answer });
      setQnA({ order, type: step.type, answer });
      navigate(
        order < QUESTION_COUNT
          ? `/diary/question/${order + 1}`
          : "/diary/review",
      );
    } finally {
      setSaving(false);
    }
  };

  const props = {
    order,
    step,
    question: qna?.content ? qna : null,
    initial: qna?.answer,
    onSubmit: handleSubmit,
    saving,
  };

  return inputType === INPUT_TYPES.TEXT ? (
    <TextAnswer {...props} />
  ) : (
    <VoiceAnswer {...props} />
  );
}

// order가 바뀌면 녹음·입력 상태를 새로 시작하도록 key로 분리
function QuestionRoute() {
  const { order } = useParams();
  const n = Number(order);
  return <QuestionPage key={n} order={n} />;
}

export default QuestionRoute;
