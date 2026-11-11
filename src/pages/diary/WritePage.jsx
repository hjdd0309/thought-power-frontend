import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
import VoiceActions from "@/pages/diary/VoiceActions";

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
function VoiceWrite({ onSubmit, onSwitchToText }) {
  const recorder = useVoiceRecorder({
    mockTranscript: MOCK_TRANSCRIPTS.content,
  });
  const [draft, setDraft] = useState(null);

  // 정지 시 최종 인식 텍스트를 수정·확인(C03)으로 넘긴다. 비어 있으면 안내만 표시
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
        <TopBar onBack={() => setDraft(null)} />
        <TranscriptConfirm
          value={draft}
          onChange={setDraft}
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
          <VoiceRecorder recorder={recorder} onToggle={toggle} />
        </div>
      </main>
      <VoiceActions
        recorder={recorder}
        onToggle={toggle}
        onSwitchToText={onSwitchToText}
      />
    </>
  );
}

// 글로 쓰기: D01 직접 입력 후 바로 질문 1로 이동 (텍스트 확인 단계 없음)
function TextWrite({ initial, onSubmit }) {
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
        <Button disabled={!text.trim()} onClick={() => onSubmit(text.trim())}>
          다음으로
        </Button>
      </BottomAction>
    </>
  );
}

// /diary/write — 작성 방식에 따라 C01~C03 또는 D01
function WritePage() {
  const navigate = useNavigate();
  const { inputType, content, update } = useDiary();

  // 본문은 Context에만 담고 바로 질문 1로 이동 (저장은 C13 완료 시 한 번에)
  // 본문을 다시 확인하면 질문 흐름은 처음부터 새로 시작한다
  const handleSubmit = (value) => {
    update({ content: value, flow: null, answers: [] });
    navigate("/diary/question/1");
  };

  if (!inputType) return <Navigate to="/diary/emotion" replace />;

  return inputType === INPUT_TYPES.TEXT ? (
    <TextWrite initial={content} onSubmit={handleSubmit} />
  ) : (
    <VoiceWrite
      onSubmit={handleSubmit}
      // 글로 쓰기로 바꾸면 완료 저장 때 최종 작성 방식(TEXT)만 보낸다
      onSwitchToText={() => update({ inputType: INPUT_TYPES.TEXT })}
    />
  );
}

export default WritePage;
