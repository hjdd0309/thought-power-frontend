import { useState } from "react";
import { getQuestionHelp } from "@/constants/questionHelp";

const MODES = [
  { key: "hint", label: "힌트 보기" },
  { key: "easier", label: "쉽게 다시 물어보기" },
];

// 질문 아래 "잘 모르겠어요" — 누르면 힌트 보기 / 쉽게 다시 물어보기가 펼쳐진다
// 화면에 문구만 보여주고 녹음·답변·다음 질문 흐름에는 관여하지 않는다
function QuestionHelp({ type, className = "" }) {
  const help = getQuestionHelp(type);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null);
  if (!help) return null;

  return (
    <div className={`flex flex-col items-start gap-2.5 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setMode(null);
        }}
        className="flex h-9 items-center gap-1.5 rounded-full border border-border-neutral bg-white px-3.5 text-label font-medium text-muted"
      >
        <span
          aria-hidden="true"
          className="flex size-4.5 items-center justify-center rounded-full bg-yellow text-caption font-bold text-ink"
        >
          ?
        </span>
        잘 모르겠어요
      </button>

      {open && (
        <div className="flex w-full animate-[fade-in_200ms_ease-out] flex-col gap-2.5">
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                aria-pressed={mode === m.key}
                onClick={() => setMode(m.key)}
                className={`h-9 rounded-full px-3.5 text-label font-medium ${
                  mode === m.key
                    ? "bg-yellow text-ink"
                    : "bg-yellow-light text-ink"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {mode === "hint" && (
            <ul
              role="status"
              className="flex w-full flex-col gap-2 rounded-bubble bg-yellow-light px-4 py-3.5 text-body-sm leading-[1.45] font-medium"
            >
              {help.hints.map((h) => (
                <li key={h} className="flex gap-2">
                  <span aria-hidden="true">💡</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
          {mode === "easier" && (
            <p
              role="status"
              className="w-full rounded-bubble bg-yellow-light px-4 py-3.5 text-body leading-[1.45] font-bold"
            >
              {help.easier}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionHelp;
