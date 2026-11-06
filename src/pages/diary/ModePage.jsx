import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { createDiaryDraft } from "@/api/diary";
import micIcon from "@/assets/icons/mic.svg";
import pencilIcon from "@/assets/icons/pencil.svg";
import Character from "@/components/Character";
import ErrorRetry from "@/components/ErrorRetry";
import SelectCard from "@/components/SelectCard";
import TopBar from "@/components/TopBar";
import { INPUT_TYPES } from "@/constants/diary";
import { useDiary } from "@/contexts/diary";

const MODES = [
  { type: INPUT_TYPES.VOICE, label: "말로 쓰기", icon: micIcon, size: 40 },
  { type: INPUT_TYPES.TEXT, label: "글로 쓰기", icon: pencilIcon, size: 32 },
];

// 선택 강조를 잠깐 보여준 뒤 이동
const SELECT_FEEDBACK_MS = 250;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// B04 선택 전 / B05_0 말로 쓰기 / B05_1 글로 쓰기 — 선택 시 초안 생성 후 작성 화면 이동
function ModePage() {
  const navigate = useNavigate();
  const { emotion, update } = useDiary();
  const [selected, setSelected] = useState(null);
  const [failed, setFailed] = useState(false);

  const handleSelect = async (inputType) => {
    if (selected) return;
    setSelected(inputType);
    setFailed(false);
    try {
      const [draft] = await Promise.all([
        createDiaryDraft({ emotion, inputType }),
        wait(SELECT_FEEDBACK_MS),
      ]);
      update({ diaryId: draft.diaryId, inputType, content: "", answers: [] });
      navigate("/diary/write");
    } catch {
      // 실패하면 선택을 풀고 안내 — 카드를 다시 누르면 재시도
      setSelected(null);
      setFailed(true);
    }
  };

  if (!emotion) return <Navigate to="/diary/emotion" replace />;

  return (
    <>
      <TopBar onBack={() => navigate("/diary/emotion")} />
      <main className="flex flex-col px-5">
        <h1 className="mt-9 text-headline font-bold">
          어떤 방법으로
          <br />
          일기를 쓸까요?
        </h1>
        <Character name="note" size={230} height={255} className="mt-10.25" />
        <div className="mt-7.5 grid grid-cols-2 gap-3.5">
          {MODES.map((m) => (
            <SelectCard
              key={m.type}
              rounded="rounded-card"
              selected={selected === m.type}
              disabled={Boolean(selected)}
              onClick={() => handleSelect(m.type)}
              className="h-47.5 flex-col justify-start gap-3.25 pt-13.75 text-lead font-bold"
            >
              <span className="flex size-10 items-center justify-center">
                <img src={m.icon} alt="" width={m.size} height={m.size} />
              </span>
              {m.label}
            </SelectCard>
          ))}
        </div>
        {failed && (
          <ErrorRetry
            inline
            className="mt-4"
            message="일기를 시작하지 못했어요. 다시 눌러 주세요."
          />
        )}
      </main>
    </>
  );
}

export default ModePage;
