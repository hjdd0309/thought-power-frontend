import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { saveDiaryContent } from "@/api/diary";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import Character from "@/components/Character";
import TopBar from "@/components/TopBar";
import VoiceRecorder from "@/components/VoiceRecorder";
import { INPUT_TYPES, TEXT_MAX_LENGTH } from "@/constants/diary";
import { useDiary } from "@/contexts/diary";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";
import { MOCK_TRANSCRIPTS } from "@/mocks/questions";
import TranscriptConfirm from "@/pages/diary/TranscriptConfirm";

function Title() {
  return (
    <h1 className="mt-8 text-headline font-bold">
      오늘 어떤 일이
      <br />
      있었나요?
    </h1>
  );
}

// 말로 쓰기: C01 녹음 전 → C02 녹음 중 → C03 텍스트 수정·확인
function VoiceWrite({ onSubmit, saving }) {
  const recorder = useVoiceRecorder({
    mockTranscript: MOCK_TRANSCRIPTS.content,
  });
  const [draft, setDraft] = useState(null);

  const toggle = async () => {
    if (recorder.isRecording) setDraft(await recorder.stop());
    else recorder.start();
  };

  if (draft !== null) {
    return (
      <>
        <TopBar onBack={() => setDraft(null)} />
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
      <TopBar />
      <main className="flex flex-col px-5">
        <Title />
        <Character name="note" size={170} height={180} className="mt-14" />
        <div className="mt-6.75">
          <VoiceRecorder
            isRecording={recorder.isRecording}
            seconds={recorder.seconds}
            onToggle={toggle}
          />
        </div>
      </main>
      <BottomAction>
        <Button onClick={toggle}>
          {recorder.isRecording ? "녹음 완료" : "녹음 시작"}
        </Button>
      </BottomAction>
    </>
  );
}

// 글로 쓰기: D01 직접 입력 후 바로 질문 1로 이동 (텍스트 확인 단계 없음)
function TextWrite({ initial, onSubmit, saving }) {
  const [text, setText] = useState(initial);

  return (
    <>
      <TopBar />
      <main className="flex flex-col px-5">
        <Title />
        <textarea
          value={text}
          maxLength={TEXT_MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          placeholder="오늘 있었던 일을 자유롭게 적어보세요."
          aria-label="오늘 있었던 일"
          className="mt-12.5 h-101 w-full resize-none rounded-card border border-border-neutral bg-white px-5 pt-5 text-[20px] leading-[1.2] font-medium text-ink outline-none placeholder:text-muted focus:border-yellow"
        />
        <p className="mt-4.5 text-right text-label font-medium text-muted">
          {text.length} / {TEXT_MAX_LENGTH}
        </p>
      </main>
      <BottomAction>
        <Button
          disabled={!text.trim() || saving}
          onClick={() => onSubmit(text.trim())}
        >
          다음으로
        </Button>
      </BottomAction>
    </>
  );
}

// /diary/write — 작성 방식에 따라 C01~C03 또는 D01
function WritePage() {
  const navigate = useNavigate();
  const { diaryId, inputType, content, update } = useDiary();
  const [saving, setSaving] = useState(false);

  if (!inputType) return <Navigate to="/diary/emotion" replace />;

  const handleSubmit = async (value) => {
    setSaving(true);
    try {
      await saveDiaryContent(diaryId, value);
      update({ content: value });
      navigate("/diary/question/1");
    } finally {
      setSaving(false);
    }
  };

  return inputType === INPUT_TYPES.TEXT ? (
    <TextWrite initial={content} onSubmit={handleSubmit} saving={saving} />
  ) : (
    <VoiceWrite onSubmit={handleSubmit} saving={saving} />
  );
}

export default WritePage;
