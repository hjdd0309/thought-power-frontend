import { getEmotion } from "@/constants/emotions";
import { getQuestionStep } from "@/constants/diary";
import { formatKoreanDate } from "@/utils/date";

// 일기 전체 내용 (C13 전체 기록 확인 · E02 일기 상세 공통)
// 오늘의 일기(#FFF7C4 카드) + 질문과 나의 답 1~3
function DiarySummary({ emotion, date, content, questions = [] }) {
  const e = getEmotion(emotion);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-card bg-yellow-light p-5">
        <div className="flex h-8 items-center gap-3">
          {e && <img src={e.icon} alt="" width={30} height={30} />}
          <p className="text-label font-medium whitespace-pre-wrap">
            {e?.label}
            {"  ·  "}
            {date && formatKoreanDate(date)}
          </p>
        </div>
        <p className="text-body leading-[1.45] font-medium whitespace-pre-line">
          {content}
        </p>
      </section>

      {questions.map((q) => (
        <section
          key={q.order}
          className="flex flex-col gap-3 rounded-card border border-border-neutral bg-white p-5 break-words"
        >
          <p className="text-label font-medium text-muted">
            {getQuestionStep(q.order)?.label}
          </p>
          <p className="text-body leading-[1.45] font-bold">{q.content}</p>
          <p className="text-body leading-[1.45] font-medium whitespace-pre-line">
            {q.answer}
          </p>
        </section>
      ))}
    </div>
  );
}

export default DiarySummary;
