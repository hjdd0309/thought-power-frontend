import EmotionCharacter from "@/components/EmotionCharacter";
import { getEmotion } from "@/constants/emotions";
import { getQuestionStep } from "@/constants/diary";
import { formatKoreanDate, parseISODate } from "@/utils/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
// 원고지 한 줄 칸 수 — 모바일 폭(320~402px)에서 칸이 너무 작아지지 않는 값
const GRID_COLUMNS = 12;

const PUNCTUATION = /^[.,!?。…~)」』"']$/;

// 본문을 원고지 칸으로 나눈다: 글자 하나 = 칸 하나, 문단 첫 칸은 비우고 줄바꿈은 남은 칸을 비운다
// 원고지 규칙처럼 줄 첫 칸에 올 문장부호는 앞 줄 마지막 칸에 함께 쓴다
function toManuscriptCells(text) {
  const cells = [];
  (text ?? "").split("\n").forEach((paragraph) => {
    const chars = Array.from(paragraph.trim());
    if (!chars.length) return;
    cells.push("");
    chars.forEach((ch) => {
      const rowStart = cells.length % GRID_COLUMNS === 0;
      if (rowStart && PUNCTUATION.test(ch)) cells[cells.length - 1] += ch;
      else if (rowStart && ch === " ")
        return; // 줄 첫 칸 띄어쓰기는 생략
      else cells.push(ch);
    });
    while (cells.length % GRID_COLUMNS) cells.push("");
  });
  return cells;
}

// 노트 줄 — 질문·답변이 같은 줄 간격(2rem)·시작점·길이를 쓰고 색만 다르다
const RULED_TEXT = "w-full pt-1 leading-8 whitespace-pre-line";
const ruledLines = (color) => ({
  backgroundImage: `linear-gradient(transparent calc(2rem - 1px), ${color} calc(2rem - 1px))`,
  backgroundSize: "100% 2rem",
});

// 그림일기 맨 위 칸 — 왼쪽 제목 칸 + 오른쪽 내용 칸
function HeaderCell({ title, children, className = "" }) {
  return (
    <div className={`flex min-h-11 items-stretch ${className}`}>
      <span className="flex w-20 shrink-0 items-center justify-center border-r-2 border-paper-line text-label font-bold text-muted">
        {title}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-1.5 px-3 text-body-sm font-medium">
        {children}
      </span>
    </div>
  );
}

// 일기 전체 내용 (C13 전체 기록 확인 · E02 일기 상세 공통) — 초등 그림일기장 양식
// 날짜·오늘의 마음 칸 → 그림 칸(감정 이모지) → 원고지 본문 → 선생님 빨간펜 질문과 연필 답
// emptyAnswerText: 답변이 비어 있을 때 대신 보여줄 회색 문구 (없으면 기존처럼 빈칸)
function DiarySummary({
  emotion,
  date,
  content,
  questions = [],
  emptyAnswerText,
}) {
  const e = getEmotion(emotion);
  const cells = toManuscriptCells(content);

  return (
    <div className="flex flex-col gap-5">
      <article className="overflow-hidden rounded-card border-2 border-paper-line bg-paper">
        <header className="divide-y-2 divide-paper-line border-b-2 border-paper-line">
          <HeaderCell title="날짜">
            {date && (
              <>
                {formatKoreanDate(date)} {WEEKDAYS[parseISODate(date).getDay()]}
                요일
              </>
            )}
          </HeaderCell>
          <HeaderCell title="오늘의 마음">
            {e && (
              <>
                <EmotionCharacter emotion={emotion} size={28} />
                {e.label}
              </>
            )}
          </HeaderCell>
        </header>

        {/* 그림 칸 — 오늘 감정 이모지를 크게 */}
        <div
          className="flex h-50 items-end justify-center border-b-2 border-paper-line pb-5"
          style={{
            backgroundColor: e
              ? `color-mix(in srgb, ${e.color} 18%, white)`
              : undefined,
          }}
        >
          {e && <EmotionCharacter emotion={emotion} size={150} />}
        </div>

        {/* 원고지 본문 — 화면 읽기 프로그램에는 칸 대신 본문 전체를 읽어 준다 */}
        <p className="sr-only">{content}</p>
        <div
          aria-hidden="true"
          className="grid p-3"
          style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)` }}
        >
          {cells.map((ch, i) => (
            <span
              key={i}
              className="-mt-px -ml-px flex aspect-square items-center justify-center border border-paper-line text-[clamp(13px,4.2vw,17px)] leading-none font-medium"
            >
              {ch}
            </span>
          ))}
        </div>
      </article>

      {/* 선생님 빨간펜 메모 — 질문은 빨간 손글씨, 답은 연필 글씨 */}
      {questions.map((q) => {
        const empty = !q.answer?.trim();
        return (
          <section
            key={q.order}
            className="relative flex flex-col gap-2.5 rounded-card border-2 border-dashed border-red-pen/35 bg-paper px-5 pt-4 pb-5 break-words"
          >
            <p className="flex items-center gap-1.5 text-label font-bold text-red-pen">
              <span className="flex size-5.5 items-center justify-center rounded-full border-2 border-red-pen text-caption">
                {q.order}
              </span>
              {getQuestionStep(q.order)?.label}
            </p>
            <p
              className={`${RULED_TEXT} font-logo text-title text-red-pen`}
              style={ruledLines(
                "color-mix(in srgb, var(--color-red-pen) 35%, transparent)",
              )}
            >
              {q.content}
            </p>
            {empty && emptyAnswerText ? (
              <p className="text-body leading-[1.45] font-medium text-muted">
                {emptyAnswerText}
              </p>
            ) : (
              <p
                className={`${RULED_TEXT} text-body font-medium text-pencil`}
                style={ruledLines("var(--color-paper-line)")}
              >
                {q.answer}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default DiarySummary;
